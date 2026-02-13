// Home.js - Dashboard principal do aluno

const Dashboard = {
    _data: null,
    
    async render() {
        return `
            <div class="dashboard-layout">
                ${this.renderNavbar()}
                <div class="dashboard-content">
                    <div id="dashboard-inner">
                        ${this.renderSkeleton()}
                    </div>
                </div>
            </div>
        `;
    },
    
    async init() {
        await this.loadData();
        this.renderContent();
        SEO.setTitle('Dashboard');
    },
    
    // Carregar dados do dashboard
    async loadData() {
        try {
            const [stats, continueWatching, myCourses] = await Promise.all([
                ProgressService.getDashboardStats(),
                CourseService.getContinueWatching(),
                CourseService.getMyCourses({ limit: 4 })
            ]);
            
            this._data = { stats, continueWatching, myCourses };
        } catch (error) {
            console.error('Error loading dashboard:', error);
            NotificationService.error('Erro ao carregar dashboard.');
        }
    },
    
    // Renderizar conteúdo após carregar dados
    renderContent() {
        const container = document.getElementById('dashboard-inner');
        if (!container || !this._data) return;
        
        const { stats, continueWatching, myCourses } = this._data;
        const user = State.getUser();
        
        container.innerHTML = `
            <!-- Header -->
            <div class="dashboard-header">
                <div class="dashboard-header-top">
                    <div>
                        <h1 class="dashboard-title">
                            Olá, ${Validators.sanitize(user?.name?.split(' ')[0] || 'Aluno')}! 👋
                        </h1>
                        <p class="dashboard-subtitle">
                            Continue de onde parou e alcance seus objetivos.
                        </p>
                    </div>
                    <div class="dashboard-actions">
                        <button 
                            onclick="Router.navigate('${ROUTES.COURSES}')" 
                            class="btn btn-primary">
                            Explorar cursos
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Stats -->
            ${this.renderStats(stats)}
            
            <!-- Continue Watching -->
            ${continueWatching ? this.renderContinueWatching(continueWatching) : ''}
            
            <!-- Meus Cursos -->
            <div class="dashboard-section">
                <div class="dashboard-section-header">
                    <h2 class="dashboard-section-title">Meus Cursos</h2>
                    <a href="${ROUTES.MY_COURSES}" 
                       class="dashboard-section-action">
                        Ver todos →
                    </a>
                </div>
                ${CourseCard.createGrid(myCourses?.courses || [], {
                    showProgress: true,
                    loading: false
                })}
            </div>
        `;
        
        // Refresh lazy loading
        LazyLoader.refresh();
    },
    
    // Renderizar estatísticas
    renderStats(stats) {
        if (!stats) return '';
        
        return `
            <div class="dashboard-stats">
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-header">
                        <div class="dashboard-stat-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                                 viewBox="0 0 24 24" stroke="currentColor" 
                                 width="20" height="20">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                        </div>
                    </div>
                    <div class="dashboard-stat-value">${stats.enrolled_courses || 0}</div>
                    <div class="dashboard-stat-label">Cursos matriculados</div>
                </div>
                
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-header">
                        <div class="dashboard-stat-icon" 
                             style="background: rgba(16,185,129,0.1); color: var(--color-success)">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                                 viewBox="0 0 24 24" stroke="currentColor" 
                                 width="20" height="20">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="dashboard-stat-value">${stats.completed_courses || 0}</div>
                    <div class="dashboard-stat-label">Cursos concluídos</div>
                </div>
                
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-header">
                        <div class="dashboard-stat-icon" 
                             style="background: rgba(245,158,11,0.1); color: var(--color-warning)">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                                 viewBox="0 0 24 24" stroke="currentColor" 
                                 width="20" height="20">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="dashboard-stat-value">
                        ${Formatters.durationHuman((stats.total_watch_time || 0) * 60)}
                    </div>
                    <div class="dashboard-stat-label">Tempo assistido</div>
                </div>
                
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-header">
                        <div class="dashboard-stat-icon" 
                             style="background: rgba(59,130,246,0.1); color: var(--color-info)">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                                 viewBox="0 0 24 24" stroke="currentColor" 
                                 width="20" height="20">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="dashboard-stat-value">
                        ${stats.completed_lessons || 0}
                    </div>
                    <div class="dashboard-stat-label">Aulas concluídas</div>
                </div>
            </div>
        `;
    },
    
    // Renderizar "continuar assistindo"
    renderContinueWatching(data) {
        return `
            <div class="dashboard-section">
                <div class="dashboard-section-header">
                    <h2 class="dashboard-section-title">Continuar assistindo</h2>
                </div>
                <div class="continue-watching">
                    <div class="continue-watching-card"
                         onclick="Router.navigate('/player/${data.course_id}/${data.lesson_id}')">
                        <div class="continue-watching-thumbnail">
                            <img 
                                data-src="${data.thumbnail_url}"
                                src="${LazyLoader.getPlaceholder({width:200,height:112})}"
                                alt="${Validators.sanitize(data.course_title)}"
                                class="lazy"
                            />
                            <div class="continue-watching-play">
                                <svg xmlns="http://www.w3.org/2000/svg" 
                                     viewBox="0 0 24 24" fill="white" 
                                     width="20" height="20">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                        </div>
                        <div class="continue-watching-info">
                            <p class="continue-watching-course text-sm text-tertiary">
                                ${Validators.sanitize(data.course_title)}
                            </p>
                            <h3 class="continue-watching-title">
                                ${Validators.sanitize(data.lesson_title)}
                            </h3>
                            <div class="continue-watching-progress">
                                ${ProgressBar.createWithLabel({
                                    percentage: data.progress_percentage || 0,
                                    label: `${data.progress_percentage || 0}% do curso concluído`,
                                    showPercentage: false,
                                    size: 'sm'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Renderizar navbar
    renderNavbar() {
        const user = State.getUser();
        
        return `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="${ROUTES.DASHBOARD}" class="navbar-brand">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             viewBox="0 0 32 32" fill="none" 
                             class="navbar-logo">
                            <circle cx="16" cy="16" r="16" 
                                    fill="var(--color-primary)"/>
                            <path d="M10 22V10l12 6-12 6z" fill="white"/>
                        </svg>
                        ${APP_CONFIG.APP_NAME}
                    </a>
                    
                    <div class="navbar-menu" id="navbar-menu">
                        <ul class="navbar-nav">
                            ${NAV_LINKS.AUTHENTICATED.map(link => `
                                <li>
                                    <a href="${link.route}" 
                                       class="navbar-nav-link ${
                                           Router.getCurrentRoute()?.path === link.route
                                               ? 'active' : ''
                                       }">
                                        ${link.label}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                        
                        <div class="navbar-actions">
                            <!-- Theme Toggle -->
                            <button 
                                class="btn-icon"
                                onclick="State.toggleTheme()"
                                aria-label="Alternar tema"
                                title="Alternar tema (claro/escuro)">
                                <svg xmlns="http://www.w3.org/2000/svg" 
                                     fill="none" viewBox="0 0 24 24" 
                                     stroke="currentColor" width="20" height="20">
                                    <path stroke-linecap="round" 
                                          stroke-linejoin="round" 
                                          stroke-width="2" 
                                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                                </svg>
                            </button>
                            
                            <!-- User Menu -->
                            <div class="navbar-user-menu" id="user-menu">
                                <button 
                                    class="navbar-user-trigger"
                                    onclick="document.getElementById('user-menu').classList.toggle('open')"
                                    aria-expanded="false"
                                    aria-haspopup="true">
                                    <div style="width:36px;height:36px;border-radius:50%;
                                                background:var(--color-primary);
                                                display:flex;align-items:center;
                                                justify-content:center;
                                                color:white;font-weight:600;
                                                font-size:var(--text-sm)">
                                        ${Formatters.initials(user?.name || 'U')}
                                    </div>
                                    <span class="text-sm font-medium">
                                        ${Validators.sanitize(user?.name?.split(' ')[0] || '')}
                                    </span>
                                </button>
                                
                                <div class="navbar-user-dropdown">
                                    <a href="${ROUTES.PROFILE}" 
                                       class="navbar-user-dropdown-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" 
                                             fill="none" viewBox="0 0 24 24" 
                                             stroke="currentColor" 
                                             width="16" height="16">
                                            <path stroke-linecap="round" 
                                                  stroke-linejoin="round" 
                                                  stroke-width="2" 
                                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                        Meu Perfil
                                    </a>
                                    <a href="${ROUTES.MY_COURSES}" 
                                       class="navbar-user-dropdown-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" 
                                             fill="none" viewBox="0 0 24 24" 
                                             stroke="currentColor" 
                                             width="16" height="16">
                                            <path stroke-linecap="round" 
                                                  stroke-linejoin="round" 
                                                  stroke-width="2" 
                                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                        </svg>
                                        Meus Cursos
                                    </a>
                                    <div class="navbar-user-dropdown-divider"></div>
                                    <button 
                                        class="navbar-user-dropdown-item"
                                        onclick="AuthService.logout()"
                                        style="width:100%;text-align:left;
                                               color:var(--color-error)">
                                        <svg xmlns="http://www.w3.org/2000/svg" 
                                             fill="none" viewBox="0 0 24 24" 
                                             stroke="currentColor" 
                                             width="16" height="16">
                                            <path stroke-linecap="round" 
                                                  stroke-linejoin="round" 
                                                  stroke-width="2" 
                                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                        </svg>
                                        Sair
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mobile Toggle -->
                    <button 
                        class="navbar-toggle" 
                        id="navbar-toggle"
                        aria-label="Menu"
                        onclick="document.getElementById('navbar-menu').classList.toggle('open');
                                 this.classList.toggle('active')">
                        <span class="navbar-toggle-line"></span>
                        <span class="navbar-toggle-line"></span>
                        <span class="navbar-toggle-line"></span>
                    </button>
                </div>
            </nav>
        `;
    },
    
    // Skeleton loading
    renderSkeleton() {
        return `
            <div class="dashboard-header">
                <div class="card-skeleton card-skeleton-line" 
                     style="width: 300px; height: 36px; margin-bottom: 8px">
                </div>
                <div class="card-skeleton card-skeleton-line short" 
                     style="width: 200px; height: 20px">
                </div>
            </div>
            <div class="dashboard-stats">
                ${Array(4).fill(0).map(() => `
                    <div class="dashboard-stat-card">
                        <div class="card-skeleton" 
                             style="height: 80px; border-radius: var(--radius-md)">
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="dashboard-section">
                <div class="card-skeleton card-skeleton-line" 
                     style="width: 200px; height: 28px; margin-bottom: 16px">
                </div>
                ${CourseCard.createGrid([], { loading: true, skeletonCount: 4 })}
            </div>
        `;
    }
};