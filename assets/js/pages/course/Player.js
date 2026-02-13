// Player.js - Página do player de curso

const Player = {
    _course: null,
    _modules: [],
    _currentLesson: null,
    _nextLesson: null,
    _prevLesson: null,
    _progress: null,
    _allLessons: [],

    async render(params) {
        return `
            <div class="course-player-layout" id="player-layout">

                <!-- Main -->
                <div class="player-main" id="player-main">

                    <!-- Navbar do player -->
                    <nav class="navbar" style="position: relative;
                                               border-bottom: 1px solid
                                               var(--color-border)">
                        <div class="navbar-container">
                            <button
                                onclick="Router.navigate(
                                    Router.getCurrentRoute()
                                        ?.query?.from || '${ROUTES.MY_COURSES}'
                                )"
                                class="btn btn-secondary btn-sm">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor"
                                     width="16" height="16">
                                    <path stroke-linecap="round"
                                          stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M15 19l-7-7 7-7"/>
                                </svg>
                                Voltar
                            </button>

                            <div style="flex:1; text-align: center;
                                        padding: 0 var(--spacing-md)">
                                <p class="text-sm font-medium truncate"
                                   id="player-course-title">
                                    Carregando...
                                </p>
                            </div>

                            <!-- Toggle sidebar mobile -->
                            <button
                                class="btn btn-secondary btn-sm"
                                onclick="Player.toggleSidebar()"
                                id="toggle-sidebar-btn">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor"
                                     width="16" height="16">
                                    <path stroke-linecap="round"
                                          stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M4 6h16M4 12h16M4 18h7"/>
                                </svg>
                                Conteúdo
                            </button>
                        </div>
                    </nav>

                    <!-- Área do vídeo -->
                    <div class="player-video-section" id="player-video-section">
                        <div style="width:100%; aspect-ratio: 16/9;
                                    background: #000;
                                    display:flex; align-items:center;
                                    justify-content:center">
                            <div class="loader-spinner"
                                 style="border-color: rgba(255,255,255,0.3);
                                        border-top-color: white">
                            </div>
                        </div>
                    </div>

                    <!-- Conteúdo da aula -->
                    <div class="player-content">
                        <div class="player-content-inner"
                             id="lesson-content">
                            ${this.renderLessonSkeleton()}
                        </div>
                    </div>
                </div>

                <!-- Sidebar do currículo -->
                <div class="player-sidebar" id="player-sidebar">
                    <div class="player-sidebar-header">
                        <p class="player-sidebar-title" id="sidebar-course-title">
                            Carregando...
                        </p>
                        <p class="player-sidebar-progress text-sm text-secondary"
                           id="sidebar-progress">
                        </p>
                        <div id="sidebar-progress-bar"></div>
                    </div>
                    <div class="curriculum-list" id="curriculum-list">
                        ${this.renderCurriculumSkeleton()}
                    </div>
                </div>
            </div>
        `;
    },

    async init(params) {
        const { courseId, lessonId } = params;

        try {
            // Carregar dados em paralelo
            const [course, modules, progress] = await Promise.all([
                CourseService.getCourseById(courseId),
                CourseService.getCourseModules(courseId),
                ProgressService.getCourseProgress(courseId)
            ]);

            this._course = course;
            this._modules = modules;
            this._progress = progress;

            // Construir lista flat de aulas
            this._allLessons = modules.flatMap(m => m.lessons || []);

            // Atualizar estado global
            State.setCurrentCourse(course);

            // Atualizar títulos
            const courseTitle = document.getElementById('player-course-title');
            const sidebarTitle = document.getElementById('sidebar-course-title');
            if (courseTitle) courseTitle.textContent = course.title;
            if (sidebarTitle) sidebarTitle.textContent = course.title;

            // Atualizar SEO
            SEO.setTitle(course.title);

            // Renderizar currículo
            this.renderCurriculum();

            // Carregar aula
            await this.loadLesson(lessonId);

            // Event listeners
            this.initEventListeners();

        } catch (error) {
            console.error('Error initializing player:', error);
            NotificationService.error('Erro ao carregar o player.');
            Router.navigate(ROUTES.MY_COURSES, true);
        }
    },

    // Carregar aula específica
    async loadLesson(lessonId) {
        try {
            // Encontrar aula na lista
            const lesson = this._allLessons.find(l => l.id === lessonId)
                || await CourseService.getLessonById(lessonId);

            this._currentLesson = lesson;
            State.setCurrentLesson(lesson);

            // Calcular anterior e próxima
            const currentIndex = this._allLessons.findIndex(
                l => l.id === lessonId
            );
            this._prevLesson = currentIndex > 0
                ? this._allLessons[currentIndex - 1]
                : null;
            this._nextLesson = currentIndex < this._allLessons.length - 1
                ? this._allLessons[currentIndex + 1]
                : null;

            // Atualizar URL sem recarregar
            window.history.replaceState(
                null,
                '',
                `/player/${this._course.id}/${lessonId}`
            );

            // Renderizar conteúdo da aula
            this.renderLessonContent();

            // Carregar vídeo
            await this.loadVideoPlayer(lessonId);

            // Atualizar curriculo (aula ativa)
            this.updateActiveLessonInCurriculum(lessonId);

            // Atualizar progresso na sidebar
            this.updateSidebarProgress();

            // Analytics
            AnalyticsService.track('lesson_started', {
                lessonId,
                lessonTitle: lesson.title,
                courseId: this._course.id
            });

            EventBus.emit(APP_EVENTS.LESSON_STARTED, lesson);

        } catch (error) {
            console.error('Error loading lesson:', error);
            NotificationService.error('Erro ao carregar aula.');
        }
    },

    // Carregar player de vídeo
    async loadVideoPlayer(lessonId) {
        const videoSection = document.getElementById('player-video-section');
        if (!videoSection) return;

        const lesson = this._currentLesson;

        if (lesson.type === APP_CONFIG.LESSON_TYPES.VIDEO) {
            // Renderizar player
            videoSection.innerHTML = VideoPlayer.render(lessonId);

            // Inicializar player
            await VideoPlayer.init(lessonId);

        } else if (lesson.type === APP_CONFIG.LESSON_TYPES.PDF) {
            // Buscar URL do PDF
            const pdfData = await CourseService.getPdfUrl(lessonId);

            videoSection.innerHTML = `
                <div style="width:100%; height:600px; background:#fff">
                    <iframe
                        src="${pdfData.url}"
                        style="width:100%;height:100%;border:none"
                        title="${Validators.sanitize(lesson.title)}">
                    </iframe>
                </div>
            `;

            // Marcar como concluída após 30s visualizando PDF
            setTimeout(() => {
                ProgressService.markLessonComplete(lessonId);
            }, 30000);

        } else if (lesson.type === APP_CONFIG.LESSON_TYPES.QUIZ) {
            // Renderizar quiz
            videoSection.innerHTML = `
                <div style="background: var(--color-bg-secondary);
                            padding: var(--spacing-2xl)">
                    <div style="max-width: 700px; margin: 0 auto">
                        <div id="quiz-wrapper">
                            <div class="loader-spinner" style="margin: 0 auto">
                            </div>
                        </div>
                    </div>
                </div>
            `;

            await this.loadQuiz(lesson.content.quiz_id);
        }
    },

    // Carregar quiz
    async loadQuiz(quizId) {
        try {
            const response = await API.get(
                API_ENDPOINTS.QUIZ.DETAILS(quizId)
            );

            const wrapper = document.getElementById('quiz-wrapper');
            if (wrapper) {
                wrapper.innerHTML = QuizEngine.render(response.data);
            }
        } catch (error) {
            console.error('Error loading quiz:', error);
            NotificationService.error('Erro ao carregar quiz.');
        }
    },

    // Renderizar conteúdo da aula
    renderLessonContent() {
        const container = document.getElementById('lesson-content');
        if (!container || !this._currentLesson) return;

        const lesson = this._currentLesson;
        const progress = this._progress?.lessons_progress?.find(
            p => p.lesson_id === lesson.id
        );

        container.innerHTML = `
            <!-- Header da aula -->
            <div class="lesson-header">
                <div class="lesson-meta">
                    <span class="text-tertiary">
                        ${this.getLessonTypeIcon(lesson.type)}
                        ${this.getLessonTypeLabel(lesson.type)}
                    </span>
                    ${lesson.duration_seconds ? `
                        <span class="text-tertiary">•</span>
                        <span class="text-tertiary">
                            ${Formatters.duration(lesson.duration_seconds)}
                        </span>
                    ` : ''}
                    ${progress?.completed ? `
                        <span class="text-tertiary">•</span>
                        <span style="color: var(--color-success)">
                            ✅ Concluída
                        </span>
                    ` : ''}
                </div>

                <h1 class="lesson-title">
                    ${Validators.sanitize(lesson.title)}
                </h1>

                <!-- Ações da aula -->
                <div class="lesson-actions">
                    ${!progress?.completed ? `
                        <button
                            class="btn btn-secondary btn-sm"
                            id="mark-complete-btn"
                            onclick="Player.markCurrentComplete()">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor"
                                 width="16" height="16">
                                <path stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Marcar como concluída
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Descrição da aula -->
            ${lesson.description ? `
                <div class="lesson-description">
                    <h4>Sobre esta aula</h4>
                    <p>${Validators.sanitize(lesson.description)}</p>
                </div>
            ` : ''}

            <!-- Recursos/Downloads -->
            ${lesson.resources?.length ? `
                <div class="lesson-resources">
                    <h4 class="lesson-resources-title">
                        📎 Materiais complementares
                    </h4>
                    <div class="lesson-resources-list">
                        ${lesson.resources.map(resource => `
                            <div class="resource-item">
                                <div class="resource-info">
                                    <div class="resource-icon">
                                        ${this.getResourceIcon(resource.type)}
                                    </div>
                                    <div>
                                        <p class="resource-name">
                                            ${Validators.sanitize(resource.name)}
                                        </p>
                                        <p class="resource-size text-xs text-tertiary">
                                            ${Formatters.fileSize(resource.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    class="btn btn-secondary btn-sm"
                                    onclick="Player.downloadResource(
                                        '${resource.id}',
                                        '${Validators.sanitize(resource.name)}'
                                    )">
                                    ⬇️ Baixar
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Navegação entre aulas -->
            <div class="player-navigation">
                ${this._prevLesson ? `
                    <button
                        class="btn btn-secondary"
                        onclick="Player.goToLesson('${this._prevLesson.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 24 24"
                             stroke="currentColor"
                             width="16" height="16">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M15 19l-7-7 7-7"/>
                        </svg>
                        Aula anterior
                    </button>
                ` : '<div></div>'}

                ${this._nextLesson ? `
                    <button
                        class="btn btn-primary"
                        onclick="Player.goToLesson('${this._nextLesson.id}')">
                        Próxima aula
                        <svg xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 24 24"
                             stroke="currentColor"
                             width="16" height="16">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                ` : `
                    <button
                        class="btn btn-success"
                        onclick="Player.finishCourse()">
                        🎉 Finalizar curso
                    </button>
                `}
            </div>
        `;
    },

    // Renderizar currículo na sidebar
    renderCurriculum() {
        const container = document.getElementById('curriculum-list');
        if (!container || !this._modules.length) return;

        container.innerHTML = this._modules.map((module, moduleIndex) => `
            <div class="curriculum-module ${moduleIndex === 0 ? 'open' : ''}"
                 id="player-module-${module.id}">
                <div class="curriculum-module-header"
                     onclick="Player.toggleModule('${module.id}')">
                    <div>
                        <p class="curriculum-module-title">
                            ${Validators.sanitize(module.title)}
                        </p>
                        <p class="curriculum-module-meta">
                            ${this.getModuleProgress(module)} •
                            ${Formatters.durationHuman(
                                (module.duration_minutes || 0) * 60
                            )}
                        </p>
                    </div>
                    <svg class="curriculum-module-icon"
                         xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" width="18" height="18">
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>

                <div class="curriculum-lessons">
                    ${(module.lessons || []).map(lesson => {
                        const lessonProgress =
                            this._progress?.lessons_progress?.find(
                                p => p.lesson_id === lesson.id
                            );
                        const isCompleted = lessonProgress?.completed;

                        return `
                            <div
                                class="curriculum-lesson
                                       ${isCompleted ? 'completed' : ''}
                                       ${lesson.is_locked ? 'locked' : ''}"
                                id="lesson-item-${lesson.id}"
                                onclick="${!lesson.is_locked
                                    ? `Player.goToLesson('${lesson.id}')`
                                    : ''
                                }"
                                title="${lesson.is_locked
                                    ? 'Complete a aula anterior para desbloquear'
                                    : Validators.sanitize(lesson.title)
                                }">

                                <span class="curriculum-lesson-check">
                                    ${isCompleted
                                        ? `<svg xmlns="http://www.w3.org/2000/svg"
                                                fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                width="18" height="18">
                                                <path stroke-linecap="round"
                                                      stroke-linejoin="round"
                                                      stroke-width="2"
                                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                           </svg>`
                                        : lesson.is_locked
                                        ? `<svg xmlns="http://www.w3.org/2000/svg"
                                                fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                width="18" height="18">
                                                <path stroke-linecap="round"
                                                      stroke-linejoin="round"
                                                      stroke-width="2"
                                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                           </svg>`
                                        : `<svg xmlns="http://www.w3.org/2000/svg"
                                                fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                width="18" height="18">
                                                <path stroke-linecap="round"
                                                      stroke-linejoin="round"
                                                      stroke-width="2"
                                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                                <path stroke-linecap="round"
                                                      stroke-linejoin="round"
                                                      stroke-width="2"
                                                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                           </svg>`
                                    }
                                </span>

                                <div class="curriculum-lesson-info">
                                    <p class="curriculum-lesson-title">
                                        ${Validators.sanitize(lesson.title)}
                                    </p>
                                    <p class="curriculum-lesson-duration">
                                        ${this.getLessonTypeIcon(lesson.type)}
                                        ${Formatters.duration(
                                            lesson.duration_seconds || 0
                                        )}
                                    </p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    },

    // Atualizar aula ativa no currículo
    updateActiveLessonInCurriculum(lessonId) {
        // Remover active anterior
        document.querySelectorAll('.curriculum-lesson.active').forEach(el => {
            el.classList.remove('active');
        });

        // Adicionar active na aula atual
        const lessonItem = document.getElementById(`lesson-item-${lessonId}`);
        if (lessonItem) {
            lessonItem.classList.add('active');

            // Garantir que o módulo pai está aberto
            const module = lessonItem.closest('.curriculum-module');
            if (module) {
                module.classList.add('open');
            }

            // Scroll suave para a aula
            lessonItem.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    },

    // Atualizar progresso na sidebar
    updateSidebarProgress() {
        const progressContainer = document.getElementById('sidebar-progress');
        const progressBar = document.getElementById('sidebar-progress-bar');

        if (!this._progress) return;

        const percentage = this._progress.percentage || 0;
        const completed = this._progress.completed_lessons || 0;
        const total = this._allLessons.length;

        if (progressContainer) {
            progressContainer.textContent =
                `${completed} de ${total} aulas concluídas`;
        }

        if (progressBar) {
            progressBar.innerHTML = ProgressBar.create({
                percentage,
                size: 'sm',
                variant: percentage === 100 ? 'success' : 'primary'
            });
        }
    },

    // Ir para aula específica
    async goToLesson(lessonId) {
        // Destruir player atual
        VideoPlayer.destroy();

        // Carregar nova aula
        await this.loadLesson(lessonId);

        // Scroll para o topo do player
        const videoSection = document.getElementById('player-video-section');
        if (videoSection) {
            videoSection.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // Marcar aula atual como concluída manualmente
    async markCurrentComplete() {
        if (!this._currentLesson) return;

        const btn = document.getElementById('mark-complete-btn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Marcando...';
        }

        await ProgressService.markLessonComplete(this._currentLesson.id);

        // Recarregar progresso
        this._progress = await ProgressService.getCourseProgress(
            this._course.id
        );

        // Atualizar UI
        this.renderLessonContent();
        this.renderCurriculum();
        this.updateActiveLessonInCurriculum(this._currentLesson.id);
        this.updateSidebarProgress();
    },

    // Download de recurso com signed URL
    async downloadResource(resourceId, filename) {
        try {
            const response = await API.get(
                `/lessons/${this._currentLesson.id}/resources/${resourceId}/url`
            );

            const link = document.createElement('a');
            link.href = response.data.url;
            link.download = filename;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            AnalyticsService.track('resource_downloaded', {
                resourceId,
                lessonId: this._currentLesson.id
            });

        } catch (error) {
            NotificationService.error('Erro ao baixar arquivo.');
        }
    },

    // Finalizar curso
    async finishCourse() {
        await ProgressService.markLessonComplete(this._currentLesson.id);

        const confirmed = await ModalService.confirm({
            title: '🎉 Parabéns!',
            message: `Você concluiu o curso "${this._course.title}"! 
                     Deseja voltar para a página de cursos?`,
            confirmLabel: 'Ver meus cursos',
            cancelLabel: 'Continuar aqui',
            type: 'primary'
        });

        if (confirmed) {
            Router.navigate(ROUTES.MY_COURSES);
        }
    },

    // Toggle sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('player-sidebar');
        if (sidebar) sidebar.classList.toggle('open');
    },

    // Toggle módulo
    toggleModule(moduleId) {
        const module = document.getElementById(`player-module-${moduleId}`);
        if (module) module.classList.toggle('open');
    },

    // Calcular progresso do módulo
    getModuleProgress(module) {
        const lessons = module.lessons || [];
        if (!lessons.length) return '0/0 aulas';

        const completed = lessons.filter(lesson => {
            return this._progress?.lessons_progress?.find(
                p => p.lesson_id === lesson.id && p.completed
            );
        }).length;

        return `${completed}/${lessons.length} aulas`;
    },

    // Inicializar event listeners
    initEventListeners() {
        // Auto-play próxima aula
        EventBus.on('lesson:request-next', () => {
            if (this._nextLesson) {
                this.goToLesson(this._nextLesson.id);
            }
        });

        // Atualizar progresso quando aula concluída
        EventBus.on(APP_EVENTS.LESSON_COMPLETED, async ({ lessonId }) => {
            // Atualizar progresso
            this._progress = await ProgressService.getCourseProgress(
                this._course.id
            );

            // Atualizar UI do currículo
            const lessonItem = document.getElementById(
                `lesson-item-${lessonId}`
            );
            if (lessonItem) {
                lessonItem.classList.add('completed');
            }

            // Atualizar sidebar
            this.updateSidebarProgress();

            // Desbloquear próxima aula se necessário
            this.unlockNextLesson(lessonId);
        });

        // Fechar sidebar ao clicar fora (mobile)
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('player-sidebar');
            const toggleBtn = document.getElementById('toggle-sidebar-btn');

            if (
                sidebar &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !toggleBtn?.contains(e.target)
            ) {
                sidebar.classList.remove('open');
            }
        });

        // Atalho de teclado: N para próxima aula
        document.addEventListener('keydown', (e) => {
            if (
                e.key === 'n' &&
                !e.ctrlKey &&
                !e.metaKey &&
                e.target.tagName !== 'INPUT' &&
                e.target.tagName !== 'TEXTAREA'
            ) {
                if (this._nextLesson) {
                    this.goToLesson(this._nextLesson.id);
                }
            }

            // P para aula anterior
            if (
                e.key === 'p' &&
                !e.ctrlKey &&
                !e.metaKey &&
                e.target.tagName !== 'INPUT' &&
                e.target.tagName !== 'TEXTAREA'
            ) {
                if (this._prevLesson) {
                    this.goToLesson(this._prevLesson.id);
                }
            }
        });
    },

    // Desbloquear próxima aula
    unlockNextLesson(completedLessonId) {
        const currentIndex = this._allLessons.findIndex(
            l => l.id === completedLessonId
        );

        if (currentIndex === -1) return;

        const nextLesson = this._allLessons[currentIndex + 1];
        if (!nextLesson) return;

        // Atualizar na lista local
        nextLesson.is_locked = false;

        // Atualizar no DOM
        const nextItem = document.getElementById(
            `lesson-item-${nextLesson.id}`
        );
        if (nextItem) {
            nextItem.classList.remove('locked');
            nextItem.onclick = () => this.goToLesson(nextLesson.id);

            // Atualizar ícone de lock
            const check = nextItem.querySelector('.curriculum-lesson-check');
            if (check) {
                check.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" width="18" height="18">
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                `;
            }
        }
    },

    // Helpers de tipo de aula
    getLessonTypeIcon(type) {
        const icons = {
            video: '🎥',
            pdf: '📄',
            quiz: '📝',
            live: '🔴'
        };
        return icons[type] || '📖';
    },

    getLessonTypeLabel(type) {
        const labels = {
            video: 'Videoaula',
            pdf: 'Material PDF',
            quiz: 'Quiz',
            live: 'Aula ao vivo'
        };
        return labels[type] || 'Aula';
    },

    getResourceIcon(type) {
        const icons = {
            pdf: `<svg xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor"
                       width="20" height="20">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>`,
            zip: `<svg xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor"
                       width="20" height="20">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                  </svg>`
        };
        return icons[type] || icons.pdf;
    },

    // Skeletons
    renderLessonSkeleton() {
        return `
            <div class="lesson-header">
                <div class="card-skeleton card-skeleton-line"
                     style="width:100px;height:16px;margin-bottom:8px">
                </div>
                <div class="card-skeleton card-skeleton-line"
                     style="width:80%;height:36px;margin-bottom:16px">
                </div>
                <div class="card-skeleton card-skeleton-line"
                     style="width:60%;height:20px">
                </div>
            </div>
        `;
    },

    renderCurriculumSkeleton() {
        return Array(5).fill(0).map(() => `
            <div class="card-skeleton"
                 style="height:56px;margin:4px 0;border-radius:0">
            </div>
        `).join('');
    }
};