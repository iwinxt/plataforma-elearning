// auth.service.js - Serviço de autenticação e gerenciamento de sessão

const AuthService = {
    // WebSocket para monitoramento de sessão
    sessionWs: null,
    
    // Timer para refresh de token
    refreshTimer: null,
    
    // Login
    async login(email, password) {
        try {
            const response = await API.post(API_ENDPOINTS.AUTH.LOGIN, {
                email: Validators.sanitize(email.trim()),
                password,
                fingerprint: CryptoUtils.generateFingerprint()
            }, { auth: false });
            
            // Salvar tokens
            this.saveTokens(
                response.data.access_token,
                response.data.refresh_token,
                response.data.expires_in
            );
            
            // Salvar dados do usuário
            State.setUser(response.data.user);
            
            // Iniciar monitoramento de sessão
            this.startSessionMonitor(response.data.session_id);
            
            // Agendar refresh de token
            this.scheduleTokenRefresh(response.data.expires_in);
            
            // Emit login event
            EventBus.emit(APP_EVENTS.AUTH_LOGIN, response.data.user);
            
            // Analytics
            AnalyticsService.track('user_login', {
                userId: response.data.user.id,
                method: 'email'
            });
            
            return response.data.user;
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    // Register
    async register(userData) {
        try {
            const { name, email, password } = userData;
            
            const response = await API.post(API_ENDPOINTS.AUTH.REGISTER, {
                name: Validators.sanitize(name.trim()),
                email: Validators.sanitize(email.trim()),
                password,
                fingerprint: CryptoUtils.generateFingerprint()
            }, { auth: false });
            
            // Salvar tokens
            this.saveTokens(
                response.data.access_token,
                response.data.refresh_token,
                response.data.expires_in
            );
            
            // Salvar usuário
            State.setUser(response.data.user);
            
            // Iniciar sessão
            this.startSessionMonitor(response.data.session_id);
            this.scheduleTokenRefresh(response.data.expires_in);
            
            EventBus.emit(APP_EVENTS.AUTH_LOGIN, response.data.user);
            
            AnalyticsService.track('user_register', {
                userId: response.data.user.id
            });
            
            return response.data.user;
            
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },
    
    // Logout
    async logout() {
        try {
            const token = this.getToken();
            
            if (token) {
                await API.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { auth: true }).catch(() => {});
            }
            
        } finally {
            this.clearSession();
            EventBus.emit(APP_EVENTS.AUTH_LOGOUT);
        }
    },
    
    // Forgot Password
    async forgotPassword(email) {
        return await API.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            email: Validators.sanitize(email.trim())
        }, { auth: false });
    },
    
    // Reset Password
    async resetPassword(token, password, passwordConfirmation) {
        return await API.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            token,
            password,
            password_confirmation: passwordConfirmation
        }, { auth: false });
    },
    
    // Verify Email
    async verifyEmail(token) {
        return await API.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }, { auth: false });
    },
    
    // Check existing session
    async checkSession() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const response = await API.get(API_ENDPOINTS.AUTH.CHECK_SESSION);
            
            State.setUser(response.data.user);
            
            this.startSessionMonitor(response.data.session_id);
            this.scheduleTokenRefresh(response.data.expires_in);
            
            return true;
            
        } catch (error) {
            this.clearSession();
            return false;
        }
    },
    
    // Refresh token
    async refreshToken() {
        const refreshToken = Storage.getSecure(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) return false;
        
        try {
            const response = await API.post(API_ENDPOINTS.AUTH.REFRESH, {
                refresh_token: refreshToken
            }, { auth: false });
            
            this.saveTokens(
                response.data.access_token,
                response.data.refresh_token,
                response.data.expires_in
            );
            
            this.scheduleTokenRefresh(response.data.expires_in);
            
            return true;
            
        } catch (error) {
            this.clearSession();
            return false;
        }
    },
    
    // Save tokens
    saveTokens(accessToken, refreshToken, expiresIn) {
        Storage.setSecure(APP_CONFIG.STORAGE_KEYS.TOKEN, accessToken);
        Storage.setSecure(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        
        const expiresAt = Date.now() + (expiresIn * 1000);
        Storage.set('token_expires_at', expiresAt);
    },
    
    // Get token
    getToken() {
        return Storage.getSecure(APP_CONFIG.STORAGE_KEYS.TOKEN);
    },
    
    // Schedule token refresh
    scheduleTokenRefresh(expiresIn) {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        // Refresh 5 minutos antes de expirar
        const refreshIn = (expiresIn * 1000) - APP_CONFIG.TOKEN_REFRESH_THRESHOLD;
        
        if (refreshIn > 0) {
            this.refreshTimer = setTimeout(() => {
                this.refreshToken();
            }, refreshIn);
        }
    },
    
    // Start session monitor via WebSocket
    startSessionMonitor(sessionId) {
        if (this.sessionWs) {
            this.sessionWs.close();
        }
        
        const wsUrl = APP_CONFIG.API_BASE_URL
            .replace('http://', 'ws://')
            .replace('https://', 'wss://')
            .replace('/api', '') + `/ws/session/${sessionId}`;
        
        try {
            this.sessionWs = new WebSocket(wsUrl);
            
            this.sessionWs.onopen = () => {
                if (ENV.isDevelopment) {
                    console.log('Session WebSocket connected');
                }
            };
            
            this.sessionWs.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'SESSION_TERMINATED':
                        EventBus.emit(APP_EVENTS.AUTH_SESSION_CONFLICT);
                        this.clearSession();
                        break;
                    
                    case 'SESSION_EXPIRED':
                        EventBus.emit(APP_EVENTS.AUTH_SESSION_EXPIRED);
                        this.clearSession();
                        break;
                    
                    case 'PING':
                        this.sessionWs.send(JSON.stringify({ type: 'PONG' }));
                        break;
                }
            };
            
            this.sessionWs.onclose = (event) => {
                if (!event.wasClean && State.isAuthenticated()) {
                    // Tentar reconectar após 5 segundos
                    setTimeout(() => {
                        if (State.isAuthenticated()) {
                            this.checkSession();
                        }
                    }, 5000);
                }
            };
            
            this.sessionWs.onerror = (error) => {
                console.error('Session WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Error creating session WebSocket:', error);
            
            // Fallback: polling
            this.startSessionPolling();
        }
    },
    
    // Fallback: session polling
    startSessionPolling() {
        if (this._sessionPollTimer) {
            clearInterval(this._sessionPollTimer);
        }
        
        this._sessionPollTimer = setInterval(async () => {
            if (!State.isAuthenticated()) {
                clearInterval(this._sessionPollTimer);
                return;
            }
            
            try {
                await API.get(API_ENDPOINTS.AUTH.CHECK_SESSION);
            } catch (error) {
                if (error.status === 401) {
                    EventBus.emit(APP_EVENTS.AUTH_SESSION_EXPIRED);
                    this.clearSession();
                    clearInterval(this._sessionPollTimer);
                }
            }
        }, APP_CONFIG.SESSION_CHECK_INTERVAL);
    },
    
    // Clear session
    clearSession() {
        Storage.remove(APP_CONFIG.STORAGE_KEYS.TOKEN);
        Storage.remove(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        Storage.remove(APP_CONFIG.STORAGE_KEYS.SESSION);
        Storage.remove(APP_CONFIG.STORAGE_KEYS.USER);
        Storage.remove('token_expires_at');
        
        if (this.sessionWs) {
            this.sessionWs.close();
            this.sessionWs = null;
        }
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        if (this._sessionPollTimer) {
            clearInterval(this._sessionPollTimer);
            this._sessionPollTimer = null;
        }
        
        State.clearUser();
        API.clearCache();
    },
    
    // Check if token is expired
    isTokenExpired() {
        const expiresAt = Storage.get('token_expires_at');
        if (!expiresAt) return true;
        return Date.now() >= expiresAt;
    },
    
    // Get current user
    getCurrentUser() {
        return State.getUser();
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return State.isAuthenticated() && !this.isTokenExpired();
    },
    
    // Check user role
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },
    
    // Check if user has any of the roles
    hasAnyRole(roles) {
        const user = this.getCurrentUser();
        return user && roles.includes(user.role);
    }
};