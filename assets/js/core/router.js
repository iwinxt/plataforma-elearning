// router.js — SPA Router corrigido

const Router = {
    _routes: {},
    _middlewares: [],
    _currentRoute: null,
    _app: null,

    // Registrar rotas
    registerRoutes(routes) {
        this._routes = routes;
    },

    // Adicionar middleware
    use(middleware) {
        this._middlewares.push(middleware);
    },

    // Inicializar router
    init() {
        this._app = document.getElementById('app');

        // Mapear todas as páginas
        this.registerRoutes({
            '/':                    { handler: Login,         meta: ROUTE_META[ROUTES.HOME] || { guestOnly: true, layout: 'auth' } },
            '/login':               { handler: Login,         meta: { guestOnly: true,   layout: 'auth'      } },
            '/register':            { handler: Register,      meta: { guestOnly: true,   layout: 'auth'      } },
            '/forgot-password':     { handler: ForgotPassword,meta: { guestOnly: true,   layout: 'auth'      } },
            '/dashboard':           { handler: Dashboard,     meta: { requiresAuth: true, layout: 'dashboard' } },
            '/my-courses':          { handler: MyCourses,     meta: { requiresAuth: true, layout: 'dashboard' } },
            '/profile':             { handler: Profile,       meta: { requiresAuth: true, layout: 'dashboard' } },
            '/courses':             { handler: Catalog,       meta: { requiresAuth: false, layout: 'dashboard' } },
            '/course/:slug':        { handler: CourseDetails, meta: { requiresAuth: false, layout: 'dashboard' } },
            '/player/:courseId/:lessonId': { handler: Player, meta: { requiresAuth: true, layout: 'player'   } },
        });

        // Ouvir popstate (botão voltar/avançar do browser)
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });

        // Interceptar cliques em links internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('//') ||
                href.startsWith('mailto:') || href.startsWith('tel:') ||
                link.target === '_blank') return;

            e.preventDefault();
            this.navigate(href);
        });

        // Rota inicial
        this.handleRoute(window.location.pathname);
    },

    // Navegar para rota
    navigate(path, replace = false) {
        if (!path) path = '/';

        // Normalizar path
        const url = new URL(path, window.location.origin);
        const fullPath = url.pathname + url.search;

        if (replace) {
            window.history.replaceState({}, '', fullPath);
        } else {
            window.history.pushState({}, '', fullPath);
        }

        this.handleRoute(url.pathname, url.searchParams);
    },

    // Processar rota atual
    async handleRoute(rawPath, searchParams) {
        const path = rawPath || '/';

        // Resolver rota (incluindo rotas dinâmicas)
        const { route, params } = this.matchRoute(path);

        if (!route) {
            this.renderNotFound();
            return;
        }

        const { handler, meta } = route;

        // Query string
        const query = {};
        const sp = searchParams || new URL(window.location.href).searchParams;
        sp.forEach((v, k) => { query[k] = v; });

        // Salvar rota atual
        this._currentRoute = { path, params, query, meta };

        // Executar middlewares
        for (const middleware of this._middlewares) {
            try {
                const ok = await middleware(path, meta || {});
                if (ok === false) return; // middleware bloqueou
            } catch (err) {
                console.error('Middleware error:', err);
            }
        }

        // Renderizar página
        await this.renderPage(handler, params, query, meta);
    },

    // Renderizar página
    async renderPage(handler, params = {}, query = {}, meta = {}) {
        if (!this._app) this._app = document.getElementById('app');
        if (!this._app) return;

        // Scroll para o topo
        window.scrollTo(0, 0);

        try {
            // Mostrar loader enquanto renderiza
            this._app.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;
                            height:100vh;background:var(--color-bg-primary)">
                    <div class="loader-spin" style="width:40px;height:40px;
                         border:3px solid var(--color-border);
                         border-top-color:var(--color-primary);
                         border-radius:50%;
                         animation:spin 0.8s linear infinite">
                    </div>
                </div>
            `;

            // Chamar render da página
            let html;
            if (typeof handler.render === 'function') {
                html = await handler.render(params, query);
            } else {
                html = '<div>Página sem render()</div>';
            }

            // Injetar HTML
            this._app.innerHTML = html;

            // Chamar init da página
            if (typeof handler.init === 'function') {
                await handler.init(params, query);
            }

            // Atualizar título SEO
            if (meta.title) {
                SEO.setTitle(meta.title);
            }

            // Notificar que página carregou
            EventBus.emit(APP_EVENTS.PAGE_LOADED || 'navigation:page-loaded', {
                path: window.location.pathname,
                params,
                query
            });

            // Refresh lazy loader
            if (typeof LazyLoader !== 'undefined') {
                LazyLoader.refresh();
            }

        } catch (error) {
            console.error('Error rendering page:', error);
            this.renderError(error);
        }
    },

    // Match de rota (incluindo rotas dinâmicas)
    matchRoute(path) {
        // Tentativa de match exato primeiro
        if (this._routes[path]) {
            return { route: this._routes[path], params: {} };
        }

        // Match com parâmetros dinâmicos
        for (const [pattern, route] of Object.entries(this._routes)) {
            if (!pattern.includes(':')) continue;

            const paramNames = [];
            const regexStr = pattern
                .replace(/:[^/]+/g, (match) => {
                    paramNames.push(match.slice(1));
                    return '([^/]+)';
                });

            const regex = new RegExp(`^${regexStr}$`);
            const match = path.match(regex);

            if (match) {
                const params = {};
                paramNames.forEach((name, i) => {
                    params[name] = decodeURIComponent(match[i + 1]);
                });
                return { route, params };
            }
        }

        return { route: null, params: {} };
    },

    // Página 404
    renderNotFound() {
        if (!this._app) this._app = document.getElementById('app');
        if (!this._app) return;

        this._app.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: var(--color-bg-primary);
                text-align: center;
                padding: 24px;
                gap: 16px;
            ">
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none" viewBox="0 0 24 24"
                     stroke="var(--color-text-tertiary)"
                     width="64" height="64">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h2 style="color:var(--color-text-primary);font-size:24px;
                           font-weight:700;margin:0">
                    Página não encontrada
                </h2>
                <p style="color:var(--color-text-secondary);margin:0">
                    A página que você procura não existe ou foi movida.
                </p>
                <button
                    onclick="Router.navigate('/dashboard')"
                    style="margin-top:8px;padding:12px 24px;
                           background:var(--color-primary);color:white;
                           border:none;border-radius:8px;cursor:pointer;
                           font-size:16px;font-weight:600">
                    Voltar ao início
                </button>
            </div>
        `;

        SEO.setTitle('Página não encontrada');
    },

    // Página de erro
    renderError(error) {
        if (!this._app) this._app = document.getElementById('app');
        if (!this._app) return;

        this._app.innerHTML = `
            <div style="
                display:flex;flex-direction:column;align-items:center;
                justify-content:center;min-height:100vh;
                background:var(--color-bg-primary);text-align:center;padding:24px;gap:16px
            ">
                <h2 style="color:var(--color-error);font-size:24px;font-weight:700;margin:0">
                    Algo deu errado
                </h2>
                <p style="color:var(--color-text-secondary);margin:0;max-width:400px">
                    ${error?.message || 'Ocorreu um erro inesperado.'}
                </p>
                <button
                    onclick="Router.navigate('/dashboard')"
                    style="padding:12px 24px;background:var(--color-primary);color:white;
                           border:none;border-radius:8px;cursor:pointer;font-size:16px">
                    Voltar ao início
                </button>
            </div>
        `;
    },

    // Obter rota atual
    getCurrentRoute() {
        return this._currentRoute;
    },

    // Recarregar rota atual
    reload() {
        this.handleRoute(window.location.pathname);
    }
};