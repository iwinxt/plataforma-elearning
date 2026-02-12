// rate-limit.middleware.js - Middleware de proteção contra abuso

const RateLimitMiddleware = {
    // Registro de navegações
    _navigationLog: [],
    
    // Máximo de navegações por minuto
    _maxNavigationsPerMinute: 30,
    
    // Registro de tentativas de login
    _loginAttempts: [],
    
    // Processar middleware
    async handle(path, meta) {
        // Verificar rate limit de navegação
        if (!this.checkNavigationRate()) {
            NotificationService.show(
                'Muitas navegações em sequência. Aguarde um momento.',
                'warning'
            );
            return false;
        }
        
        // Registrar navegação
        this.logNavigation(path);
        
        return true;
    },
    
    // Verificar rate limit de navegação
    checkNavigationRate() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Remover entradas antigas
        this._navigationLog = this._navigationLog.filter(
            time => time > oneMinuteAgo
        );
        
        return this._navigationLog.length < this._maxNavigationsPerMinute;
    },
    
    // Registrar navegação
    logNavigation(path) {
        this._navigationLog.push(Date.now());
    },
    
    // Verificar rate limit de login
    checkLoginRate(identifier) {
        const key = `login_attempts_${CryptoUtils.hash(identifier)}`;
        const stored = Storage.get(key);
        
        if (!stored) {
            return { allowed: true, remainingAttempts: APP_CONFIG.MAX_LOGIN_ATTEMPTS };
        }
        
        const now = Date.now();
        
        // Verificar se ainda está em lockout
        if (stored.lockedUntil && now < stored.lockedUntil) {
            const remainingMs = stored.lockedUntil - now;
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            
            return {
                allowed: false,
                lockedUntil: stored.lockedUntil,
                remainingMinutes,
                remainingAttempts: 0
            };
        }
        
        // Limpar lockout expirado
        if (stored.lockedUntil && now >= stored.lockedUntil) {
            Storage.remove(key);
            return { allowed: true, remainingAttempts: APP_CONFIG.MAX_LOGIN_ATTEMPTS };
        }
        
        const remainingAttempts = APP_CONFIG.MAX_LOGIN_ATTEMPTS - stored.attempts;
        
        return {
            allowed: remainingAttempts > 0,
            remainingAttempts: Math.max(0, remainingAttempts),
            attempts: stored.attempts
        };
    },
    
    // Registrar tentativa de login
    recordLoginAttempt(identifier, success) {
        const key = `login_attempts_${CryptoUtils.hash(identifier)}`;
        
        if (success) {
            // Limpar tentativas em caso de sucesso
            Storage.remove(key);
            return;
        }
        
        const stored = Storage.get(key) || { attempts: 0 };
        stored.attempts += 1;
        stored.lastAttempt = Date.now();
        
        // Aplicar lockout se atingiu limite
        if (stored.attempts >= APP_CONFIG.MAX_LOGIN_ATTEMPTS) {
            stored.lockedUntil = Date.now() + APP_CONFIG.LOGIN_LOCKOUT_DURATION;
            
            NotificationService.show(
                `Conta temporariamente bloqueada por ${APP_CONFIG.LOGIN_LOCKOUT_DURATION / 60000} minutos.`,
                'error',
                10000
            );
        }
        
        Storage.setWithExpiry(key, stored, APP_CONFIG.LOGIN_LOCKOUT_DURATION * 2);
    },
    
    // Verificar se IP/usuario está bloqueado
    isBlocked(identifier) {
        const result = this.checkLoginRate(identifier);
        return !result.allowed;
    },
    
    // Limpar tentativas
    clearAttempts(identifier) {
        const key = `login_attempts_${CryptoUtils.hash(identifier)}`;
        Storage.remove(key);
    }
};