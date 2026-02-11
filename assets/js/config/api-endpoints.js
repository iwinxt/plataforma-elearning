// api-endpoints.js - Definição centralizada de endpoints da API

const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_EMAIL: '/auth/verify-email',
        RESEND_VERIFICATION: '/auth/resend-verification',
        CHECK_SESSION: '/auth/check-session',
        TERMINATE_SESSION: '/auth/terminate-session'
    },
    
    // User
    USER: {
        PROFILE: '/user/profile',
        UPDATE_PROFILE: '/user/profile',
        CHANGE_PASSWORD: '/user/change-password',
        UPDATE_AVATAR: '/user/avatar',
        PREFERENCES: '/user/preferences',
        DELETE_ACCOUNT: '/user/delete-account'
    },
    
    // Courses
    COURSES: {
        LIST: '/courses',
        DETAILS: (courseId) => `/courses/${courseId}`,
        BY_SLUG: (slug) => `/courses/slug/${slug}`,
        FEATURED: '/courses/featured',
        POPULAR: '/courses/popular',
        SEARCH: '/courses/search',
        CATEGORIES: '/courses/categories',
        BY_CATEGORY: (categoryId) => `/courses/category/${categoryId}`
    },
    
    // Enrollments
    ENROLLMENTS: {
        MY_COURSES: '/enrollments/my-courses',
        ENROLL: (courseId) => `/enrollments/${courseId}`,
        CHECK_ACCESS: (courseId) => `/enrollments/${courseId}/access`,
        CONTINUE: '/enrollments/continue',
        COMPLETED: '/enrollments/completed'
    },
    
    // Modules & Lessons
    MODULES: {
        BY_COURSE: (courseId) => `/courses/${courseId}/modules`,
        DETAILS: (moduleId) => `/modules/${moduleId}`
    },
    
    LESSONS: {
        DETAILS: (lessonId) => `/lessons/${lessonId}`,
        VIDEO_URL: (lessonId) => `/lessons/${lessonId}/video-url`,
        PDF_URL: (lessonId) => `/lessons/${lessonId}/pdf-url`,
        MARK_COMPLETE: (lessonId) => `/lessons/${lessonId}/complete`,
        BY_MODULE: (moduleId) => `/modules/${moduleId}/lessons`
    },
    
    // Progress
    PROGRESS: {
        COURSE: (courseId) => `/progress/course/${courseId}`,
        LESSON: (lessonId) => `/progress/lesson/${lessonId}`,
        UPDATE: '/progress/update',
        SYNC: '/progress/sync',
        BATCH_UPDATE: '/progress/batch'
    },
    
    // Quiz
    QUIZ: {
        DETAILS: (quizId) => `/quiz/${quizId}`,
        SUBMIT: (quizId) => `/quiz/${quizId}/submit`,
        RESULTS: (quizId) => `/quiz/${quizId}/results`,
        RETRY: (quizId) => `/quiz/${quizId}/retry`
    },
    
    // Trails
    TRAILS: {
        LIST: '/trails',
        DETAILS: (trailId) => `/trails/${trailId}`,
        ENROLL: (trailId) => `/trails/${trailId}/enroll`,
        PROGRESS: (trailId) => `/trails/${trailId}/progress`,
        MY_TRAILS: '/trails/my-trails'
    },
    
    // Analytics
    ANALYTICS: {
        TRACK_EVENT: '/analytics/event',
        TRACK_PAGE_VIEW: '/analytics/pageview',
        TRACK_VIDEO_WATCH: '/analytics/video-watch',
        USER_STATS: '/analytics/user-stats'
    },
    
    // Search
    SEARCH: {
        GLOBAL: '/search',
        COURSES: '/search/courses',
        LESSONS: '/search/lessons',
        SUGGESTIONS: '/search/suggestions'
    },
    
    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        UNREAD_COUNT: '/notifications/unread-count',
        MARK_READ: (notificationId) => `/notifications/${notificationId}/read`,
        MARK_ALL_READ: '/notifications/mark-all-read',
        DELETE: (notificationId) => `/notifications/${notificationId}`
    },
    
    // Reviews & Ratings
    REVIEWS: {
        BY_COURSE: (courseId) => `/courses/${courseId}/reviews`,
        CREATE: (courseId) => `/courses/${courseId}/reviews`,
        UPDATE: (reviewId) => `/reviews/${reviewId}`,
        DELETE: (reviewId) => `/reviews/${reviewId}`,
        MY_REVIEW: (courseId) => `/courses/${courseId}/my-review`
    },
    
    // Comments
    COMMENTS: {
        BY_LESSON: (lessonId) => `/lessons/${lessonId}/comments`,
        CREATE: (lessonId) => `/lessons/${lessonId}/comments`,
        UPDATE: (commentId) => `/comments/${commentId}`,
        DELETE: (commentId) => `/comments/${commentId}`,
        REPLY: (commentId) => `/comments/${commentId}/reply`
    },
    
    // Dashboard
    DASHBOARD: {
        STATS: '/dashboard/stats',
        RECENT_ACTIVITY: '/dashboard/recent-activity',
        RECOMMENDATIONS: '/dashboard/recommendations'
    }
};

// Helper function to build URL with query params
const buildUrl = (endpoint, params = {}) => {
    const url = new URL(APP_CONFIG.API_BASE_URL + endpoint);
    
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });
    
    return url.toString();
};

// Helper function to get full API URL
const getApiUrl = (endpoint) => {
    return APP_CONFIG.API_BASE_URL + endpoint;
};

Object.freeze(API_ENDPOINTS);