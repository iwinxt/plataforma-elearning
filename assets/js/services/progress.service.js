// progress.service.js - Serviço de tracking de progresso do aluno

const ProgressService = {
    // Queue de atualizações pendentes (para offline)
    _updateQueue: [],
    
    // Timer de sincronização
    _syncTimer: null,
    
    // Progresso em memória (para evitar requests duplicados)
    _progressCache: new Map(),
    
    // Inicializar serviço
    init() {
        // Carregar queue pendente do storage
        const savedQueue = Storage.get(APP_CONFIG.STORAGE_KEYS.PROGRESS_QUEUE);
        if (savedQueue && Array.isArray(savedQueue)) {
            this._updateQueue = savedQueue;
        }
        
        // Iniciar sincronização periódica
        this.startPeriodicSync();
        
        // Sincronizar ao recuperar conexão
        EventBus.on(APP_EVENTS.ONLINE, () => this.flushQueue());
    },
    
    // Buscar progresso do curso
    async getCourseProgress(courseId) {
        try {
            // Verificar cache
            if (this._progressCache.has(courseId)) {
                return this._progressCache.get(courseId);
            }
            
            const response = await API.get(
                API_ENDPOINTS.PROGRESS.COURSE(courseId)
            );
            
            const progress = response.data;
            this._progressCache.set(courseId, progress);
            
            return progress;
            
        } catch (error) {
            console.error('Error fetching course progress:', error);
            throw error;
        }
    },
    
    // Buscar progresso da aula
    async getLessonProgress(lessonId) {
        try {
            const response = await API.get(
                API_ENDPOINTS.PROGRESS.LESSON(lessonId)
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching lesson progress:', error);
            return null;
        }
    },
    
    // Atualizar progresso do vídeo
    async updateVideoProgress(lessonId, watchedSeconds, totalSeconds) {
        const percentage = totalSeconds > 0
            ? Math.round((watchedSeconds / totalSeconds) * 100)
            : 0;
        
        const progressData = {
            lesson_id: lessonId,
            watched_seconds: Math.floor(watchedSeconds),
            total_seconds: Math.floor(totalSeconds),
            percentage,
            last_position: Math.floor(watchedSeconds),
            timestamp: Date.now()
        };
        
        // Adicionar à queue
        this.addToQueue(progressData);
        
        // Emitir evento de progresso
        EventBus.emit(APP_EVENTS.LESSON_PROGRESS, {
            lessonId,
            percentage,
            watchedSeconds,
            totalSeconds
        });
        
        // Auto-completar ao atingir 90%
        if (percentage >= (APP_CONFIG.VIDEO_AUTO_COMPLETE_THRESHOLD * 100)) {
            await this.markLessonComplete(lessonId);
        }
    },
    
    // Marcar aula como concluída
    async markLessonComplete(lessonId) {
        try {
            // Verificar se já está marcada como concluída
            const progress = await this.getLessonProgress(lessonId);
            if (progress && progress.completed) return;
            
            const response = await API.post(
                API_ENDPOINTS.LESSONS.MARK_COMPLETE(lessonId)
            );
            
            // Atualizar cache
            this._progressCache.forEach((courseProgress, courseId) => {
                if (courseProgress.lessons_progress) {
                    const lessonIndex = courseProgress.lessons_progress
                        .findIndex(l => l.lesson_id === lessonId);
                    
                    if (lessonIndex !== -1) {
                        courseProgress.lessons_progress[lessonIndex].completed = true;
                        courseProgress.lessons_progress[lessonIndex].completed_at = new Date().toISOString();
                        
                        // Recalcular progresso do curso
                        courseProgress.percentage = this.calculateCoursePercentage(
                            courseProgress.lessons_progress
                        );
                        
                        this._progressCache.set(courseId, courseProgress);
                    }
                }
            });
            
            // Emitir evento
            EventBus.emit(APP_EVENTS.LESSON_COMPLETED, { lessonId });
            
            // Verificar conclusão do curso
            if (response.data.course_completed) {
                EventBus.emit(APP_EVENTS.COURSE_COMPLETED, response.data.course);
            }
            
            return response.data;
            
        } catch (error) {
            console.error('Error marking lesson complete:', error);
            // Adicionar à queue para retry
            this.addToQueue({
                type: 'mark_complete',
                lesson_id: lessonId,
                timestamp: Date.now()
            });
        }
    },
    
    // Calcular porcentagem do curso
    calculateCoursePercentage(lessonsProgress) {
        if (!lessonsProgress || lessonsProgress.length === 0) return 0;
        
        const completed = lessonsProgress.filter(l => l.completed).length;
        return Math.round((completed / lessonsProgress.length) * 100);
    },
    
    // Adicionar à queue de sincronização
    addToQueue(data) {
        // Remover entrada anterior para o mesmo lesson
        this._updateQueue = this._updateQueue.filter(
            item => item.lesson_id !== data.lesson_id || item.type !== data.type
        );
        
        this._updateQueue.push(data);
        
        // Limitar tamanho da queue
        if (this._updateQueue.length > 100) {
            this._updateQueue = this._updateQueue.slice(-100);
        }
        
        // Salvar no storage para persistência offline
        Storage.set(APP_CONFIG.STORAGE_KEYS.PROGRESS_QUEUE, this._updateQueue);
    },
    
    // Sincronização periódica
    startPeriodicSync() {
        if (this._syncTimer) clearInterval(this._syncTimer);
        
        this._syncTimer = setInterval(() => {
            if (navigator.onLine && this._updateQueue.length > 0) {
                this.flushQueue();
            }
        }, APP_CONFIG.PROGRESS_SYNC_INTERVAL);
    },
    
    // Enviar queue pendente
    async flushQueue() {
        if (this._updateQueue.length === 0) return;
        
        const queueCopy = [...this._updateQueue];
        
        try {
            await API.post(API_ENDPOINTS.PROGRESS.BATCH_UPDATE, {
                updates: queueCopy
            });
            
            // Limpar queue após sucesso
            this._updateQueue = this._updateQueue.filter(
                item => !queueCopy.includes(item)
            );
            
            // Atualizar storage
            Storage.set(
                APP_CONFIG.STORAGE_KEYS.PROGRESS_QUEUE,
                this._updateQueue
            );
            
        } catch (error) {
            console.error('Error flushing progress queue:', error);
        }
    },
    
    // Sincronizar queue específica (chamada pelo App após reconexão)
    async syncQueue(queue) {
        if (!queue || queue.length === 0) return;
        
        return await API.post(API_ENDPOINTS.PROGRESS.BATCH_UPDATE, {
            updates: queue
        });
    },
    
    // Salvar posição atual do vídeo (para retomar)
    saveLastPosition(lessonId, position) {
        const key = `lesson_position_${lessonId}`;
        Storage.set(key, {
            position: Math.floor(position),
            savedAt: Date.now()
        });
    },
    
    // Obter última posição do vídeo
    getLastPosition(lessonId) {
        const key = `lesson_position_${lessonId}`;
        const saved = Storage.get(key);
        
        if (!saved) return 0;
        
        // Posição expira após 30 dias
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - saved.savedAt > thirtyDays) {
            Storage.remove(key);
            return 0;
        }
        
        return saved.position;
    },
    
    // Buscar dashboard de progresso do aluno
    async getDashboardStats() {
        try {
            const response = await API.get(API_ENDPOINTS.DASHBOARD.STATS);
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },
    
    // Limpar cache de progresso
    clearCache() {
        this._progressCache.clear();
    },
    
    // Destruir serviço
    destroy() {
        if (this._syncTimer) {
            clearInterval(this._syncTimer);
            this._syncTimer = null;
        }
        
        this.flushQueue();
    }
};

// Inicializar ao carregar
ProgressService.init();