// formatters.js - Funções de formatação de dados

const Formatters = {
    // Formatar moeda (Real Brasileiro)
    currency(value, locale = 'pt-BR', currency = 'BRL') {
        if (value === null || value === undefined) return '-';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(value);
    },
    
    // Formatar número
    number(value, decimals = 0) {
        if (value === null || value === undefined) return '-';
        return parseFloat(value).toFixed(decimals);
    },
    
    // Formatar porcentagem
    percentage(value, decimals = 0) {
        if (value === null || value === undefined) return '-';
        return `${parseFloat(value).toFixed(decimals)}%`;
    },
    
    // Formatar data
    date(dateString, format = 'short') {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            long: { day: '2-digit', month: 'long', year: 'numeric' },
            full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
        };
        
        return new Intl.DateTimeFormat('pt-BR', options[format] || options.short).format(date);
    },
    
    // Formatar data e hora
    datetime(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    // Formatar tempo relativo (ex: "há 2 horas")
    timeAgo(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        const intervals = {
            ano: 31536000,
            mês: 2592000,
            semana: 604800,
            dia: 86400,
            hora: 3600,
            minuto: 60,
            segundo: 1
        };
        
        for (const [name, value] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / value);
            if (interval >= 1) {
                return `há ${interval} ${name}${interval > 1 && name !== 'mês' ? 's' : name === 'mês' && interval > 1 ? 'es' : ''}`;
            }
        }
        
        return 'agora mesmo';
    },
    
    // Formatar duração em segundos para HH:MM:SS
    duration(seconds) {
        if (!seconds && seconds !== 0) return '-';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        const parts = [];
        if (hours > 0) parts.push(String(hours).padStart(2, '0'));
        parts.push(String(minutes).padStart(2, '0'));
        parts.push(String(secs).padStart(2, '0'));
        
        return parts.join(':');
    },
    
    // Formatar duração para formato legível (ex: "2h 30min")
    durationHuman(seconds) {
        if (!seconds && seconds !== 0) return '-';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}min`);
        
        return parts.length > 0 ? parts.join(' ') : '0min';
    },
    
    // Formatar telefone brasileiro
    phone(phoneNumber) {
        if (!phoneNumber) return '-';
        
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }
        
        return phoneNumber;
    },
    
    // Formatar CPF
    cpf(cpf) {
        if (!cpf) return '-';
        
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length !== 11) return cpf;
        
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    },
    
    // Truncar texto
    truncate(text, maxLength = 100, suffix = '...') {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + suffix;
    },
    
    // Capitalizar primeira letra
    capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    // Capitalizar cada palavra
    titleCase(text) {
        if (!text) return '';
        return text.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    },
    
    // Formatar tamanho de arquivo
    fileSize(bytes) {
        if (!bytes && bytes !== 0) return '-';
        
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    },
    
    // Formatar slug (URL-friendly)
    slug(text) {
        if (!text) return '';
        
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .trim()
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-'); // Remove hífens duplicados
    },
    
    // Formatar número de aulas
    lessonsCount(count) {
        if (!count && count !== 0) return '0 aulas';
        return `${count} aula${count !== 1 ? 's' : ''}`;
    },
    
    // Formatar rating (estrelas)
    rating(value, maxStars = 5) {
        if (!value && value !== 0) return '-';
        const stars = Math.round(value * 2) / 2; // Arredonda para 0.5
        return `${stars.toFixed(1)} / ${maxStars}`;
    },
    
    // Formatar iniciais do nome
    initials(name) {
        if (!name) return '';
        
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
};

Object.freeze(Formatters);