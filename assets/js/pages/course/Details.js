// Details.js - Página de detalhes do curso

const CourseDetails = {
    _course: null,
    _hasAccess: false,
    _activeTab: 'curriculum',

    async render(params) {
        return `
            <div class="dashboard-layout">
                ${Dashboard.renderNavbar()}
                <div id="course-details-content">
                    ${this.renderSkeleton()}
                </div>
            </div>
        `;
    },

    async init(params) {
        try {
            const [course, hasAccess] = await Promise.all([
                CourseService.getCourseBySlug(params.slug),
                State.isAuthenticated()
                    ? CourseService.checkCourseAccess(params.slug)
                    : Promise.resolve(false)
            ]);

            this._course = course;
            this._hasAccess = hasAccess;

            this.renderContent();

        } catch (error) {
            console.error('Error loading course details:', error);
            NotificationService.error('Erro ao carregar curso.');
        }
    },

    renderContent() {
        const container = document.getElementById('course-details-content');
        if (!container || !this._course) return;

        const course = this._course;

        SEO.updateMeta({
            title: course.title,
            description: course.description,
            image: course.thumbnail_url
        });

        SEO.setBreadcrumb([
            { name: 'Início', url: window.location.origin },
            { name: 'Cursos', url: window.location.origin + ROUTES.COURSES },
            { name: course.title, url: window.location.href }
        ]);

        container.innerHTML = `
            <!-- Hero do curso -->
            <div style="background: linear-gradient(135deg,
                        #1e1b4b 0%, #312e81 100%);
                        padding: var(--spacing-3xl) 0;
                        margin-bottom: 0">
                <div class="container">
                    <div class="flex gap-2xl" style="align-items: center">

                        <!-- Informações do curso -->
                        <div class="flex-1">
                            ${course.metadata?.category ? `
                                <span style="display: inline-block;
                                             padding: 4px 12px;
                                             background: rgba(255,255,255,0.15);
                                             color: white;
                                             border-radius: var(--radius-full);
                                             font-size: var(--text-sm);
                                             margin-bottom: var(--spacing-md)">
                                    ${Validators.sanitize(course.metadata.category)}
                                </span>
                            ` : ''}

                            <h1 style="font-size: var(--text-4xl);
                                       font-weight: var(--font-bold);
                                       color: white;
                                       margin-bottom: var(--spacing-md);
                                       line-height: var(--leading-tight)">
                                ${Validators.sanitize(course.title)}
                            </h1>

                            <p style="font-size: var(--text-lg);
                                      color: rgba(255,255,255,0.8);
                                      margin-bottom: var(--spacing-lg);
                                      line-height: var(--leading-relaxed)">
                                ${Validators.sanitize(course.description)}
                            </p>

                            <!-- Rating e Meta -->
                            <div class="flex items-center gap-lg flex-wrap"
                                 style="color: rgba(255,255,255,0.8);
                                        font-size: var(--text-sm);
                                        margin-bottom: var(--spacing-lg)">
                                ${course.rating ? `
                                    <span style="color: var(--color-warning);
                                                 font-weight: var(--font-semibold)">
                                        ★ ${course.rating.average.toFixed(1)}
                                        <span style="color: rgba(255,255,255,0.6)">
                                            (${Formatters.number(course.rating.count)} avaliações)
                                        </span>
                                    </span>
                                ` : ''}

                                ${course.metadata?.students_count ? `
                                    <span>
                                        👥 ${Formatters.number(course.metadata.students_count)} alunos
                                    </span>
                                ` : ''}

                                ${course.metadata?.duration_minutes ? `
                                    <span>
                                        ⏱️ ${Formatters.durationHuman(
                                            course.metadata.duration_minutes * 60
                                        )}
                                    </span>
                                ` : ''}

                                ${course.metadata?.level ? `
                                    <span>
                                        📊 ${CourseCard.getLevelLabel(course.metadata.level)}
                                    </span>
                                ` : ''}
                            </div>

                            <!-- Instrutor -->
                            ${course.instructor ? `
                                <div class="flex items-center gap-sm">
                                    <div style="width: 36px; height: 36px;
                                                border-radius: 50%;
                                                background: var(--color-primary);
                                                display: flex; align-items: center;
                                                justify-content: center;
                                                color: white; font-weight: 600;
                                                font-size: var(--text-sm)">
                                        ${course.instructor.avatar_url ? `
                                            <img src="${course.instructor.avatar_url}"
                                                 style="width:100%;height:100%;
                                                        border-radius:50%;
                                                        object-fit:cover"
                                                 alt="${course.instructor.name}"/>
                                        ` : Formatters.initials(course.instructor.name)}
                                    </div>
                                    <span style="color: rgba(255,255,255,0.8);
                                                 font-size: var(--text-sm)">
                                        Por
                                        <strong style="color: white">
                                            ${Validators.sanitize(course.instructor.name)}
                                        </strong>
                                    </span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Card de compra -->
                        <div style="width: 360px; flex-shrink: 0">
                            ${this.renderPurchaseCard()}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Conteúdo principal -->
            <div class="container" style="padding-top: var(--spacing-2xl);
                                          padding-bottom: var(--spacing-2xl)">
                <div class="tabs mb-xl" id="details-tabs">
                    ${[
                        { id: 'curriculum', label: '📚 Conteúdo' },
                        { id: 'overview', label: 'ℹ️ Sobre' },
                        { id: 'reviews', label: '⭐ Avaliações' }
                    ].map(tab => `
                        <button
                            class="tab-item ${tab.id === 'curriculum'
                                ? 'active' : ''}"
                            data-tab="${tab.id}"
                            onclick="CourseDetails.switchTab('${tab.id}')">
                            ${tab.label}
                        </button>
                    `).join('')}
                </div>

                <div id="details-tab-content">
                    ${this.renderCurriculumTab()}
                </div>
            </div>
        `;

        this.loadModules();
    },

    // Card de compra/acesso
    renderPurchaseCard() {
        const course = this._course;

        return `
            <div class="card" style="position: sticky; top: 80px">
                <!-- Thumbnail/Preview -->
                <div style="position: relative; aspect-ratio: 16/9;
                            overflow: hidden; background: #000">
                    <img
                        src="${course.thumbnail_url}"
                        alt="${Validators.sanitize(course.title)}"
                        style="width:100%;height:100%;object-fit:cover;
                               opacity: 0.7"
                    />
                    ${course.trailer_url ? `
                        <button
                            onclick="CourseDetails.playTrailer()"
                            style="position: absolute; top: 50%; left: 50%;
                                   transform: translate(-50%,-50%);
                                   width: 64px; height: 64px;
                                   border-radius: 50%;
                                   background: rgba(255,255,255,0.9);
                                   display: flex; align-items: center;
                                   justify-content: center;
                                   border: none; cursor: pointer"
                            aria-label="Ver preview">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 24 24" fill="var(--color-primary)"
                                 width="28" height="28">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                        <span style="position: absolute; bottom: 8px;
                                     left: 50%; transform: translateX(-50%);
                                     color: white; font-size: var(--text-sm);
                                     font-weight: var(--font-medium);
                                     text-shadow: 0 1px 3px rgba(0,0,0,0.8)">
                            Preview do curso
                        </span>
                    ` : ''}
                </div>

                <div class="card-body">
                    ${this._hasAccess ? `
                        <!-- Já tem acesso -->
                        <button
                            class="btn btn-success btn-block btn-lg mb-md"
                            onclick="CourseDetails.startCourse()">
                            ▶️ Continuar curso
                        </button>
                        ${ProgressBar.createWithLabel({
                            percentage: course.progress?.percentage || 0,
                            label: `${course.progress?.percentage || 0}% concluído`,
                            showPercentage: false
                        })}
                    ` : `
                        <!-- Comprar/Matricular -->
                        <div style="margin-bottom: var(--spacing-md)">
                            <div style="font-size: var(--text-4xl);
                                        font-weight: var(--font-bold);
                                        color: var(--color-text-primary)">
                                ${Formatters.currency(course.price)}
                            </div>
                        </div>

                        <button
                            class="btn btn-primary btn-block btn-lg mb-sm"
                            onclick="CourseDetails.enrollCourse()">
                            🚀 Matricular-se agora
                        </button>

                        <p class="text-center text-xs text-tertiary mt-sm">
                            🔒 Acesso vitalício • 📱 Acesso mobile
                        </p>
                    `}

                    <!-- Includes -->
                    <div style="margin-top: var(--spacing-lg);
                                padding-top: var(--spacing-lg);
                                border-top: 1px solid var(--color-border)">
                        <h4 class="text-sm font-semibold mb-md">
                            Este curso inclui:
                        </h4>
                        <ul style="display:flex;flex-direction:column;
                                   gap: var(--spacing-sm)">
                            ${course.metadata?.duration_minutes ? `
                                <li class="flex items-center gap-sm text-sm">
                                    🎥
                                    ${Formatters.durationHuman(
                                        course.metadata.duration_minutes * 60
                                    )} de videoaulas
                                </li>
                            ` : ''}
                            ${course.metadata?.lessons_count ? `
                                <li class="flex items-center gap-sm text-sm">
                                    📖 ${course.metadata.lessons_count} aulas
                                </li>
                            ` : ''}
                            <li class="flex items-center gap-sm text-sm">
                                📥 Materiais para download
                            </li>
                            <li class="flex items-center gap-sm text-sm">
                                ♾️ Acesso vitalício
                            </li>
                            <li class="flex items-center gap-sm text-sm">
                                🏆 Certificado de conclusão
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },

    // Tab de currículo
    renderCurriculumTab() {
        return `
            <div id="curriculum-container">
                ${Array(3).fill(0).map(() => `
                    <div class="card-skeleton mb-sm"
                         style="height:60px;border-radius:var(--radius-md)">
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Tab sobre
    renderOverviewTab() {
        const course = this._course;

        return `
            <div class="card">
                <div class="card-body">
                    <h3 class="h3">Sobre o curso</h3>
                    <div class="text-secondary"
                         style="line-height: var(--leading-relaxed)">
                        ${Validators.sanitize(
                            course.long_description || course.description
                        )}
                    </div>

                    ${course.requirements?.length ? `
                        <h4 class="h4 mt-xl">Requisitos</h4>
                        <ul style="display:flex;flex-direction:column;
                                   gap:var(--spacing-sm)">
                            ${course.requirements.map(req => `
                                <li class="flex items-center gap-sm text-secondary">
                                    <span style="color:var(--color-primary)">•</span>
                                    ${Validators.sanitize(req)}
                                </li>
                            `).join('')}
                        </ul>
                    ` : ''}

                    ${course.what_you_learn?.length ? `
                        <h4 class="h4 mt-xl">O que você vai aprender</h4>
                        <div style="display:grid;
                                    grid-template-columns: repeat(2,1fr);
                                    gap:var(--spacing-sm)">
                            ${course.what_you_learn.map(item => `
                                <div class="flex items-start gap-sm text-sm">
                                    <span style="color:var(--color-success);
                                                 flex-shrink:0">✓</span>
                                    ${Validators.sanitize(item)}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Tab avaliações
    renderReviewsTab() {
        return `
            <div id="reviews-container">
                <div class="card-skeleton"
                     style="height:200px;border-radius:var(--radius-lg)">
                </div>
            </div>
        `;
    },

    // Carregar módulos do currículo
    async loadModules() {
        try {
            const modules = await CourseService.getCourseModules(this._course.id);
            this.renderModules(modules);
        } catch (error) {
            console.error('Error loading modules:', error);
        }
    },

    renderModules(modules) {
        const container = document.getElementById('curriculum-container');
        if (!container) return;

        if (!modules || modules.length === 0) {
            container.innerHTML = `
                <p class="text-secondary text-center p-xl">
                    Conteúdo em breve.
                </p>
            `;
            return;
        }

        container.innerHTML = modules.map((module, index) => `
            <div class="curriculum-module ${index === 0 ? 'open' : ''}"
                 id="module-${module.id}">
                <div class="curriculum-module-header"
                     onclick="CourseDetails.toggleModule('${module.id}')">
                    <div>
                        <p class="curriculum-module-title">
                            ${Validators.sanitize(module.title)}
                        </p>
                        <p class="curriculum-module-meta">
                            ${module.lessons?.length || 0} aulas •
                            ${Formatters.durationHuman(
                                (module.duration_minutes || 0) * 60
                            )}
                        </p>
                    </div>
                    <svg class="curriculum-module-icon"
                         xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </div>
                <div class="curriculum-lessons">
                    ${(module.lessons || []).map(lesson => `
                        <div class="curriculum-lesson
                             ${!this._hasAccess && !lesson.is_preview
                                ? 'locked' : ''}
                             ${lesson.progress?.completed ? 'completed' : ''}"
                             onclick="${this._hasAccess || lesson.is_preview
                                ? `Router.navigate('/player/${this._course.id}/${lesson.id}')`
                                : ''}">
                            <span class="curriculum-lesson-check">
                                ${lesson.progress?.completed
                                    ? `<svg xmlns="http://www.w3.org/2000/svg"
                                            fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            width="20" height="20">
                                            <path stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                       </svg>`
                                    : !this._hasAccess && !lesson.is_preview
                                    ? `<svg xmlns="http://www.w3.org/2000/svg"
                                            fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            width="20" height="20">
                                            <path stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                       </svg>`
                                    : `<svg xmlns="http://www.w3.org/2000/svg"
                                            fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            width="20" height="20">
                                            <path stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                            <path stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                       </svg>`}
                            </span>
                            <div class="curriculum-lesson-info">
                                <p class="curriculum-lesson-title">
                                    ${Validators.sanitize(lesson.title)}
                                </p>
                                <p class="curriculum-lesson-duration">
                                    ${lesson.is_preview
                                        ? '🔓 Preview • '
                                        : ''}
                                    ${Formatters.duration(
                                        lesson.duration_seconds || 0
                                    )}
                                </p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    toggleModule(moduleId) {
        const module = document.getElementById(`module-${moduleId}`);
        if (module) module.classList.toggle('open');
    },

    // Trocar tab
    switchTab(tab) {
        this._activeTab = tab;

        document.querySelectorAll('[data-tab]').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        const content = document.getElementById('details-tab-content');
        if (!content) return;

        switch (tab) {
            case 'curriculum':
                content.innerHTML = this.renderCurriculumTab();
                this.loadModules();
                break;
            case 'overview':
                content.innerHTML = this.renderOverviewTab();
                break;
            case 'reviews':
                content.innerHTML = this.renderReviewsTab();
                this.loadReviews();
                break;
        }
    },

    // Carregar avaliações
    async loadReviews() {
        try {
            const reviews = await CourseService.getCourseReviews(
                this._course.id
            );

            const container = document.getElementById('reviews-container');
            if (!container) return;

            if (!reviews.reviews?.length) {
                container.innerHTML = `
                    <div class="dashboard-empty">
                        <p class="dashboard-empty-title">
                            Sem avaliações ainda
                        </p>
                        <p class="dashboard-empty-description">
                            Seja o primeiro a avaliar este curso!
                        </p>
                    </div>
                `;
                return;
            }

            container.innerHTML = reviews.reviews.map(review => `
                <div class="card mb-md">
                    <div class="card-body">
                        <div class="flex items-center gap-md mb-sm">
                            <div style="width:40px;height:40px;border-radius:50%;
                                        background:var(--color-primary);
                                        display:flex;align-items:center;
                                        justify-content:center;
                                        color:white;font-weight:600">
                                ${Formatters.initials(review.user.name)}
                            </div>
                            <div>
                                <p class="font-semibold">
                                    ${Validators.sanitize(review.user.name)}
                                </p>
                                <div style="color:var(--color-warning)">
                                    ${'★'.repeat(review.rating)}
                                    ${'☆'.repeat(5 - review.rating)}
                                </div>
                            </div>
                            <span class="text-xs text-tertiary ml-auto">
                                ${Formatters.timeAgo(review.created_at)}
                            </span>
                        </div>
                        <p class="text-secondary text-sm">
                            ${Validators.sanitize(review.comment)}
                        </p>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    },

    // Iniciar curso (já matriculado)
    async startCourse() {
        try {
            const progress = await CourseService.getContinueWatching();

            if (progress?.lesson_id) {
                Router.navigate(
                    `/player/${this._course.id}/${progress.lesson_id}`
                );
            } else {
                const modules = await CourseService.getCourseModules(
                    this._course.id
                );
                const firstLesson = modules?.[0]?.lessons?.[0];

                if (firstLesson) {
                    Router.navigate(
                        `/player/${this._course.id}/${firstLesson.id}`
                    );
                }
            }
        } catch (error) {
            NotificationService.error('Erro ao iniciar curso.');
        }
    },

    // Matricular no curso
    async enrollCourse() {
        if (!State.isAuthenticated()) {
            Router.navigate(
                `${ROUTES.LOGIN}?redirect=${encodeURIComponent(
                    window.location.pathname
                )}`
            );
            return;
        }

        NotificationService.info('Redirecionando para o checkout...');
        Router.navigate(`/checkout/${this._course.id}`);
    },

    // Play trailer
    playTrailer() {
        if (!this._course.trailer_url) return;

        ModalService.open({
            title: 'Preview do curso',
            size: 'lg',
            content: `
                <div style="aspect-ratio:16/9;background:#000;
                            border-radius:var(--radius-md);overflow:hidden">
                    <video
                        src="${this._course.trailer_url}"
                        controls
                        autoplay
                        style="width:100%;height:100%">
                    </video>
                </div>
            `
        });
    },

    renderSkeleton() {
        return `
            <div style="background: var(--color-bg-tertiary);
                        height: 400px; margin-bottom: var(--spacing-2xl)">
            </div>
            <div class="container">
                <div class="card-skeleton"
                     style="height:300px;border-radius:var(--radius-lg)">
                </div>
            </div>
        `;
    }
};