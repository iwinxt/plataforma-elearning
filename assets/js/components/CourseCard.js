// CourseCard.js - Componente de card de curso

const CourseCard = {
    // Criar card de curso padrão (Netflix-style)
    create(course, options = {}) {
        const {
            showProgress = false,
            showBadge = true,
            horizontal = false,
            skeleton = false
        } = options;
        
        if (skeleton) return this.createSkeleton(horizontal);
        
        const progressPercentage = course.progress?.percentage || 0;
        const badge = this.getBadge(course);
        
        if (horizontal) {
            return this.createHorizontal(course, { showProgress, showBadge });
        }
        
        return `
            <div class="course-card" 
                 data-course-id="${course.id}"
                 onclick="Router.navigate('/course/${course.slug}')"
                 role="article"
                 tabindex="0"
                 onkeydown="if(event.key === 'Enter') Router.navigate('/course/${course.slug}')">
                
                <!-- Thumbnail -->
                <div class="course-card-thumbnail">
                    <img 
                        data-src="${course.thumbnail_url}"
                        src="${LazyLoader.getPlaceholder({ width: 320, height: 180 })}"
                        alt="${Validators.sanitize(course.title)}"
                        class="lazy"
                        width="320"
                        height="180"
                    />
                    
                    ${showBadge && badge ? `
                        <span class="course-card-badge badge-${badge.type}">
                            ${badge.label}
                        </span>
                    ` : ''}
                    
                    <div class="course-card-overlay"></div>
                    
                    <div class="course-card-play-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             viewBox="0 0 24 24" fill="currentColor" 
                             width="24" height="24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="course-card-content">
                    <h3 class="course-card-title" title="${Validators.sanitize(course.title)}">
                        ${Validators.sanitize(course.title)}
                    </h3>
                    
                    ${course.instructor ? `
                        <p class="course-card-instructor">
                            ${Validators.sanitize(course.instructor.name)}
                        </p>
                    ` : ''}
                    
                    <div class="course-card-meta">
                        ${course.metadata?.level ? `
                            <span class="course-card-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" 
                                     fill="none" viewBox="0 0 24 24" 
                                     stroke="currentColor" width="14" height="14">
                                    <path stroke-linecap="round" stroke-linejoin="round" 
                                          stroke-width="2" 
                                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                                ${this.getLevelLabel(course.metadata.level)}
                            </span>
                        ` : ''}
                        
                        ${course.metadata?.duration_minutes ? `
                            <span class="course-card-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" 
                                     fill="none" viewBox="0 0 24 24" 
                                     stroke="currentColor" width="14" height="14">
                                    <path stroke-linecap="round" stroke-linejoin="round" 
                                          stroke-width="2" 
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                ${Formatters.durationHuman(course.metadata.duration_minutes * 60)}
                            </span>
                        ` : ''}
                        
                        ${course.metadata?.lessons_count ? `
                            <span class="course-card-meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" 
                                     fill="none" viewBox="0 0 24 24" 
                                     stroke="currentColor" width="14" height="14">
                                    <path stroke-linecap="round" stroke-linejoin="round" 
                                          stroke-width="2" 
                                          d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                </svg>
                                ${Formatters.lessonsCount(course.metadata.lessons_count)}
                            </span>
                        ` : ''}
                    </div>
                    
                    ${course.rating ? `
                        <div class="course-card-rating">
                            <span class="course-card-rating-stars">
                                ${this.renderStars(course.rating.average)}
                            </span>
                            <span class="font-semibold text-sm">
                                ${course.rating.average.toFixed(1)}
                            </span>
                            <span class="text-tertiary text-xs">
                                (${Formatters.number(course.rating.count)})
                            </span>
                        </div>
                    ` : ''}
                    
                    ${showProgress && progressPercentage > 0 ? `
                        <div class="course-card-progress">
                            ${ProgressBar.createWithLabel({
                                percentage: progressPercentage,
                                label: progressPercentage === 100
                                    ? '✅ Concluído'
                                    : `${progressPercentage}% concluído`,
                                showPercentage: false,
                                size: 'sm',
                                variant: progressPercentage === 100 ? 'success' : 'primary'
                            })}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // Criar card horizontal
    createHorizontal(course, options = {}) {
        const { showProgress = false } = options;
        const progressPercentage = course.progress?.percentage || 0;
        
        return `
            <div class="course-card course-card-horizontal"
                 data-course-id="${course.id}"
                 onclick="Router.navigate('/course/${course.slug}')"
                 role="article"
                 tabindex="0">
                
                <div class="course-card-thumbnail">
                    <img 
                        data-src="${course.thumbnail_url}"
                        src="${LazyLoader.getPlaceholder({ width: 300, height: 168 })}"
                        alt="${Validators.sanitize(course.title)}"
                        class="lazy"
                        width="300"
                        height="168"
                    />
                    <div class="continue-watching-play">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             viewBox="0 0 24 24" fill="white" 
                             width="24" height="24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                
                <div class="course-card-content">
                    <h3 class="course-card-title">
                        ${Validators.sanitize(course.title)}
                    </h3>
                    
                    ${course.instructor ? `
                        <p class="course-card-instructor">
                            ${Validators.sanitize(course.instructor.name)}
                        </p>
                    ` : ''}
                    
                    ${showProgress ? `
                        <div class="course-card-progress mt-md">
                            ${ProgressBar.createWithLabel({
                                percentage: progressPercentage,
                                label: `${progressPercentage}% concluído`,
                                showPercentage: false,
                                size: 'sm'
                            })}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // Criar skeleton de loading
    createSkeleton(horizontal = false) {
        if (horizontal) {
            return `
                <div class="course-card course-card-horizontal">
                    <div class="course-card-thumbnail card-skeleton">
                        <div class="card-skeleton-thumbnail"></div>
                    </div>
                    <div class="course-card-content" style="padding: var(--spacing-md)">
                        <div class="card-skeleton card-skeleton-line" 
                             style="width: 80%; margin-bottom: 8px"></div>
                        <div class="card-skeleton card-skeleton-line short"></div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="course-card">
                <div class="card-skeleton-thumbnail card-skeleton"></div>
                <div style="padding: var(--spacing-md)">
                    <div class="card-skeleton card-skeleton-line" 
                         style="width: 90%; margin-bottom: 8px"></div>
                    <div class="card-skeleton card-skeleton-line short" 
                         style="margin-bottom: 12px"></div>
                    <div class="card-skeleton card-skeleton-line" 
                         style="width: 70%"></div>
                </div>
            </div>
        `;
    },
    
    // Criar grid de cards
    createGrid(courses, options = {}) {
        const { loading = false, skeletonCount = 8 } = options;
        
        if (loading) {
            return `
                <div class="cards-grid">
                    ${Array(skeletonCount).fill(0)
                        .map(() => this.createSkeleton()).join('')}
                </div>
            `;
        }
        
        if (!courses || courses.length === 0) {
            return `
                <div class="dashboard-empty">
                    <div class="dashboard-empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" 
                                  stroke-width="2" 
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                    </div>
                    <h3 class="dashboard-empty-title">Nenhum curso encontrado</h3>
                    <p class="dashboard-empty-description">
                        Explore nosso catálogo e encontre o curso ideal para você.
                    </p>
                    <button onclick="Router.navigate('${ROUTES.COURSES}')" 
                            class="btn btn-primary">
                        Explorar cursos
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="cards-grid">
                ${courses.map(course => this.create(course, options)).join('')}
            </div>
        `;
    },
    
    // Renderizar estrelas
    renderStars(rating, maxStars = 5) {
        let stars = '';
        for (let i = 1; i <= maxStars; i++) {
            if (i <= Math.floor(rating)) {
                stars += '★';
            } else if (i - 0.5 <= rating) {
                stars += '⯨';
            } else {
                stars += '☆';
            }
        }
        return stars;
    },
    
    // Obter badge do curso
    getBadge(course) {
        const now = new Date();
        const createdAt = new Date(course.created_at);
        const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 14) {
            return { type: 'new', label: 'Novo' };
        }
        
        if (course.rating?.count > 500 || course.metadata?.students_count > 1000) {
            return { type: 'popular', label: 'Popular' };
        }
        
        return null;
    },
    
    // Labels de nível
    getLevelLabel(level) {
        const labels = {
            beginner: 'Iniciante',
            intermediate: 'Intermediário',
            advanced: 'Avançado'
        };
        return labels[level] || level;
    }
};

// Atualizar lazy loader após renderização de cards
EventBus.on(APP_EVENTS.PAGE_LOADED, () => {
    LazyLoader.refresh();
});