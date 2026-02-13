// MyCourses.js - Página de cursos do aluno

const MyCourses = {
    _courses: [],
    _filter: 'all',
    _page: 1,
    _hasMore: true,
    _loading: false,

    async render() {
        return `
            <div class="dashboard-layout">
                ${Dashboard.renderNavbar()}
                <div class="dashboard-content">
                    <div class="dashboard-header">
                        <div class="dashboard-header-top">
                            <div>
                                <h1 class="dashboard-title">Meus Cursos</h1>
                                <p class="dashboard-subtitle">
                                    Acompanhe seu progresso em todos os cursos.
                                </p>
                            </div>
                            <div class="dashboard-actions">
                                <button
                                    onclick="Router.navigate('${ROUTES.COURSES}')"
                                    class="btn btn-primary">
                                    + Explorar mais cursos
                                </button>
                            </div>
                        </div>

                        <!-- Filtros -->
                        <div class="tabs" id="course-filters">
                            <button
                                class="tab-item active"
                                data-filter="all"
                                onclick="MyCourses.setFilter('all')">
                                Todos
                            </button>
                            <button
                                class="tab-item"
                                data-filter="in_progress"
                                onclick="MyCourses.setFilter('in_progress')">
                                Em andamento
                            </button>
                            <button
                                class="tab-item"
                                data-filter="completed"
                                onclick="MyCourses.setFilter('completed')">
                                Concluídos
                            </button>
                            <button
                                class="tab-item"
                                data-filter="not_started"
                                onclick="MyCourses.setFilter('not_started')">
                                Não iniciados
                            </button>
                        </div>
                    </div>

                    <!-- Grid de Cursos -->
                    <div id="my-courses-grid">
                        ${CourseCard.createGrid([], { loading: true })}
                    </div>

                    <!-- Load More -->
                    <div id="load-more-container" class="text-center mt-xl">
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        SEO.setTitle('Meus Cursos');
        await this.loadCourses();
        this.initInfiniteScroll();
    },

    // Carregar cursos
    async loadCourses(reset = false) {
        if (this._loading) return;

        if (reset) {
            this._page = 1;
            this._courses = [];
            this._hasMore = true;

            const grid = document.getElementById('my-courses-grid');
            if (grid) {
                grid.innerHTML = CourseCard.createGrid([], { loading: true });
            }
        }

        this._loading = true;

        try {
            const response = await CourseService.getMyCourses({
                page: this._page,
                limit: APP_CONFIG.DEFAULT_PAGE_SIZE,
                filter: this._filter !== 'all' ? this._filter : null
            });

            const newCourses = response.courses || [];

            this._courses = reset
                ? newCourses
                : [...this._courses, ...newCourses];

            this._hasMore = response.pagination?.has_more || false;
            this._page++;

            this.renderCourses();

        } catch (error) {
            console.error('Error loading my courses:', error);
            NotificationService.error('Erro ao carregar cursos.');
        } finally {
            this._loading = false;
        }
    },

    // Renderizar cursos
    renderCourses() {
        const grid = document.getElementById('my-courses-grid');
        const loadMore = document.getElementById('load-more-container');

        if (grid) {
            grid.innerHTML = CourseCard.createGrid(this._courses, {
                showProgress: true
            });
            LazyLoader.refresh();
        }

        if (loadMore) {
            loadMore.innerHTML = this._hasMore ? `
                <button
                    class="btn btn-secondary"
                    id="load-more-btn"
                    onclick="MyCourses.loadMore()">
                    Carregar mais cursos
                </button>
            ` : '';
        }
    },

    // Aplicar filtro
    async setFilter(filter) {
        this._filter = filter;

        // Atualizar tabs
        document.querySelectorAll('[data-filter]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        await this.loadCourses(true);
    },

    // Carregar mais
    async loadMore() {
        const btn = document.getElementById('load-more-btn');
        if (btn) {
            btn.textContent = 'Carregando...';
            btn.disabled = true;
        }

        await this.loadCourses();
    },

    // Infinite scroll
    initInfiniteScroll() {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    this._hasMore &&
                    !this._loading
                ) {
                    this.loadCourses();
                }
            },
            { rootMargin: '200px' }
        );

        const sentinel = document.getElementById('load-more-container');
        if (sentinel) observer.observe(sentinel);
    }
};