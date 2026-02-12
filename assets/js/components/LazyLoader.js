// LazyLoader.js - Lazy loading de imagens e componentes

const LazyLoader = {
    // Observer principal
    _observer: null,
    
    // Observer para componentes
    _componentObserver: null,
    
    // Elementos registrados
    _registeredElements: new Set(),
    
    // Inicializar
    init() {
        this.initImageObserver();
        this.initComponentObserver();
        this.observeExistingImages();
    },
    
    // Inicializar observer de imagens
    initImageObserver() {
        if (!('IntersectionObserver' in window)) {
            this.loadAllImages();
            return;
        }
        
        this._observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this._observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px 0px',
                threshold: 0.01
            }
        );
    },
    
    // Inicializar observer de componentes
    initComponentObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        this._componentObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadComponent(entry.target);
                        this._componentObserver.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '100px 0px',
                threshold: 0.01
            }
        );
    },
    
    // Observar imagens existentes na página
    observeExistingImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observe(img);
        });
    },
    
    // Observar elemento
    observe(element) {
        if (!element || this._registeredElements.has(element)) return;
        
        this._registeredElements.add(element);
        
        if (this._observer) {
            this._observer.observe(element);
        } else {
            this.loadImage(element);
        }
    },
    
    // Observar componente lazy
    observeComponent(element, loadCallback) {
        if (!element) return;
        
        element._lazyLoadCallback = loadCallback;
        
        if (this._componentObserver) {
            this._componentObserver.observe(element);
        } else {
            loadCallback();
        }
    },
    
    // Carregar imagem
    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (!src) return;
        
        // Criar imagem temporária para preload
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            if (srcset) img.srcset = srcset;
            
            img.classList.remove('lazy');
            img.classList.add('lazy-loaded');
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            
            this._registeredElements.delete(img);
        };
        
        tempImg.onerror = () => {
            // Usar placeholder em caso de erro
            img.src = this.getPlaceholder(img);
            img.classList.add('lazy-error');
            this._registeredElements.delete(img);
        };
        
        tempImg.src = src;
    },
    
    // Carregar componente
    loadComponent(element) {
        if (element._lazyLoadCallback) {
            try {
                element._lazyLoadCallback();
            } catch (error) {
                console.error('Error loading lazy component:', error);
            }
        }
    },
    
    // Carregar todas as imagens (fallback sem IntersectionObserver)
    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img);
        });
    },
    
    // Gerar placeholder
    getPlaceholder(img) {
        const width = img.width || 400;
        const height = img.height || 225;
        
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' 
               width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E
               %3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E
               %3Ctext x='50%25' y='50%25' dominant-baseline='middle' 
               text-anchor='middle' fill='%239ca3af' font-size='14'%3E
               Imagem indisponível%3C/text%3E%3C/svg%3E`;
    },
    
    // Criar elemento img com lazy loading
    createLazyImage(src, alt = '', className = '', width = '', height = '') {
        const img = document.createElement('img');
        
        // Placeholder inline enquanto carrega
        img.src = this.getPlaceholder({ width: width || 400, height: height || 225 });
        img.dataset.src = src;
        img.alt = alt;
        img.className = `lazy ${className}`;
        
        if (width) img.width = width;
        if (height) img.height = height;
        
        // Observar após inserção no DOM
        requestAnimationFrame(() => this.observe(img));
        
        return img;
    },
    
    // Re-observar novos elementos (após renderização dinâmica)
    refresh() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            if (!this._registeredElements.has(img)) {
                this.observe(img);
            }
        });
    },
    
    // Destruir observers
    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        
        if (this._componentObserver) {
            this._componentObserver.disconnect();
            this._componentObserver = null;
        }
        
        this._registeredElements.clear();
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => LazyLoader.init());