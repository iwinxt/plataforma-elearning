// ProgressBar.js - Componente de barra de progresso

const ProgressBar = {
    // Criar barra de progresso simples
    create({
        percentage = 0,
        size = 'md',
        variant = 'primary',
        showLabel = false,
        label = '',
        animated = false,
        className = ''
    } = {}) {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        
        const variantClass = {
            primary: '',
            success: 'success',
            warning: 'warning',
            error: 'error'
        }[variant] || '';
        
        const html = `
            <div class="progress progress-${size} ${className}" 
                 role="progressbar"
                 aria-valuenow="${clampedPercentage}"
                 aria-valuemin="0"
                 aria-valuemax="100">
                <div class="progress-bar ${variantClass} ${animated ? 'animated' : ''}"
                     style="width: ${clampedPercentage}%">
                </div>
            </div>
            ${showLabel ? `
                <span class="progress-label-percentage text-sm font-medium">
                    ${clampedPercentage}%
                </span>
            ` : ''}
        `;
        
        return html;
    },
    
    // Criar barra de progresso com label
    createWithLabel({
        percentage = 0,
        label = '',
        size = 'md',
        variant = 'primary',
        showPercentage = true,
        className = ''
    } = {}) {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        
        return `
            <div class="progress-with-label ${className}">
                <div class="progress-label">
                    <span class="progress-label-text text-sm text-secondary">
                        ${label}
                    </span>
                    ${showPercentage ? `
                        <span class="progress-label-percentage text-sm font-semibold">
                            ${clampedPercentage}%
                        </span>
                    ` : ''}
                </div>
                ${this.create({ percentage: clampedPercentage, size, variant })}
            </div>
        `;
    },
    
    // Criar progresso circular
    createCircular({
        percentage = 0,
        size = 120,
        strokeWidth = 8,
        showText = true,
        className = ''
    } = {}) {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        const radius = (size - strokeWidth * 2) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;
        
        return `
            <div class="progress-circular ${className}" 
                 style="width: ${size}px; height: ${size}px">
                <svg class="progress-circular-svg" 
                     width="${size}" height="${size}"
                     viewBox="0 0 ${size} ${size}">
                    <circle 
                        class="progress-circular-background"
                        cx="${size / 2}" 
                        cy="${size / 2}" 
                        r="${radius}"
                        stroke-width="${strokeWidth}"/>
                    <circle 
                        class="progress-circular-bar"
                        cx="${size / 2}" 
                        cy="${size / 2}" 
                        r="${radius}"
                        stroke-width="${strokeWidth}"
                        stroke-dasharray="${circumference} ${circumference}"
                        stroke-dashoffset="${strokeDashoffset}"
                        style="transition: stroke-dashoffset 0.5s ease"/>
                </svg>
                ${showText ? `
                    <div class="progress-circular-text">
                        ${clampedPercentage}%
                    </div>
                ` : ''}
            </div>
        `;
    },
    
    // Criar indicador de progresso do curso
    createCourseProgress({
        percentage = 0,
        completedLessons = 0,
        totalLessons = 0,
        completedModules = 0,
        totalModules = 0,
        className = ''
    } = {}) {
        const variant = percentage === 100 ? 'success' :
                       percentage >= 50 ? 'primary' : 'primary';
        
        return `
            <div class="course-progress-card ${className}">
                <div class="course-progress-header">
                    <span class="course-progress-title">Seu progresso</span>
                    <span class="font-bold text-lg" style="color: var(--color-primary)">
                        ${percentage}%
                    </span>
                </div>
                ${this.create({ percentage, variant, size: 'md' })}
                <div class="course-progress-stats">
                    <div class="course-progress-stat">
                        <span class="course-progress-stat-label">Aulas</span>
                        <span class="course-progress-stat-value">
                            ${completedLessons}/${totalLessons}
                        </span>
                    </div>
                    <div class="course-progress-stat">
                        <span class="course-progress-stat-label">Módulos</span>
                        <span class="course-progress-stat-value">
                            ${completedModules}/${totalModules}
                        </span>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Atualizar barra de progresso existente
    update(element, percentage) {
        if (!element) return;
        
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        const bar = element.querySelector('.progress-bar');
        
        if (bar) {
            bar.style.width = `${clampedPercentage}%`;
            element.setAttribute('aria-valuenow', clampedPercentage);
        }
        
        const label = element.nextElementSibling;
        if (label && label.classList.contains('progress-label-percentage')) {
            label.textContent = `${clampedPercentage}%`;
        }
    },
    
    // Animar progresso de um valor para outro
    animate(element, fromPercentage, toPercentage, duration = 1000) {
        if (!element) return;
        
        const bar = element.querySelector('.progress-bar');
        if (!bar) return;
        
        const startTime = performance.now();
        const from = Math.max(0, Math.min(100, fromPercentage));
        const to = Math.max(0, Math.min(100, toPercentage));
        
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing: easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = from + (to - from) * eased;
            
            bar.style.width = `${current}%`;
            element.setAttribute('aria-valuenow', Math.round(current));
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }
};