// course.service.js - Serviço de gerenciamento de cursos

const CourseService = {
    // Cache local de cursos
    _cache: new Map(),
    
    // Buscar lista de cursos
    async getCourses(params = {}) {
        try {
            const queryParams = {
                page: params.page || 1,
                limit: params.limit || APP_CONFIG.DEFAULT_PAGE_SIZE,
                category: params.category || null,
                level: params.level || null,
                search: params.search || null,
                sort: params.sort || 'popular',
                ...params
            };
            
            const url = buildUrl(API_ENDPOINTS.COURSES.LIST, queryParams);
            const response = await API.get(url, { cache: true });
            
            return {
                courses: response.data.courses,
                pagination: response.data.pagination
            };
            
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    },
    
    // Buscar curso por ID
    async getCourseById(courseId) {
        try {
            // Verificar cache local
            if (this._cache.has(courseId)) {
                return this._cache.get(courseId);
            }
            
            const response = await API.get(
                API_ENDPOINTS.COURSES.DETAILS(courseId),
                { cache: true }
            );
            
            // Salvar no cache
            this._cache.set(courseId, response.data);
            
            return response.data;
            
        } catch (error) {
            console.error('Error fetching course:', error);
            throw error;
        }
    },
    
    // Buscar curso por slug
    async getCourseBySlug(slug) {
        try {
            const response = await API.get(
                API_ENDPOINTS.COURSES.BY_SLUG(slug),
                { cache: true }
            );
            
            // Salvar no cache por ID também
            this._cache.set(response.data.id, response.data);
            
            // Atualizar SEO
            SEO.updateMeta({
                title: response.data.title,
                description: response.data.description,
                image: response.data.thumbnail_url,
                type: 'course'
            });
            
            SEO.setCourseStructuredData(response.data);
            
            return response.data;
            
        } catch (error) {
            console.error('Error fetching course by slug:', error);
            throw error;
        }
    },
    
    // Buscar cursos em destaque
    async getFeaturedCourses() {
        try {
            const response = await API.get(
                API_ENDPOINTS.COURSES.FEATURED,
                { cache: true }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching featured courses:', error);
            throw error;
        }
    },
    
    // Buscar cursos populares
    async getPopularCourses(limit = 8) {
        try {
            const url = buildUrl(API_ENDPOINTS.COURSES.POPULAR, { limit });
            const response = await API.get(url, { cache: true });
            return response.data;
        } catch (error) {
            console.error('Error fetching popular courses:', error);
            throw error;
        }
    },
    
    // Buscar cursos por categoria
    async getCoursesByCategory(categoryId, params = {}) {
        try {
            const url = buildUrl(
                API_ENDPOINTS.COURSES.BY_CATEGORY(categoryId),
                params
            );
            const response = await API.get(url, { cache: true });
            return response.data;
        } catch (error) {
            console.error('Error fetching courses by category:', error);
            throw error;
        }
    },
    
    // Buscar categorias
    async getCategories() {
        try {
            const response = await API.get(
                API_ENDPOINTS.COURSES.CATEGORIES,
                { cache: true }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },
    
    // Pesquisar cursos
    async searchCourses(query, params = {}) {
        try {
            if (!query || query.trim().length < 2) return { courses: [], pagination: {} };
            
            const url = buildUrl(API_ENDPOINTS.COURSES.SEARCH, {
                q: query.trim(),
                page: params.page || 1,
                limit: params.limit || APP_CONFIG.DEFAULT_PAGE_SIZE,
                ...params
            });
            
            const response = await API.get(url);
            
            // Analytics
            AnalyticsService.track('course_search', { query, results: response.data.pagination.total });
            
            return response.data;
            
        } catch (error) {
            console.error('Error searching courses:', error);
            throw error;
        }
    },
    
    // Buscar módulos de um curso
    async getCourseModules(courseId) {
        try {
            const response = await API.get(
                API_ENDPOINTS.MODULES.BY_COURSE(courseId),
                { cache: true }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching modules:', error);
            throw error;
        }
    },
    
    // Buscar aula por ID
    async getLessonById(lessonId) {
        try {
            const response = await API.get(
                API_ENDPOINTS.LESSONS.DETAILS(lessonId)
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching lesson:', error);
            throw error;
        }
    },
    
    // Buscar URL assinada do vídeo
    async getVideoUrl(lessonId) {
        try {
            const response = await API.get(
                API_ENDPOINTS.LESSONS.VIDEO_URL(lessonId)
            );
            
            return {
                url: response.data.url,
                expiresAt: response.data.expires_at,
                quality: response.data.quality_options
            };
            
        } catch (error) {
            console.error('Error fetching video URL:', error);
            throw error;
        }
    },
    
    // Buscar URL assinada do PDF
    async getPdfUrl(lessonId) {
        try {
            const response = await API.get(
                API_ENDPOINTS.LESSONS.PDF_URL(lessonId)
            );
            
            return {
                url: response.data.url,
                expiresAt: response.data.expires_at
            };
            
        } catch (error) {
            console.error('Error fetching PDF URL:', error);
            throw error;
        }
    },
    
    // Buscar meus cursos (matriculados)
    async getMyCourses(params = {}) {
        try {
            const url = buildUrl(API_ENDPOINTS.ENROLLMENTS.MY_COURSES, params);
            const response = await API.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching my courses:', error);
            throw error;
        }
    },
    
    // Verificar acesso ao curso
    async checkCourseAccess(courseId) {
        try {
            const response = await API.get(
                API_ENDPOINTS.ENROLLMENTS.CHECK_ACCESS(courseId)
            );
            return response.data.hasAccess;
        } catch (error) {
            if (error.status === 403 || error.status === 404) return false;
            throw error;
        }
    },
    
    // Buscar curso atual (para retomar)
    async getContinueWatching() {
        try {
            const response = await API.get(API_ENDPOINTS.ENROLLMENTS.CONTINUE);
            return response.data;
        } catch (error) {
            console.error('Error fetching continue watching:', error);
            return null;
        }
    },
    
    // Buscar sugestões de busca
    async getSearchSuggestions(query) {
        try {
            if (!query || query.trim().length < 2) return [];
            
            const url = buildUrl(API_ENDPOINTS.SEARCH.SUGGESTIONS, { q: query.trim() });
            const response = await API.get(url, { cache: true });
            return response.data;
        } catch (error) {
            return [];
        }
    },
    
    // Buscar avaliações do curso
    async getCourseReviews(courseId, params = {}) {
        try {
            const url = buildUrl(
                API_ENDPOINTS.REVIEWS.BY_COURSE(courseId),
                params
            );
            const response = await API.get(url, { cache: true });
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    },
    
    // Criar avaliação
    async createReview(courseId, reviewData) {
        try {
            const response = await API.post(
                API_ENDPOINTS.REVIEWS.CREATE(courseId),
                reviewData
            );
            
            // Invalidar cache do curso
            this._cache.delete(courseId);
            
            return response.data;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },
    
    // Buscar comentários da aula
    async getLessonComments(lessonId, params = {}) {
        try {
            const url = buildUrl(
                API_ENDPOINTS.COMMENTS.BY_LESSON(lessonId),
                params
            );
            const response = await API.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    },
    
    // Criar comentário
    async createComment(lessonId, content) {
        try {
            const response = await API.post(
                API_ENDPOINTS.COMMENTS.CREATE(lessonId),
                { content: Validators.sanitize(content) }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    },
    
    // Limpar cache
    clearCache() {
        this._cache.clear();
    }
};