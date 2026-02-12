// session.middleware.js - Middleware de controle de sessão única

const SessionMiddleware = {
    // Timestamp do último check
    _lastCheck: 0,
    
    // Intervalo mínimo entre checks (ms)
    _checkInterval: 30000,
    
    // Processar middleware
    async handle(path, meta) {
        // Só verificar sessão em rotas protegidas
        if (!meta.requiresAuth && !AuthMiddleware.isProtectedRoute(path)) {
            return true;
        }
        
        // Não verificar se usuário não está autenticado
        if (!AuthService.isAuthenticated()) {
            return true;
        }
        
        // Throttle: não verificar com muita frequência
        const now = Date.now();
        if (now - this._lastCheck < this._checkInterval) {
            return true;
        }
        
        this._lastCheck = now;
        
        return await this.validateSession();
    },
    
    // Validar sessão com o servidor
    async validateSession() {
        try {
            await API.get(API_ENDPOINTS.AUTH.CHECK_SESSION, {
                timeout: 5000
            });
            return true;
            
        } catch (error) {
            if (error.status === 401) {
                // Tentar renovar token
                const refreshed = await AuthService.refreshToken();
                if (!refreshed) {
                    EventBus.emit(APP_EVENTS.AUTH_SESSION_EXPIRED);
                    return false;
                }
                return true;
            }
            
            if (error.status === 409) {
                EventBus.emit(APP_EVENTS.AUTH_SESSION_CONFLICT);
                return false;
            }
            
            // Para outros erros, permitir continuar
            return true;
        }
    },
    
    // Forçar verificação imediata
    forceCheck() {
        this._lastCheck = 0;
    },
    
    // Resetar middleware
    reset() {
        this._lastCheck = 0;
    }
};