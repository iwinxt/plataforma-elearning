// state.js - Gerenciamento de estado global da aplicação

const State = {
    // Estado inicial
    state: {
        user: null,
        isAuthenticated: false,
        currentCourse: null,
        currentLesson: null,
        theme: 'light',
        preferences: {},
        notifications: [],
        loading: false,
        error: null
    },
    
    // Listeners para mudanças de estado
    listeners: {},
    
    // Inicializar estado
    init() {
        // Carregar preferências salvas
        const savedTheme = Storage.get(APP_CONFIG.STORAGE_KEYS.THEME);
        if (savedTheme) {
            this.state.theme = savedTheme;
            this.applyTheme(savedTheme);
        }
        
        const savedPreferences = Storage.get(APP_CONFIG.STORAGE_KEYS.PREFERENCES);
        if (savedPreferences) {
            this.state.preferences = savedPreferences;
        }
        
        // Carregar usuário se houver sessão ativa
        const user = Storage.getSecure(APP_CONFIG.STORAGE_KEYS.USER);
        if (user) {
            this.setState({ user, isAuthenticated: true });
        }
    },
    
    // Get state
    getState() {
        return { ...this.state };
    },
    
    // Set state (parcial)
    setState(updates) {
        const prevState = { ...this.state };
        
        this.state = {
            ...this.state,
            ...updates
        };
        
        // Notificar listeners
        this.notifyListeners(prevState, this.state);
    },
    
    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        
        this.listeners[key].push(callback);
        
        // Retorna função de unsubscribe
        return () => {
            this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
        };
    },
    
    // Notificar listeners
    notifyListeners(prevState, newState) {
        Object.keys(newState).forEach(key => {
            if (prevState[key] !== newState[key] && this.listeners[key]) {
                this.listeners[key].forEach(callback => {
                    try {
                        callback(newState[key], prevState[key]);
                    } catch (error) {
                        console.error(`Error in state listener for "${key}":`, error);
                    }
                });
            }
        });
        
        // Notificar listeners globais
        if (this.listeners['*']) {
            this.listeners['*'].forEach(callback => {
                try {
                    callback(newState, prevState);
                } catch (error) {
                    console.error('Error in global state listener:', error);
                }
            });
        }
    },
    
    // User state helpers
    setUser(user) {
        this.setState({ user, isAuthenticated: true });
        Storage.setSecure(APP_CONFIG.STORAGE_KEYS.USER, user);
    },
    
    clearUser() {
        this.setState({ user: null, isAuthenticated: false });
        Storage.remove(APP_CONFIG.STORAGE_KEYS.USER);
    },
    
    getUser() {
        return this.state.user;
    },
    
    isAuthenticated() {
        return this.state.isAuthenticated;
    },
    
    // Theme helpers
    setTheme(theme) {
        this.setState({ theme });
        this.applyTheme(theme);
        Storage.set(APP_CONFIG.STORAGE_KEYS.THEME, theme);
        EventBus.emit(APP_EVENTS.THEME_CHANGED, theme);
    },
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    },
    
    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    // Preferences helpers
    setPreferences(preferences) {
        this.setState({ preferences });
        Storage.set(APP_CONFIG.STORAGE_KEYS.PREFERENCES, preferences);
        EventBus.emit(APP_EVENTS.USER_PREFERENCES_CHANGED, preferences);
    },
    
    updatePreference(key, value) {
        const preferences = {
            ...this.state.preferences,
            [key]: value
        };
        this.setPreferences(preferences);
    },
    
    getPreference(key, defaultValue = null) {
        return this.state.preferences[key] || defaultValue;
    },
    
    // Current course/lesson helpers
    setCurrentCourse(course) {
        this.setState({ currentCourse: course });
    },
    
    setCurrentLesson(lesson) {
        this.setState({ currentLesson: lesson });
    },
    
    // Loading state
    setLoading(loading) {
        this.setState({ loading });
    },
    
    // Error state
    setError(error) {
        this.setState({ error });
        
        if (error) {
            console.error('Application error:', error);
            EventBus.emit(APP_EVENTS.ERROR, error);
        }
    },
    
    clearError() {
        this.setState({ error: null });
    },
    
    // Notifications
    addNotification(notification) {
        const notifications = [...this.state.notifications, notification];
        this.setState({ notifications });
    },
    
    removeNotification(id) {
        const notifications = this.state.notifications.filter(n => n.id !== id);
        this.setState({ notifications });
    },
    
    clearNotifications() {
        this.setState({ notifications: [] });
    },
    
    // Reset state
    reset() {
        this.state = {
            user: null,
            isAuthenticated: false,
            currentCourse: null,
            currentLesson: null,
            theme: this.state.theme, // Manter tema
            preferences: {},
            notifications: [],
            loading: false,
            error: null
        };
    }
};

// Inicializar estado ao carregar
State.init();