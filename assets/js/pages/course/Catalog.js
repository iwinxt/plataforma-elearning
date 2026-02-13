// Catalog.js - Catálogo de cursos

const Catalog = {
    _courses: [],
    _categories: [],
    _filters: {
        search: '',
        category: null,
        level: null,
        sort: 'popular'
    },
    _page: 1,
    _hasMore: true,
    _loading: false,
    _searchDebounce: null,

    async render() {
        return `
            <div class="dashboard-layout">
                ${Dashboard.renderNavbar()}
                <div class="dashboard-content">

                    <!-- Hero do catálogo -->
                    <div style="background: linear-gradient(135deg,
                                var(--color-primary) 0%,
                                var(--color-primary-dark) 100%);
                                border-radius: var(--radius-xl);
                                padding: var(--spacing-3xl) var(--spacing-2xl);
                                margin-bottom: var(--spacing-2xl);
                                text-align: center;
                                color: white;">
                        <h1 style="font-size: var(--text-4xl);
                                   font-weight: var(--font-bold);
                                   margin-bottom: var(--spacing-md);
                                   color: white">
                            Explore nossos cursos
                        </h1>
                        <p style="font-size: var(--text-lg);
                                  opacity: 0.9;
                                  margin-bottom: var(--spacing-xl)">
                            Mais de 500 cursos para acelerar sua carreira
                        </p>

                        <!-- Busca -->
                        <div class="search-input-wrapper"
                             style="max-width: 600px; margin: 0 auto">
                            <span class="form-input-icon-left"
                                  style="color: var(--color-text-tertiary)">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor"
                                     width="20" height="20">
                                    <path stroke-linecap="round"
                                          stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
                                </svg>
                            </span>
                            <input
                                type="search"
                                id="catalog-search"
                                class="form-input search-input"
                                style="font-size: var(--text-lg);
                                       padding: var(--spacing-md) var(--spacing-md)
                                               var(--spacing-md) 48px;
                                       border-radius: var(--radius-full)"
                                placeholder="Buscar cursos, tecnologias, habilidades..."
                                oninput="Catalog.onSearch(this.value)"
                                autocomplete="off"
                            />
                        </div>
                    </div>

                    <!-- Filtros e Grid -->
                    <div class="flex gap-xl" style="align-items: flex-start">

                        <!-- Sidebar de filtros -->
                        <div style="width: 240px; flex-shrink: 0"
                             id="filters-sidebar">
                            ${this.renderFiltersSkeleton()}
                        </div>

                        <!-- Conteúdo principal -->
                        <div class="flex-1">

                            <!-- Barra de resultados -->
                            <div class="flex items-center justify-between mb-lg">
                                <p class="text-secondary text-sm"
                                   id="results-count">
                                    Carregando...
                                </p>
                                <div class="flex items-center gap-sm">
                                    <label class="text-sm text-secondary">
                                        Ordenar por:
                                    </label>
                                    <select
                                        class="form-select"
                                        style="width: auto"
                                        id="sort-select"
                                        onchange="Catalog.setSort(this.value)">
                                        <option value="popular">Mais populares</option>
                                        <option value="newest">Mais recentes</option>
                                        <option value="rating">Melhor avaliados</option>
                                        <option value="price_asc">Menor preço</option>
                                        <option value="price_desc">Maior preço</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Grid de cursos -->
                            <div id="catalog-grid">
                                ${CourseCard.createGrid([], { loading: true })}
                            </div>

                            <!-- Load More -->
                            <div id="catalog-load-more"
                                 class="text-center mt-xl">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        SEO.setTitle('Catálogo de Cursos');
        SEO.setDescription('Explore nossos cursos online e aprenda no seu ritmo.');

        await Promise.all([
            this.loadCategories(),
            this.loadCourses()
        ]);

        this.initInfiniteScroll();
        this.checkUrlFilters();
    },

    // Verificar filtros na URL
    checkUrlFilters() {
        const query = Router.getCurrentRoute()?.query || {};

        if (query.search) {
            this._filters.search = query.search;
            const searchInput = document.getElementById('catalog-search');
            if (searchInput) searchInput.value = query.search;
        }

        if (query.category) {
            this._filters.category = query.category;
        }

        if (Object.keys(query).length > 0) {
            this.loadCourses(true);
        }
    },

    // Carregar categorias
    async loadCategories() {
        try {
            const categories = await CourseService.getCategories();
            this._categories = categories;
            this.renderFilters();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    // Renderizar sidebar de filtros
    renderFilters() {
        const sidebar = document.getElementById('filters-sidebar');
        if (!sidebar) return;

        sidebar.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="flex items-center justify-between">
                        <h3 class="h5 mb-0">Filtros</h3>
                        ${this.hasActiveFilters() ? `
                            <button
                                class="btn-ghost text-sm"
                                onclick="Catalog.clearFilters()">
                                Limpar
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="card-body">

                    <!-- Categorias -->
                    <div class="mb-lg">
                        <h4 class="text-sm font-semibold text-secondary uppercase
                                   mb-sm"
                            style="letter-spacing: 0.05em">
                            Categoria
                        </h4>
                        <div class="flex flex-col gap-xs">
                            <label class="form-check-label">
                                <input
                                    type="radio"
                                    class="form-radio"
                                    name="category"
                                    value=""
                                    ${!this._filters.category ? 'checked' : ''}
                                    onchange="Catalog.setCategory(null)"
                                />
                                <span class="text-sm">Todas</span>
                            </label>
                            ${this._categories.map(cat => `
                                <label class="form-check-label">
                                    <input
                                        type="radio"
                                        class="form-radio"
                                        name="category"
                                        value="${cat.id}"
                                        ${this._filters.category === cat.id
                                            ? 'checked' : ''}
                                        onchange="Catalog.setCategory('${cat.id}')"
                                    />
                                    <span class="text-sm">
                                        ${Validators.sanitize(cat.name)}
                                        <span class="text-tertiary">
                                            (${cat.courses_count})
                                        </span>
                                    </span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Nível -->
                    <div class="mb-lg">
                        <h4 class="text-sm font-semibold text-secondary uppercase
                                   mb-sm"
                            style="letter-spacing: 0.05em">
                            Nível
                        </h4>
                        <div class="flex flex-col gap-xs">
                            ${[
                                { value: null, label: 'Todos' },
                                { value: 'beginner', label: 'Iniciante' },
                                { value: 'intermediate', label: 'Intermediário' },
                                { value: 'advanced', label: 'Avançado' }
                            ].map(level => `
                                <label class="form-check-label">
                                    <input
                                        type="radio"
                                        class="form-radio"
                                        name="level"
                                        value="${level.value || ''}"
                                        ${this._filters.level === level.value
                                            ? 'checked' : ''}
                                        onchange="Catalog.setLevel(
                                            ${level.value
                                                ? `'${level.value}'`
                                                : 'null'})"
                                    />
                                    <span class="text-sm">${level.label}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderFiltersSkeleton() {
        return `
            <div class="card-skeleton"
                 style="height: 320px; border-radius: var(--radius-lg)">
            </div>
        `;
    },

    // Carregar cursos
    async loadCourses(reset = false) {
        if (this._loading) return;

        if (reset) {
            this._page = 1;
            this._courses = [];
            this._hasMore = true;

            const grid = document.getElementById('catalog-grid');
            if (grid) {
                grid.innerHTML = CourseCard.createGrid([], { loading: true });
            }
        }

        this._loading = true;

        try {
            let response;

            if (this._filters.search) {
                response = await CourseService.searchCourses(
                    this._filters.search,
                    {
                        page: this._page,
                        limit: APP_CONFIG.DEFAULT_PAGE_SIZE,
                        category: this._filters.category,
                        level: this._filters.level,
                        sort: this._filters.sort
                    }
                );
            } else {
                response = await CourseService.getCourses({
                    page: this._page,
                    limit: APP_CONFIG.DEFAULT_PAGE_SIZE,
                    category: this._filters.category,
                    level: this._filters.level,
                    sort: this._filters.sort
                });
            }

            const newCourses = response.courses || [];
            this._courses = reset
                ? newCourses
                : [...this._courses, ...newCourses];

            this._hasMore = response.pagination?.has_more || false;
            this._page++;

            this.renderCourses(response.pagination?.total || 0);

        } catch (error) {
            console.error('Error loading courses:', error);
            NotificationService.error('Erro ao carregar cursos.');
        } finally {
            this._loading = false;
        }
    },

    // Renderizar cursos
    renderCourses(total = 0) {
        const grid = document.getElementById('catalog-grid');
        const loadMore = document.getElementById('catalog-load-more');
        const resultsCount = document.getElementById('results-count');

        if (resultsCount) {
            resultsCount.textContent = this._filters.search
                ? `${total} resultado(s) para "${this._filters.search}"`
                : `${total} curso(s) encontrado(s)`;
        }

        if (grid) {
            grid.innerHTML = CourseCard.createGrid(this._courses);
            LazyLoader.refresh();
        }

        if (loadMore) {
            loadMore.innerHTML = this._hasMore ? `
                <button
                    class="btn btn-secondary"
                    id="load-more-btn"
                    onclick="Catalog.loadMore()">
                    Carregar mais cursos
                </button>
            ` : '';
        }
    },

    // Busca com debounce
    onSearch(value) {
        clearTimeout(this._searchDebounce);
        this._searchDebounce = setTimeout(() => {
            this._filters.search = value.trim();
            this.loadCourses(true);
        }, 400);
    },

    setCategory(categoryId) {
        this._filters.category = categoryId;
        this.loadCourses(true);
    },

    setLevel(level) {
        this._filters.level = level;
        this.loadCourses(true);
    },

    setSort(sort) {
        this._filters.sort = sort;
        this.loadCourses(true);
    },

    clearFilters() {
        this._filters = {
            search: '',
            category: null,
            level: null,
            sort: 'popular'
        };

        const searchInput = document.getElementById('catalog-search');
        if (searchInput) searchInput.value = '';

        this.renderFilters();
        this.loadCourses(true);
    },

    hasActiveFilters() {
        return !!(
            this._filters.search ||
            this._filters.category ||
            this._filters.level
        );
    },

    async loadMore() {
        const btn = document.getElementById('load-more-btn');
        if (btn) {
            btn.textContent = 'Carregando...';
            btn.disabled = true;
        }
        await this.loadCourses();
    },

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

        const sentinel = document.getElementById('catalog-load-more');
        if (sentinel) observer.observe(sentinel);
    }
};