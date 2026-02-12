// analytics.service.js - Serviço de rastreamento e métricas

const AnalyticsService = {
    // Fila de eventos
    _eventQueue: [],
    
    // Timer de flush
    _flushTimer: null,
    
    // Session ID único
    _sessionId: null,
    
    // Página atual
    _currentPage: null,
    
    // Inicializar serviço
    init() {
        if (!APP_CONFIG.FEATURES.ENABLE_ANALYTICS) return;
        
        this._sessionId = CryptoUtils.generateUUID();
        
        // Flush periódico
        this._flushTimer = setInterval(() => {
            this.flush();
        }, 30000); // 30 segundos
        
        // Flush ao fechar página
        window.addEventListener('beforeunload', () => {
            this.flush(true);
        });
        
        // Rastrear mudanças de rota
        EventBus.on(APP_EVENTS.PAGE_LOADED, ({ path }) => {
            this.trackPageView(path);
        });
        
        // Rastrear eventos de vídeo
        EventBus.on(APP_EVENTS.VIDEO_PLAY, () => {
            this.track('video_play', this.getVideoContext());
        });
        
        EventBus.on(APP_EVENTS.VIDEO_PAUSE, () => {
            this.track('video_pause', this.getVideoContext());
        });
        
        EventBus.on(APP_EVENTS.VIDEO_ENDED, (data) => {
            this.track('video_ended', { ...this.getVideoContext(), ...data });
        });
        
        // Rastrear conclusões
        EventBus.on(APP_EVENTS.LESSON_COMPLETED, (data) => {
            this.track('lesson_completed', data);
        });
        
        EventBus.on(APP_EVENTS.COURSE_COMPLETED, (data) => {
            this.track('course_completed', { courseId: data.id });
        });
    },
    
    // Rastrear evento
    track(eventName, properties = {}) {
        if (!APP_CONFIG.FEATURES.ENABLE_ANALYTICS) return;
        
        const event = {
            event: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                sessionId: this._sessionId,
                userId: State.getUser()?.id || null,
                page: window.location.pathname,
                userAgent: navigator.userAgent,
                screenSize: `${screen.width}x${screen.height}`,
                language: navigator.language
            }
        };
        
        this._eventQueue.push(event);
        
        if (ENV.isDevelopment) {
            console.log('📊 Analytics Event:', event);
        }
        
        // Flush se queue estiver grande
        if (this._eventQueue.length >= 20) {
            this.flush();
        }
    },
    
    // Rastrear visualização de página
    trackPageView(path) {
        this._currentPage = path;
        
        this.track('page_view', {
            path,
            title: document.title,
            referrer: document.referrer
        });
    },
    
    // Rastrear evento de vídeo com contexto
    trackVideoWatch(lessonId, watchedSeconds, totalSeconds) {
        const percentage = Math.round((watchedSeconds / totalSeconds) * 100);
        
        this.track('video_watch', {
            lessonId,
            watchedSeconds: Math.floor(watchedSeconds),
            totalSeconds: Math.floor(totalSeconds),
            percentage
        });
    },
    
    // Obter contexto do vídeo atual
    getVideoContext() {
        const lesson = State.getState().currentLesson;
        const course = State.getState().currentCourse;
        
        return {
            lessonId: lesson?.id,
            lessonTitle: lesson?.title,
            courseId: course?.id,
            courseTitle: course?.title
        };
    },
    
    // Enviar eventos para a API
    async flush(sync = false) {
        if (this._eventQueue.length === 0) return;
        
        const events = [...this._eventQueue];
        this._eventQueue = [];
        
        try {
            if (sync && navigator.sendBeacon) {
                // Usar sendBeacon para garantia no beforeunload
                const data = JSON.stringify({ events });
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon(
                    APP_CONFIG.API_BASE_URL + API_ENDPOINTS.ANALYTICS.TRACK_EVENT,
                    blob
                );
            } else {
                await API.post(API_ENDPOINTS.ANALYTICS.TRACK_EVENT, { events });
            }
        } catch (error) {
            // Recolocar eventos na queue em caso de erro
            this._eventQueue = [...events, ...this._eventQueue];
            
            if (ENV.isDevelopment) {
                console.error('Analytics flush error:', error);
            }
        }
    },
    
    // Destruir serviço
    destroy() {
        if (this._flushTimer) {
            clearInterval(this._flushTimer);
        }
        this.flush(true);
    }
};