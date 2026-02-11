// seo.js - Gerenciamento de SEO e Meta Tags

const SEO = {
    // Atualizar título da página
    setTitle(title) {
        const fullTitle = title 
            ? `${title} | ${APP_CONFIG.APP_NAME}` 
            : APP_CONFIG.DEFAULT_META.title;
        
        document.title = fullTitle;
        
        // Open Graph
        this.setMetaTag('og:title', fullTitle);
        
        // Twitter
        this.setMetaTag('twitter:title', fullTitle);
    },
    
    // Atualizar descrição
    setDescription(description) {
        const desc = description || APP_CONFIG.DEFAULT_META.description;
        
        this.setMetaTag('description', desc);
        this.setMetaTag('og:description', desc);
        this.setMetaTag('twitter:description', desc);
    },
    
    // Atualizar keywords
    setKeywords(keywords) {
        const keys = keywords || APP_CONFIG.DEFAULT_META.keywords;
        this.setMetaTag('keywords', keys);
    },
    
    // Atualizar imagem OG
    setOgImage(imageUrl) {
        const imgUrl = imageUrl || APP_CONFIG.DEFAULT_META.ogImage;
        const fullUrl = imgUrl.startsWith('http') ? imgUrl : window.location.origin + imgUrl;
        
        this.setMetaTag('og:image', fullUrl);
        this.setMetaTag('twitter:image', fullUrl);
    },
    
    // Atualizar URL canônica
    setCanonical(url) {
        const canonicalUrl = url || window.location.href;
        
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'canonical';
            document.head.appendChild(link);
        }
        link.href = canonicalUrl;
        
        this.setMetaTag('og:url', canonicalUrl);
    },
    
    // Atualizar tipo de página (OG)
    setPageType(type = 'website') {
        this.setMetaTag('og:type', type);
    },
    
    // Helper para criar/atualizar meta tag
    setMetaTag(name, content) {
        // Tenta encontrar por name
        let meta = document.querySelector(`meta[name="${name}"]`);
        
        // Se não encontrar, tenta por property (OG tags)
        if (!meta) {
            meta = document.querySelector(`meta[property="${name}"]`);
        }
        
        // Se ainda não existir, cria
        if (!meta) {
            meta = document.createElement('meta');
            
            if (name.startsWith('og:') || name.startsWith('twitter:')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    },
    
    // Atualizar todas as meta tags de uma vez
    updateMeta({ title, description, keywords, image, canonical, type }) {
        if (title) this.setTitle(title);
        if (description) this.setDescription(description);
        if (keywords) this.setKeywords(keywords);
        if (image) this.setOgImage(image);
        if (canonical) this.setCanonical(canonical);
        if (type) this.setPageType(type);
    },
    
    // Gerar breadcrumb JSON-LD
    setBreadcrumb(items) {
        const breadcrumbList = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };
        
        this.setStructuredData('breadcrumb', breadcrumbList);
    },
    
    // Gerar Course JSON-LD
    setCourseStructuredData(course) {
        const courseData = {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": course.title,
            "description": course.description,
            "provider": {
                "@type": "Organization",
                "name": APP_CONFIG.APP_NAME
            }
        };
        
        if (course.instructor) {
            courseData.instructor = {
                "@type": "Person",
                "name": course.instructor.name
            };
        }
        
        if (course.rating) {
            courseData.aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": course.rating.average,
                "reviewCount": course.rating.count
            };
        }
        
        this.setStructuredData('course', courseData);
    },
    
    // Helper para adicionar Structured Data
    setStructuredData(id, data) {
        let script = document.querySelector(`script[data-schema="${id}"]`);
        
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-schema', id);
            document.head.appendChild(script);
        }
        
        script.textContent = JSON.stringify(data);
    },
    
    // Remover structured data
    removeStructuredData(id) {
        const script = document.querySelector(`script[data-schema="${id}"]`);
        if (script) script.remove();
    },
    
    // Reset para valores padrão
    reset() {
        this.updateMeta({
            title: null,
            description: null,
            keywords: null,
            image: null,
            canonical: window.location.href,
            type: 'website'
        });
        
        // Remove structured data customizado
        document.querySelectorAll('script[data-schema]').forEach(script => {
            if (!script.getAttribute('data-schema').includes('default')) {
                script.remove();
            }
        });
    }
};

Object.freeze(SEO);