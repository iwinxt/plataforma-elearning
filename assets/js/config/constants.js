// constants.js - Configurações globais da aplicação

const APP_CONFIG = {
    APP_NAME: 'E-Learning Platform',
    APP_VERSION: '1.0.0',
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : 'https://api.yourdomain.com',
    
    // Timeouts e Intervals
    API_TIMEOUT: 30000, // 30 segundos
    SESSION_CHECK_INTERVAL: 60000, // 1 minuto
    PROGRESS_SYNC_INTERVAL: 5000, // 5 segundos
    TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutos antes de expirar
    
    // Video Player
    VIDEO_AUTO_COMPLETE_THRESHOLD: 0.9, // 90% para marcar como completo
    VIDEO_BUFFER_SIZE: 30, // segundos
    VIDEO_QUALITY_OPTIONS: ['auto', '1080p', '720p', '480p', '360p'],
    VIDEO_PLAYBACK_SPEEDS: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    
    // Pagination
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 50,
    
    // File Upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
    
    // Notifications
    NOTIFICATION_DURATION: 5000, // 5 segundos
    MAX_NOTIFICATIONS: 3,
    
    // Rate Limiting
    MAX_API_CALLS_PER_MINUTE: 60,
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_DURATION: 900000, // 15 minutos
    
    // Cache
    CACHE_DURATION: 300000, // 5 minutos
    CACHE_MAX_ITEMS: 100,
    
    // Local Storage Keys
    STORAGE_KEYS: {
        TOKEN: '__elearn_token',
        REFRESH_TOKEN: '__elearn_refresh',
        USER: '__elearn_user',
        SESSION: '__elearn_session',
        THEME: '__elearn_theme',
        PREFERENCES: '__elearn_prefs',
        PROGRESS_QUEUE: '__elearn_progress_queue'
    },
    
    // User Roles
    USER_ROLES: {
        STUDENT: 'student',
        INSTRUCTOR: 'instructor',
        ADMIN: 'admin'
    },
    
    // Course Status
    COURSE_STATUS: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        ARCHIVED: 'archived'
    },
    
    // Enrollment Status
    ENROLLMENT_STATUS: {
        ACTIVE: 'active',
        EXPIRED: 'expired',
        SUSPENDED: 'suspended'
    },
    
    // Lesson Types
    LESSON_TYPES: {
        VIDEO: 'video',
        PDF: 'pdf',
        QUIZ: 'quiz',
        LIVE: 'live'
    },
    
    // Quiz Types
    QUIZ_QUESTION_TYPES: {
        MULTIPLE_CHOICE: 'multiple_choice',
        TRUE_FALSE: 'true_false',
        ESSAY: 'essay'
    },
    
    // Notification Types
    NOTIFICATION_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    
    // Error Messages
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
        UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
        FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
        NOT_FOUND: 'Recurso não encontrado.',
        SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
        VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
        SESSION_CONFLICT: 'Sessão ativa em outro dispositivo.',
        RATE_LIMIT: 'Muitas requisições. Aguarde um momento.'
    },
    
    // Success Messages
    SUCCESS_MESSAGES: {
        LOGIN: 'Login realizado com sucesso!',
        LOGOUT: 'Logout realizado com sucesso!',
        REGISTER: 'Cadastro realizado com sucesso!',
        PROFILE_UPDATE: 'Perfil atualizado com sucesso!',
        PASSWORD_RESET: 'Senha redefinida com sucesso!',
        LESSON_COMPLETE: 'Aula concluída!',
        COURSE_COMPLETE: 'Parabéns! Curso concluído!'
    },
    
    // SEO
    DEFAULT_META: {
        title: 'E-Learning Platform - Aprenda no seu ritmo',
        description: 'Plataforma completa de cursos online com conteúdo de qualidade',
        keywords: 'cursos online, e-learning, educação, videoaulas',
        ogImage: '/images/og-image.jpg'
    },
    
    // Feature Flags
    FEATURES: {
        ENABLE_ANALYTICS: true,
        ENABLE_CHAT_SUPPORT: false,
        ENABLE_DARK_MODE: true,
        ENABLE_OFFLINE_MODE: false,
        ENABLE_SOCIAL_LOGIN: false
    },
    
    // External Services
    EXTERNAL_SERVICES: {
        ANALYTICS_ID: 'GA-XXXXXXXXX',
        SENTRY_DSN: '',
        HOTJAR_ID: ''
    }
};

// Browser Detection
const BROWSER_INFO = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
    isFirefox: /Firefox/.test(navigator.userAgent),
    isEdge: /Edg/.test(navigator.userAgent)
};

// Environment Detection
const ENV = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    isDebugMode: localStorage.getItem('debug') === 'true'
};

// Regex Patterns
const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    PHONE: /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

// Freeze objects to prevent modifications
Object.freeze(APP_CONFIG);
Object.freeze(BROWSER_INFO);
Object.freeze(ENV);
Object.freeze(REGEX_PATTERNS);