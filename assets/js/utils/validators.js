// validators.js - Funções de validação de formulários

const Validators = {
    // Validar email
    isValidEmail(email) {
        if (!email) return false;
        return REGEX_PATTERNS.EMAIL.test(email.trim());
    },
    
    // Validar senha (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial)
    isValidPassword(password) {
        if (!password) return false;
        return REGEX_PATTERNS.PASSWORD.test(password);
    },
    
    // Validar telefone brasileiro
    isValidPhone(phone) {
        if (!phone) return false;
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
    },
    
    // Validar URL
    isValidUrl(url) {
        if (!url) return false;
        return REGEX_PATTERNS.URL.test(url);
    },
    
    // Validar CPF
    isValidCPF(cpf) {
        if (!cpf) return false;
        
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    },
    
    // Validar campo não vazio
    isRequired(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        return true;
    },
    
    // Validar comprimento mínimo
    minLength(value, min) {
        if (!value) return false;
        return value.length >= min;
    },
    
    // Validar comprimento máximo
    maxLength(value, max) {
        if (!value) return true;
        return value.length <= max;
    },
    
    // Validar número mínimo
    minValue(value, min) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        return num >= min;
    },
    
    // Validar número máximo
    maxValue(value, max) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        return num <= max;
    },
    
    // Validar se é número
    isNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    
    // Validar se é inteiro
    isInteger(value) {
        return Number.isInteger(Number(value));
    },
    
    // Validar igualdade (para confirmação de senha)
    matches(value, compareValue) {
        return value === compareValue;
    },
    
    // Validar data
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },
    
    // Validar se data é futura
    isFutureDate(dateString) {
        const date = new Date(dateString);
        return date > new Date();
    },
    
    // Validar se data é passada
    isPastDate(dateString) {
        const date = new Date(dateString);
        return date < new Date();
    },
    
    // Validar formato de arquivo
    isValidFileType(filename, allowedTypes) {
        const extension = filename.split('.').pop().toLowerCase();
        return allowedTypes.includes(extension);
    },
    
    // Validar tamanho de arquivo
    isValidFileSize(fileSize, maxSize) {
        return fileSize <= maxSize;
    },
    
    // Validar múltiplos campos de um formulário
    validateForm(formData, rules) {
        const errors = {};
        
        for (const field in rules) {
            const value = formData[field];
            const fieldRules = rules[field];
            
            for (const rule of fieldRules) {
                const { type, message, ...params } = rule;
                let isValid = true;
                
                switch (type) {
                    case 'required':
                        isValid = this.isRequired(value);
                        break;
                    case 'email':
                        isValid = this.isValidEmail(value);
                        break;
                    case 'password':
                        isValid = this.isValidPassword(value);
                        break;
                    case 'minLength':
                        isValid = this.minLength(value, params.min);
                        break;
                    case 'maxLength':
                        isValid = this.maxLength(value, params.max);
                        break;
                    case 'matches':
                        isValid = this.matches(value, formData[params.field]);
                        break;
                    case 'custom':
                        isValid = params.validator(value, formData);
                        break;
                }
                
                if (!isValid) {
                    errors[field] = message;
                    break; // Stop at first error for this field
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },
    
    // Sanitizar input (remover caracteres perigosos)
    sanitize(input) {
        if (typeof input !== 'string') return input;
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
        };
        
        return input.replace(/[&<>"'/]/g, (char) => map[char]);
    }
};

Object.freeze(Validators);