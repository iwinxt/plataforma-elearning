// router.js - Sistema de roteamento SPA

const Router = {
    currentRoute: null,
    routes: {},
    middlewares: [],
    
    // Inicializar router
    init() {
        // Register route handlers
        this.registerRoutes();
        
        // Handle browser navigation
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });
        
        // Handle initial load
        this.handleRoute(window.location.pathname);
        
        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            
            if (link && link.href && this.isInternalLink(link)) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    },
    
    // Register all routes
    registerRoutes() {
        // Public routes
        this.routes[ROUTES.HOME] = { handler: 'Home', meta: ROUTE_META[ROUTES.HOME] };
        this.routes[ROUTES.LOGIN] = { handler: 'Login', meta: ROUTE_META[ROUTES.LOGIN] };
        this.routes[ROUTES.REGISTER] = { handler: 'Register', meta: ROUTE_META[ROUTES.REGISTER] };
        this.routes[ROUTES.FORGOT_PASSWORD] = { handler: 'ForgotPassword', meta: ROUTE_META[ROUTES.FORGOT_PASSWORD] };
        this.routes[ROUTES.COURSES] = { handler: 'Catalog', meta: { title: 'Cursos' } };
        
        // Protected routes
        this.routes[ROUTES.DASHBOARD] = { handler: 'Dashboard', meta: ROUTE_META[ROUTES.DASHBOARD] };
        this.routes[ROUTES.MY_COURSES] = { handler: 'MyCourses', meta: ROUTE_META[ROUTES.MY_COURSES] };
        this.routes[ROUTES.PROFILE] = { handler: 'Profile', meta: ROUTE_META[ROUTES.PROFILE] };
    },
    
    // Navigate to route
    navigate(path, replace = false) {
        if (replace) {
            window.history.replaceState(null, '', path);
        } else {
            window.history.pushState(null, '', path);
        }
        
        this.handleRoute(path);
    },
    
    // Handle route
    async handleRoute(path) {
        // Remove query string for route matching
        const cleanPath = path.split('?')[0];
        
        // Try exact match first
        let route = this.routes[cleanPath];
        let params = {};
        
        // Try pattern matching
        if (!route) {
            const matchResult = matchRoute(cleanPath);
            if (matchResult) {
                route = {
                    handler: matchResult.handler,
                    meta: {}
                };
                params = matchResult.params;
            }
        }
        
        // 404 if no route found
        if (!route) {
            this.handleNotFound();
            return;
        }
        
        // Get route meta
        const meta = route.meta || {};
        
        // Run middlewares
        const canProceed = await this.runMiddlewares(cleanPath, meta);
        if (!canProceed) return;
        
        // Update current route
        this.currentRoute = {
            path: cleanPath,
            params,
            query: this.parseQueryString(window.location.search),
            meta
        };
        
        // Update SEO
        this.updateSEO(meta);
        
        // Emit route change event
        EventBus.emit(APP_EVENTS.ROUTE_CHANGED, this.currentRoute);
        
        // Render page
        await this.renderPage(route.handler, params);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Emit page loaded event
        EventBus.emit(APP_EVENTS.PAGE_LOADED, this.currentRoute);
    },
    
    // Run middlewares
    async runMiddlewares(path, meta) {
        // Check authentication
        if (meta.requiresAuth && !State.isAuthenticated()) {
            this.navigate(ROUTES.LOGIN + '?redirect=' + encodeURIComponent(path), true);
            return false;
        }
        
        // Check guest only (redirect if authenticated)
        if (meta.guestOnly && State.isAuthenticated()) {
            this.navigate(ROUTES.DASHBOARD, true);
            return false;
        }
        
        // Run custom middlewares
        for (const middleware of this.middlewares) {
            const result = await middleware(path, meta);
            if (result === false) return false;
        }
        
        return true;
    },
    
    // Render page
    async renderPage(handlerName, params) {
        const appContainer = document.getElementById('app');
        
        // Show loading
        State.setLoading(true);
        appContainer.innerHTML = '<div class="loader-container"><div class="loader-spinner"></div></div>';
        
        try {
            // Get page handler
            const PageHandler = window[handlerName];
            
            if (!PageHandler) {
                throw new Error(`Page handler "${handlerName}" not found`);
            }
            
            // Render page
            const html = await PageHandler.render(params);
            appContainer.innerHTML = html;
            
            // Initialize page
            if (PageHandler.init) {
                await PageHandler.init(params);
            }
            
        } catch (error) {
            console.error('Error rendering page:', error);
            this.handleError(error);
        } finally {
            State.setLoading(false);
        }
    },
    
    // Update SEO
    updateSEO(meta) {
        if (meta.title) {
            SEO.setTitle(meta.title);
        }
        
        if (meta.description) {
            SEO.setDescription(meta.description);
        }
        
        SEO.setCanonical(window.location.href);
    },
    
    // Parse query string
    parseQueryString(queryString) {
        const params = {};
        const searchParams = new URLSearchParams(queryString);
        
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        
        return params;
    },
    
    // Check if link is internal
    isInternalLink(link) {
        const href = link.getAttribute('href');
        
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return false;
        }
        
        if (href.startsWith('http://') || href.startsWith('https://')) {
            return link.hostname === window.location.hostname;
        }
        
        return true;
    },
    
    // Handle 404
    handleNotFound() {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
            <div class="dashboard-empty">
                <div class="dashboard-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 class="dashboard-empty-title">Página não encontrada</h2>
                <p class="dashboard-empty-description">A página que você procura não existe ou foi movida.</p>
                <button onclick="Router.navigate('/')" class="btn btn-primary">Voltar ao início</button>
            </div>
        `;
        
        SEO.setTitle('Página não encontrada');
    },
    
    // Handle error
    handleError(error) {
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = `
            <div class="dashboard-empty">
                <div class="dashboard-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 class="dashboard-empty-title">Erro ao carregar página</h2>
                <p class="dashboard-empty-description">${error.message || 'Ocorreu um erro inesperado.'}</p>
                <button onclick="location.reload()" class="btn btn-primary">Recarregar página</button>
            </div>
        `;
    },
    
    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    },
    
    // Add middleware
    use(middleware) {
        this.middlewares.push(middleware);
    },
    
    // Reload current route
    reload() {
        this.handleRoute(window.location.pathname);
    }
};