// app.js — Inicialização corrigida

const App = {
    initialized: false,

    async init() {
        try {
            console.log('%c🚀 EduFlow iniciando...', 'color:#6366f1;font-weight:bold');

            // 1. Aplicar tema salvo
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);

            // 2. Inicializar State
            if (typeof State !== 'undefined') State.init();

            // 3. Inicializar componentes visuais
            if (typeof NotificationService !== 'undefined') NotificationService.init();
            if (typeof ModalService !== 'undefined')        ModalService.init();
            if (typeof LazyLoader !== 'undefined')          LazyLoader.init();

            // 4. Verificar sessão existente (sem bloquear se falhar)
            if (typeof AuthService !== 'undefined') {
                try {
                    await AuthService.checkSession();
                } catch (e) {
                    // Sessão inválida ou sem conexão — ok, continua
                }
            }

            // 5. Configurar event listeners globais
            this.setupGlobalListeners();

            // 6. Inicializar middlewares no Router
            if (typeof RateLimitMiddleware !== 'undefined')
                Router.use(RateLimitMiddleware.handle.bind(RateLimitMiddleware));
            if (typeof SessionMiddleware !== 'undefined')
                Router.use(SessionMiddleware.handle.bind(SessionMiddleware));
            if (typeof AuthMiddleware !== 'undefined')
                Router.use(AuthMiddleware.handle.bind(AuthMiddleware));

            // 7. Iniciar Router (DEVE ser o último)
            Router.init();

            // 8. Remover loader inicial
            this.removeLoader();

            this.initialized = true;
            console.log('%c✅ EduFlow pronto!', 'color:#10b981;font-weight:bold');

        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
            this.removeLoader();
            this.showInitError(error);
        }
    },

    removeLoader() {
        const loader = document.getElementById('app-loader');
        if (!loader) return;
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 350);
    },

    setupGlobalListeners() {
        // Auth events
        EventBus.on('auth:login', (user) => {
            State.setUser(user);
            if (typeof NotificationService !== 'undefined')
                NotificationService.success('Login realizado com sucesso!');
        });

        EventBus.on('auth:logout', () => {
            State.clearUser();
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            Router.navigate('/login', true);
        });

        EventBus.on('auth:session-expired', () => {
            State.clearUser();
            if (typeof NotificationService !== 'undefined')
                NotificationService.warning('Sessão expirada. Faça login novamente.');
            Router.navigate('/login?session=expired', true);
        });

        // Tema
        EventBus.on('ui:theme-changed', (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // TODO: abrir busca global
            }
        });

        // Offline/Online
        window.addEventListener('offline', () => {
            if (typeof NotificationService !== 'undefined')
                NotificationService.warning('Sem conexão com a internet.');
        });
        window.addEventListener('online', () => {
            if (typeof NotificationService !== 'undefined')
                NotificationService.success('Conexão restaurada!');
        });
    },

    showInitError(error) {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;
                            justify-content:center;min-height:100vh;
                            background:#fff;text-align:center;padding:24px;gap:16px">
                    <h2 style="color:#ef4444;font-size:24px;font-weight:700;margin:0">
                        Erro ao carregar
                    </h2>
                    <p style="color:#6b7280;margin:0">${error?.message || 'Erro inesperado'}</p>
                    <button onclick="location.reload()"
                            style="padding:12px 24px;background:#6366f1;color:white;
                                   border:none;border-radius:8px;cursor:pointer;font-size:16px">
                        Recarregar página
                    </button>
                </div>
            `;
        }
    }
};

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    // DOM já está pronto (script carregado depois do HTML)
    App.init();
}