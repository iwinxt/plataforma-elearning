// routes.js - Configuração de rotas da SPA

const ROUTES = {
    // Public Routes
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    
    // Course Catalog
    COURSES: '/courses',
    COURSE_DETAILS: '/course/:slug',
    COURSE_SEARCH: '/search',
    CATEGORY: '/category/:slug',
    
    // Dashboard (Protected)
    DASHBOARD: '/dashboard',
    MY_COURSES: '/my-courses',
    CONTINUE_WATCHING: '/continue-watching',
    COMPLETED_COURSES: '/completed',
    
    // Course Player (Protected)
    COURSE_PLAYER: '/player/:courseId/:lessonId',
    
    // User Profile (Protected)
    PROFILE: '/profile',
    SETTINGS: '/settings',
    
    // Trails
    TRAILS: '/trails',
    TRAIL_DETAILS: '/trail/:slug',
    MY_TRAILS: '/my-trails',
    
    // Static Pages
    ABOUT: '/about',
    CONTACT: '/contact',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    FAQ: '/faq',
    
    // Error Pages
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    SERVER_ERROR: '/500'
};

// Route Metadata
const ROUTE_META = {
    [ROUTES.HOME]: {
        title: 'Início',
        requiresAuth: false,
        description: 'Descubra cursos incríveis'
    },
    [ROUTES.LOGIN]: {
        title: 'Login',
        requiresAuth: false,
        guestOnly: true
    },
    [ROUTES.REGISTER]: {
        title: 'Cadastro',
        requiresAuth: false,
        guestOnly: true
    },
    [ROUTES.DASHBOARD]: {
        title: 'Dashboard',
        requiresAuth: true
    },
    [ROUTES.MY_COURSES]: {
        title: 'Meus Cursos',
        requiresAuth: true
    },
    [ROUTES.COURSE_PLAYER]: {
        title: 'Player',
        requiresAuth: true,
        layout: 'player'
    },
    [ROUTES.PROFILE]: {
        title: 'Perfil',
        requiresAuth: true
    }
};

// Route Patterns for dynamic routes
const ROUTE_PATTERNS = [
    {
        pattern: /^\/course\/([^\/]+)$/,
        handler: 'CourseDetails',
        params: ['slug']
    },
    {
        pattern: /^\/player\/([^\/]+)\/([^\/]+)$/,
        handler: 'Player',
        params: ['courseId', 'lessonId']
    },
    {
        pattern: /^\/category\/([^\/]+)$/,
        handler: 'Category',
        params: ['slug']
    },
    {
        pattern: /^\/trail\/([^\/]+)$/,
        handler: 'TrailDetails',
        params: ['slug']
    }
];

// Navigation Links
const NAV_LINKS = {
    PUBLIC: [
        { label: 'Início', route: ROUTES.HOME, icon: 'home' },
        { label: 'Cursos', route: ROUTES.COURSES, icon: 'book' },
        { label: 'Trilhas', route: ROUTES.TRAILS, icon: 'map' }
    ],
    AUTHENTICATED: [
        { label: 'Dashboard', route: ROUTES.DASHBOARD, icon: 'dashboard' },
        { label: 'Meus Cursos', route: ROUTES.MY_COURSES, icon: 'library' },
        { label: 'Explorar', route: ROUTES.COURSES, icon: 'search' }
    ]
};

// Sidebar Links (Dashboard)
const SIDEBAR_LINKS = [
    {
        section: 'Principal',
        links: [
            { label: 'Dashboard', route: ROUTES.DASHBOARD, icon: 'dashboard' },
            { label: 'Meus Cursos', route: ROUTES.MY_COURSES, icon: 'book' },
            { label: 'Trilhas', route: ROUTES.MY_TRAILS, icon: 'map' }
        ]
    },
    {
        section: 'Biblioteca',
        links: [
            { label: 'Continuar Assistindo', route: ROUTES.CONTINUE_WATCHING, icon: 'play' },
            { label: 'Concluídos', route: ROUTES.COMPLETED_COURSES, icon: 'check' }
        ]
    },
    {
        section: 'Configurações',
        links: [
            { label: 'Perfil', route: ROUTES.PROFILE, icon: 'user' },
            { label: 'Configurações', route: ROUTES.SETTINGS, icon: 'settings' }
        ]
    }
];

// Helper function to get route meta
const getRouteMeta = (route) => {
    return ROUTE_META[route] || {};
};

// Helper function to check if route requires auth
const requiresAuth = (route) => {
    const meta = getRouteMeta(route);
    return meta.requiresAuth === true;
};

// Helper function to check if route is guest only
const isGuestOnly = (route) => {
    const meta = getRouteMeta(route);
    return meta.guestOnly === true;
};

// Helper function to match dynamic routes
const matchRoute = (path) => {
    for (const routePattern of ROUTE_PATTERNS) {
        const match = path.match(routePattern.pattern);
        if (match) {
            const params = {};
            routePattern.params.forEach((param, index) => {
                params[param] = match[index + 1];
            });
            return {
                handler: routePattern.handler,
                params
            };
        }
    }
    return null;
};

// Helper function to build route with params
const buildRoute = (route, params = {}) => {
    let builtRoute = route;
    Object.keys(params).forEach(key => {
        builtRoute = builtRoute.replace(`:${key}`, params[key]);
    });
    return builtRoute;
};

Object.freeze(ROUTES);
Object.freeze(ROUTE_META);
Object.freeze(ROUTE_PATTERNS);
Object.freeze(NAV_LINKS);
Object.freeze(SIDEBAR_LINKS);