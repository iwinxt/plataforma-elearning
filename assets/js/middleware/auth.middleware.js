// auth.middleware.js - Middleware de proteção de rotas

const AuthMiddleware = {
    // Rotas que requerem autenticação
    protectedRoutes: [
        ROUTES.DASHBOARD,
        ROUTES.MY_COURSES,
        ROUTES.PROFILE,
        ROUTES.SETTINGS,
        ROUTES.CONTINUE_WATCHING,
        ROUTES.COMPLETED_COURSES,
        ROUTES.MY_TRAILS
    ],
    
    // Rotas apenas para guests (não autenticados)
    guestOnlyRoutes: [
        ROUTES.LOGIN,
        ROUTES.REGISTER,
        ROUTES.FORGOT_PASSWORD
    ],
    
    // Rotas que requerem papel específico
    roleRoutes: {
        [APP_CONFIG.USER_ROLES.ADMIN]: [],
        [APP_CONFIG.USER_ROLES.INSTRUCTOR]: []
    },
    
    // Processar middleware
    async handle(path, meta) {
        const isAuthenticated = AuthService.isAuthenticated();
        
        // Verificar rota protegida pelo meta da rota
        if (meta.requiresAuth && !isAuthenticated) {
            this.redirectToLogin(path);
            return false;
        }
        
        // Verificar rota apenas para guests
        if (meta.guestOnly && isAuthenticated) {
            this.redirectToDashboard();
            return false;
        }
        
        // Verificar rotas protegidas na lista
        if (this.isProtectedRoute(path) && !isAuthenticated) {
            this.redirectToLogin(path);
            return false;
        }
        
        // Verificar rotas apenas para guests na lista
        if (this.isGuestOnlyRoute(path) && isAuthenticated) {
            this.redirectToDashboard();
            return false;
        }
        
        // Verificar acesso ao player (precisa ter matrícula)
        if (path.startsWith('/player/')) {
            return await this.checkPlayerAccess(path);
        }
        
        // Verificar permissões de papel
        if (meta.requiredRole) {
            return this.checkRolePermission(meta.requiredRole);
        }
        
        return true;
    },
    
    // Verificar se rota é protegida
    isProtectedRoute(path) {
        return this.protectedRoutes.some(route => {
            if (route.includes(':')) {
                const pattern = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
                return pattern.test(path);
            }
            return path === route || path.startsWith(route + '/');
        });
    },
    
    // Verificar se rota é apenas para guests
    isGuestOnlyRoute(path) {
        return this.guestOnlyRoutes.includes(path);
    },
    
    // Verificar acesso ao player
    async checkPlayerAccess(path) {
        try {
            const parts = path.split('/');
            const courseId = parts[2];
            
            if (!courseId) {
                Router.navigate(ROUTES.COURSES, true);
                return false;
            }
            
            const hasAccess = await CourseService.checkCourseAccess(courseId);
            
            if (!hasAccess) {
                NotificationService.show(
                    APP_CONFIG.ERROR_MESSAGES.FORBIDDEN,
                    'warning'
                );
                Router.navigate(
                    buildRoute(ROUTES.COURSE_DETAILS, { slug: courseId }),
                    true
                );
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Error checking player access:', error);
            Router.navigate(ROUTES.DASHBOARD, true);
            return false;
        }
    },
    
    // Verificar permissão de papel
    checkRolePermission(requiredRole) {
        const hasRole = AuthService.hasRole(requiredRole);
        
        if (!hasRole) {
            NotificationService.show(
                APP_CONFIG.ERROR_MESSAGES.FORBIDDEN,
                'error'
            );
            Router.navigate(ROUTES.DASHBOARD, true);
            return false;
        }
        
        return true;
    },
    
    // Redirecionar para login
    redirectToLogin(redirectPath) {
        const loginUrl = ROUTES.LOGIN +
            (redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '');
        Router.navigate(loginUrl, true);
    },
    
    // Redirecionar para dashboard
    redirectToDashboard() {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        
        Router.navigate(redirect || ROUTES.DASHBOARD, true);
    }
};