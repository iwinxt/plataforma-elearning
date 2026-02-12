// app.js - Inicialização e orquestração da aplicação

const App = {
    // Versão da aplicação
    version: APP_CONFIG.APP_VERSION,
    
    // Estado de inicialização
    initialized: false,
    
    // Inicializar aplicação
    async init() {
        try {
            console.log(`🚀 ${APP_CONFIG.APP_NAME} v${this.version} iniciando...`);
            
            // Remover loader inicial
            this.removeInitialLoader();
            
            // Inicializar módulos core
            await this.initCore();
            
            // Inicializar serviços
            await this.initServices();
            
            // Inicializar middlewares
            this.initMiddlewares();
            
            // Inicializar router (deve ser o último)
            Router.init();
            
            // Marcar como inicializado
            this.initialized = true;
            
            console.log(`✅ ${APP_CONFIG.APP_NAME} iniciado com sucesso!`);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.handleInitError(error);
        }
    },
    
    // Remover loader inicial do HTML
    removeInitialLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s ease';
            setTimeout(() => loader.remove(), 300);
        }
    },
    
    // Inicializar módulos core
    async initCore() {
        // Estado global
        State.init();
        
        // Aplicar tema salvo
        const savedTheme = Storage.get(APP_CONFIG.STORAGE_KEYS.THEME) || 'light';
        State.applyTheme(savedTheme);
        
        // Configurar event listeners globais
        this.setupGlobalEventListeners();
        
        // Configurar SEO padrão
        SEO.updateMeta(APP_CONFIG.DEFAULT_META);
    },
    
    // Inicializar serviços
    async initServices() {
        // Verificar sessão existente
        await AuthService.checkSession();
        
        // Inicializar analytics se habilitado
        if (APP_CONFIG.FEATURES.ENABLE_ANALYTICS) {
            AnalyticsService.init();
        }
    },
    
    // Inicializar middlewares
    initMiddlewares() {
        // Rate limiting
        Router.use(RateLimitMiddleware.handle.bind(RateLimitMiddleware));
        
        // Session validation
        Router.use(SessionMiddleware.handle.bind(SessionMiddleware));
        
        // Auth check
        Router.use(AuthMiddleware.handle.bind(AuthMiddleware));
    },
    
    // Setup global event listeners
    setupGlobalEventListeners() {
        // Auth events
        EventBus.on(APP_EVENTS.AUTH_LOGIN, (user) => {
            State.setUser(user);
            NotificationService.show(APP_CONFIG.SUCCESS_MESSAGES.LOGIN, 'success');
        });
        
        EventBus.on(APP_EVENTS.AUTH_LOGOUT, () => {
            State.clearUser();
            Storage.remove(APP_CONFIG.STORAGE_KEYS.TOKEN);
            Storage.remove(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            Storage.remove(APP_CONFIG.STORAGE_KEYS.SESSION);
            API.clearCache();
            Router.navigate(ROUTES.LOGIN, true);
        });
        
        EventBus.on(APP_EVENTS.AUTH_SESSION_EXPIRED, () => {
            State.clearUser();
            NotificationService.show(APP_CONFIG.ERROR_MESSAGES.UNAUTHORIZED, 'warning');
            Router.navigate(ROUTES.LOGIN + '?session=expired', true);
        });
        
        EventBus.on(APP_EVENTS.AUTH_SESSION_CONFLICT, () => {
            State.clearUser();
            NotificationService.show(APP_CONFIG.ERROR_MESSAGES.SESSION_CONFLICT, 'error');
            Router.navigate(ROUTES.LOGIN + '?reason=conflict', true);
        });
        
        // Lesson completion
        EventBus.on(APP_EVENTS.LESSON_COMPLETED, (lesson) => {
            NotificationService.show(
                `✅ ${APP_CONFIG.SUCCESS_MESSAGES.LESSON_COMPLETE}`,
                'success'
            );
        });
        
        // Course completion
        EventBus.on(APP_EVENTS.COURSE_COMPLETED, (course) => {
            this.showCourseCompletionModal(course);
        });
        
        // Error handling
        EventBus.on(APP_EVENTS.ERROR, (error) => {
            if (ENV.isDevelopment) {
                console.error('Global Error:', error);
            }
        });
        
        // Network status
        EventBus.on(APP_EVENTS.OFFLINE, () => {
            this.showOfflineBanner();
        });
        
        EventBus.on(APP_EVENTS.ONLINE, () => {
            this.hideOfflineBanner();
            this.syncPendingProgress();
        });
        
        // Theme changes
        EventBus.on(APP_EVENTS.THEME_CHANGED, (theme) => {
            State.applyTheme(theme);
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Global error handler
        window.addEventListener('error', (e) => {
            if (ENV.isProduction) {
                this.logError(e.error);
            }
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            if (ENV.isProduction) {
                this.logError(e.reason);
            }
        });
    },
    
    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Não interfere com inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const currentRoute = Router.getCurrentRoute();
        
        // Atalhos do player de vídeo
        if (currentRoute && currentRoute.path.includes('/player/')) {
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    EventBus.emit('video:toggle-play');
                    break;
                case 'f':
                    e.preventDefault();
                    EventBus.emit('video:toggle-fullscreen');
                    break;
                case 'm':
                    e.preventDefault();
                    EventBus.emit('video:toggle-mute');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    EventBus.emit('video:seek-forward', 10);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    EventBus.emit('video:seek-backward', 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    EventBus.emit('video:volume-up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    EventBus.emit('video:volume-down');
                    break;
            }
        }
        
        // Atalho de busca global
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openSearchModal();
        }
    },
    
    // Mostrar modal de conclusão de curso
    showCourseCompletionModal(course) {
        const modal = ModalService.create({
            title: '🎉 Parabéns!',
            content: `
                <div class="text-center py-lg">
                    <div class="dashboard-empty-icon" style="margin: 0 auto var(--spacing-lg)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                             viewBox="0 0 24 24" stroke="currentColor" 
                             style="color: var(--color-success)">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="h3">${APP_CONFIG.SUCCESS_MESSAGES.COURSE_COMPLETE}</h3>
                    <p class="text-secondary mt-sm">
                        Você concluiu o curso <strong>${course.title}</strong> com sucesso!
                    </p>
                </div>
            `,
            actions: [
                {
                    label: 'Ver Certificado',
                    type: 'primary',
                    onClick: () => Router.navigate(`/certificate/${course.id}`)
                },
                {
                    label: 'Ver outros cursos',
                    type: 'secondary',
                    onClick: () => Router.navigate(ROUTES.COURSES)
                }
            ]
        });
        
        ModalService.open(modal);
    },
    
    // Offline banner
    showOfflineBanner() {
        let banner = document.getElementById('offline-banner');
        
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'offline-banner';
            banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: var(--color-warning);
                color: white;
                text-align: center;
                padding: var(--spacing-sm);
                font-size: var(--text-sm);
                font-weight: var(--font-medium);
                z-index: var(--z-notification);
            `;
            banner.textContent = '⚠️ Sem conexão com a internet. Algumas funcionalidades podem não estar disponíveis.';
            document.body.prepend(banner);
        }
    },
    
    hideOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) banner.remove();
    },
    
    // Abrir modal de busca
    openSearchModal() {
        EventBus.emit('search:open');
    },
    
    // Sync pending progress
    async syncPendingProgress() {
        const queue = Storage.get(APP_CONFIG.STORAGE_KEYS.PROGRESS_QUEUE);
        if (!queue || !queue.length) return;
        
        try {
            await ProgressService.syncQueue(queue);
            Storage.remove(APP_CONFIG.STORAGE_KEYS.PROGRESS_QUEUE);
        } catch (error) {
            console.error('Error syncing progress queue:', error);
        }
    },
    
    // Log error para monitoramento
    logError(error) {
        if (!error) return;
        
        const errorData = {
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            userId: State.getUser()?.id
        };
        
        // Aqui enviaria para serviço como Sentry
        if (ENV.isProduction && APP_CONFIG.EXTERNAL_SERVICES.SENTRY_DSN) {
            console.log('Logging error to monitoring service:', errorData);
        }
    },
    
    // Handle initialization error
    handleInitError(error) {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="loader-container">
                    <h2 style="color: var(--color-error)">Erro ao carregar aplicação</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" 
                            style="margin-top: 16px; padding: 8px 16px; 
                                   background: var(--color-primary); 
                                   color: white; border: none; 
                                   border-radius: 8px; cursor: pointer;">
                        Recarregar
                    </button>
                </div>
            `;
        }
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => App.init());