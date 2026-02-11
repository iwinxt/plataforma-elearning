// api.js - Cliente HTTP centralizado para comunicação com a API

const API = {
    // Request counter para rate limiting
    requestCounter: [],
    
    // Request queue para retry
    requestQueue: [],
    
    // Abort controllers ativos
    abortControllers: new Map(),
    
    // Fazer requisição HTTP
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            auth = true,
            timeout = APP_CONFIG.API_TIMEOUT,
            retry = true,
            cache = false,
            signal = null
        } = options;
        
        // Check rate limit
        if (!this.checkRateLimit()) {
            throw new Error(APP_CONFIG.ERROR_MESSAGES.RATE_LIMIT);
        }
        
        // Check cache
        if (cache && method === 'GET') {
            const cached = this.getFromCache(endpoint);
            if (cached) return cached;
        }
        
        // Build URL
        const url = endpoint.startsWith('http') ? endpoint : APP_CONFIG.API_BASE_URL + endpoint;
        
        // Build headers
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };
        
        // Add auth token
        if (auth) {
            const token = AuthService.getToken();
            if (token) {
                requestHeaders['Authorization'] = `Bearer ${token}`;
            }
        }
        
        // Build config
        const config = {
            method,
            headers: requestHeaders
        };
        
        if (body) {
            config.body = JSON.stringify(body);
        }
        
        // Create abort controller
        const controller = signal ? { signal } : new AbortController();
        config.signal = controller.signal;
        
        // Store controller for potential cancellation
        const requestId = this.generateRequestId();
        if (!signal) {
            this.abortControllers.set(requestId, controller);
        }
        
        // Set timeout
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);
        
        try {
            // Make request
            const response = await fetch(url, config);
            
            clearTimeout(timeoutId);
            this.abortControllers.delete(requestId);
            
            // Track request for rate limiting
            this.trackRequest();
            
            // Handle response
            return await this.handleResponse(response, endpoint, options, retry);
            
        } catch (error) {
            clearTimeout(timeoutId);
            this.abortControllers.delete(requestId);
            
            if (error.name === 'AbortError') {
                throw new Error('Requisição cancelada');
            }
            
            // Retry logic
            if (retry && this.shouldRetry(error)) {
                return this.retryRequest(endpoint, options);
            }
            
            throw this.handleError(error);
        }
    },
    
    // Handle response
    async handleResponse(response, endpoint, options, retry) {
        // Token expired - try refresh
        if (response.status === 401) {
            const refreshed = await AuthService.refreshToken();
            if (refreshed && retry) {
                return this.request(endpoint, { ...options, retry: false });
            }
            
            EventBus.emit(APP_EVENTS.AUTH_SESSION_EXPIRED);
            throw new Error(APP_CONFIG.ERROR_MESSAGES.UNAUTHORIZED);
        }
        
        // Session conflict
        if (response.status === 409) {
            EventBus.emit(APP_EVENTS.AUTH_SESSION_CONFLICT);
            throw new Error(APP_CONFIG.ERROR_MESSAGES.SESSION_CONFLICT);
        }
        
        // Parse response
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        // Handle error responses
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || this.getErrorMessage(response.status),
                data: data
            };
        }
        
        // Cache successful GET requests
        if (options.cache && options.method === 'GET') {
            this.saveToCache(endpoint, data);
        }
        
        return data;
    },
    
    // Handle errors
    handleError(error) {
        console.error('API Error:', error);
        
        EventBus.emit(APP_EVENTS.API_ERROR, error);
        
        if (!navigator.onLine) {
            return new Error(APP_CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
        }
        
        if (error.status) {
            return error;
        }
        
        return new Error(APP_CONFIG.ERROR_MESSAGES.SERVER_ERROR);
    },
    
    // Get error message by status code
    getErrorMessage(status) {
        const messages = {
            400: APP_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR,
            401: APP_CONFIG.ERROR_MESSAGES.UNAUTHORIZED,
            403: APP_CONFIG.ERROR_MESSAGES.FORBIDDEN,
            404: APP_CONFIG.ERROR_MESSAGES.NOT_FOUND,
            409: APP_CONFIG.ERROR_MESSAGES.SESSION_CONFLICT,
            429: APP_CONFIG.ERROR_MESSAGES.RATE_LIMIT,
            500: APP_CONFIG.ERROR_MESSAGES.SERVER_ERROR
        };
        
        return messages[status] || APP_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
    },
    
    // Retry request
    async retryRequest(endpoint, options, attempt = 1) {
        const maxAttempts = APP_CONFIG.MAX_RETRY_ATTEMPTS || 3;
        
        if (attempt > maxAttempts) {
            throw new Error('Máximo de tentativas excedido');
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
            return await this.request(endpoint, { ...options, retry: false });
        } catch (error) {
            if (this.shouldRetry(error)) {
                return this.retryRequest(endpoint, options, attempt + 1);
            }
            throw error;
        }
    },
    
    // Check if should retry
    shouldRetry(error) {
        const retryStatuses = [408, 429, 500, 502, 503, 504];
        return error.status && retryStatuses.includes(error.status);
    },
    
    // Rate limiting
    checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Remove old requests
        this.requestCounter = this.requestCounter.filter(time => time > oneMinuteAgo);
        
        return this.requestCounter.length < APP_CONFIG.MAX_API_CALLS_PER_MINUTE;
    },
    
    trackRequest() {
        this.requestCounter.push(Date.now());
    },
    
    // Cache management
    cache: new Map(),
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > APP_CONFIG.CACHE_DURATION;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    },
    
    saveToCache(key, data) {
        // Limit cache size
        if (this.cache.size >= APP_CONFIG.CACHE_MAX_ITEMS) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    },
    
    clearCache() {
        this.cache.clear();
    },
    
    // Cancel request
    cancelRequest(requestId) {
        const controller = this.abortControllers.get(requestId);
        if (controller) {
            controller.abort();
            this.abortControllers.delete(requestId);
        }
    },
    
    cancelAllRequests() {
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
    },
    
    generateRequestId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Convenience methods
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },
    
    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    },
    
    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    },
    
    patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    },
    
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },
    
    // Upload file
    async upload(endpoint, file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = AuthService.getToken();
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };
        
        const response = await fetch(APP_CONFIG.API_BASE_URL + endpoint, {
            method: 'POST',
            headers,
            body: formData
        });
        
        return this.handleResponse(response, endpoint, options, false);
    }
};

// Network status monitoring
window.addEventListener('online', () => {
    EventBus.emit(APP_EVENTS.ONLINE);
    NotificationService.show('Conexão restaurada', 'success');
});

window.addEventListener('offline', () => {
    EventBus.emit(APP_EVENTS.OFFLINE);
    NotificationService.show('Sem conexão com a internet', 'warning');
});