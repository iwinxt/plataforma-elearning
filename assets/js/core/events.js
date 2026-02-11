// events.js - Sistema de Event Bus para comunicação entre componentes

const EventBus = {
    events: {},
    
    // Registrar listener para um evento
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        
        this.events[event].push(callback);
        
        // Retorna função para remover o listener
        return () => this.off(event, callback);
    },
    
    // Registrar listener que executa apenas uma vez
    once(event, callback) {
        const onceWrapper = (...args) => {
            callback(...args);
            this.off(event, onceWrapper);
        };
        
        return this.on(event, onceWrapper);
    },
    
    // Remover listener específico
    off(event, callback) {
        if (!this.events[event]) return;
        
        this.events[event] = this.events[event].filter(cb => cb !== callback);
        
        if (this.events[event].length === 0) {
            delete this.events[event];
        }
    },
    
    // Emitir evento
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
    },
    
    // Remover todos os listeners de um evento
    clear(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    },
    
    // Verificar se há listeners para um evento
    hasListeners(event) {
        return !!(this.events[event] && this.events[event].length > 0);
    },
    
    // Listar todos os eventos registrados
    listEvents() {
        return Object.keys(this.events);
    }
};

// Eventos globais da aplicação
const APP_EVENTS = {
    // Auth
    AUTH_LOGIN: 'auth:login',
    AUTH_LOGOUT: 'auth:logout',
    AUTH_SESSION_EXPIRED: 'auth:session-expired',
    AUTH_SESSION_CONFLICT: 'auth:session-conflict',
    
    // User
    USER_UPDATED: 'user:updated',
    USER_PREFERENCES_CHANGED: 'user:preferences-changed',
    
    // Course
    COURSE_ENROLLED: 'course:enrolled',
    COURSE_COMPLETED: 'course:completed',
    
    // Lesson
    LESSON_STARTED: 'lesson:started',
    LESSON_COMPLETED: 'lesson:completed',
    LESSON_PROGRESS: 'lesson:progress',
    
    // Video
    VIDEO_PLAY: 'video:play',
    VIDEO_PAUSE: 'video:pause',
    VIDEO_ENDED: 'video:ended',
    VIDEO_TIME_UPDATE: 'video:time-update',
    VIDEO_QUALITY_CHANGED: 'video:quality-changed',
    
    // Quiz
    QUIZ_STARTED: 'quiz:started',
    QUIZ_COMPLETED: 'quiz:completed',
    QUIZ_SUBMITTED: 'quiz:submitted',
    
    // Navigation
    ROUTE_CHANGED: 'route:changed',
    PAGE_LOADED: 'page:loaded',
    
    // UI
    MODAL_OPENED: 'modal:opened',
    MODAL_CLOSED: 'modal:closed',
    NOTIFICATION_SHOWN: 'notification:shown',
    THEME_CHANGED: 'theme:changed',
    
    // Network
    ONLINE: 'network:online',
    OFFLINE: 'network:offline',
    
    // Error
    ERROR: 'error',
    API_ERROR: 'api:error'
};

Object.freeze(APP_EVENTS);