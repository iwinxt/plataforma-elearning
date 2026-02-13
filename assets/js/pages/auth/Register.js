// Register.js - Página de cadastro

const Register = {
    render() {
        return `
            <div class="auth-layout">
                <div class="auth-card">
                    
                    <div class="auth-header">
                        <div class="auth-logo">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                 viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="32" 
                                        fill="var(--color-primary)"/>
                                <path d="M20 44V20l24 12-24 12z" fill="white"/>
                            </svg>
                        </div>
                        <h1 class="auth-title">Crie sua conta</h1>
                        <p class="auth-subtitle">
                            Comece a aprender hoje mesmo, é grátis!
                        </p>
                    </div>
                    
                    <form class="auth-form" id="register-form" novalidate>
                        
                        <!-- Nome -->
                        <div class="form-group">
                            <label class="form-label form-label-required" 
                                   for="register-name">
                                Nome completo
                            </label>
                            <div class="form-input-group">
                                <span class="form-input-icon-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         fill="none" viewBox="0 0 24 24" 
                                         stroke="currentColor" 
                                         width="18" height="18">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </span>
                                <input 
                                    type="text"
                                    id="register-name"
                                    name="name"
                                    class="form-input"
                                    placeholder="João Silva"
                                    autocomplete="name"
                                    required
                                />
                            </div>
                            <span class="form-feedback error" 
                                  id="name-error" 
                                  style="display: none">
                            </span>
                        </div>
                        
                        <!-- Email -->
                        <div class="form-group">
                            <label class="form-label form-label-required" 
                                   for="register-email">
                                E-mail
                            </label>
                            <div class="form-input-group">
                                <span class="form-input-icon-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         fill="none" viewBox="0 0 24 24" 
                                         stroke="currentColor" 
                                         width="18" height="18">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </span>
                                <input 
                                    type="email"
                                    id="register-email"
                                    name="email"
                                    class="form-input"
                                    placeholder="seu@email.com"
                                    autocomplete="email"
                                    required
                                />
                            </div>
                            <span class="form-feedback error" 
                                  id="email-error" 
                                  style="display: none">
                            </span>
                        </div>
                        
                        <!-- Senha -->
                        <div class="form-group">
                            <label class="form-label form-label-required" 
                                   for="register-password">
                                Senha
                            </label>
                            <div class="form-input-group has-icon-right">
                                <span class="form-input-icon-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         fill="none" viewBox="0 0 24 24" 
                                         stroke="currentColor" 
                                         width="18" height="18">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                    </svg>
                                </span>
                                <input 
                                    type="password"
                                    id="register-password"
                                    name="password"
                                    class="form-input"
                                    placeholder="Mínimo 8 caracteres"
                                    autocomplete="new-password"
                                    required
                                />
                                <button 
                                    type="button"
                                    class="form-input-icon-right"
                                    id="toggle-password"
                                    style="pointer-events: auto; cursor: pointer"
                                    aria-label="Mostrar/ocultar senha">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         fill="none" viewBox="0 0 24 24" 
                                         stroke="currentColor" 
                                         width="18" height="18">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <!-- Força da senha -->
                            <div class="password-strength mt-xs" id="password-strength">
                                <div class="password-strength-bars">
                                    <div class="strength-bar" id="strength-1"></div>
                                    <div class="strength-bar" id="strength-2"></div>
                                    <div class="strength-bar" id="strength-3"></div>
                                    <div class="strength-bar" id="strength-4"></div>
                                </div>
                                <span class="strength-label text-xs" 
                                      id="strength-label">
                                </span>
                            </div>
                            
                            <span class="form-feedback error" 
                                  id="password-error" 
                                  style="display: none">
                            </span>
                        </div>
                        
                        <!-- Confirmar Senha -->
                        <div class="form-group">
                            <label class="form-label form-label-required" 
                                   for="register-confirm-password">
                                Confirmar senha
                            </label>
                            <div class="form-input-group">
                                <span class="form-input-icon-left">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         fill="none" viewBox="0 0 24 24" 
                                         stroke="currentColor" 
                                         width="18" height="18">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                    </svg>
                                </span>
                                <input 
                                    type="password"
                                    id="register-confirm-password"
                                    name="confirm_password"
                                    class="form-input"
                                    placeholder="Repita sua senha"
                                    autocomplete="new-password"
                                    required
                                />
                            </div>
                            <span class="form-feedback error" 
                                  id="confirm-password-error" 
                                  style="display: none">
                            </span>
                        </div>
                        
                        <!-- Termos -->
                        <div class="form-group">
                            <label class="form-check-label">
                                <input 
                                    type="checkbox" 
                                    class="form-checkbox" 
                                    id="accept-terms"
                                    required
                                />
                                <span class="text-sm">
                                    Eu aceito os 
                                    <a href="${ROUTES.TERMS}" 
                                       target="_blank">
                                        Termos de Uso
                                    </a> 
                                    e a 
                                    <a href="${ROUTES.PRIVACY}" 
                                       target="_blank">
                                        Política de Privacidade
                                    </a>
                                </span>
                            </label>
                            <span class="form-feedback error" 
                                  id="terms-error" 
                                  style="display: none">
                            </span>
                        </div>
                        
                        <!-- Submit -->
                        <button 
                            type="submit" 
                            class="btn btn-primary btn-block btn-lg"
                            id="register-submit-btn">
                            Criar conta grátis
                        </button>
                        
                    </form>
                    
                    <div class="auth-footer">
                        <p>
                            Já tem uma conta? 
                            <a href="${ROUTES.LOGIN}">Entrar</a>
                        </p>
                    </div>
                    
                </div>
            </div>
        `;
    },
    
    init() {
        this.attachEventListeners();
        setTimeout(() => {
            document.getElementById('register-name')?.focus();
        }, 100);
    },
    
    attachEventListeners() {
        const form = document.getElementById('register-form');
        const passwordInput = document.getElementById('register-password');
        const toggleBtn = document.getElementById('toggle-password');
        
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Password strength meter
        passwordInput?.addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
            this.clearFieldError('password');
        });
        
        // Confirm password validation
        document.getElementById('register-confirm-password')
            ?.addEventListener('input', () => {
                this.clearFieldError('confirm-password');
            });
        
        // Toggle password
        toggleBtn?.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
        });
        
        // Clear errors on input
        ['name', 'email'].forEach(field => {
            document.getElementById(`register-${field}`)
                ?.addEventListener('input', () => {
                    this.clearFieldError(field);
                });
        });
    },
    
    // Atualizar indicador de força da senha
    updatePasswordStrength(password) {
        const strength = this.calculatePasswordStrength(password);
        const bars = document.querySelectorAll('.strength-bar');
        const label = document.getElementById('strength-label');
        
        const config = {
            0: { active: 0, color: '', text: '' },
            1: { active: 1, color: '#ef4444', text: 'Muito fraca' },
            2: { active: 2, color: '#f59e0b', text: 'Fraca' },
            3: { active: 3, color: '#3b82f6', text: 'Boa' },
            4: { active: 4, color: '#10b981', text: 'Forte' }
        };
        
        const cfg = config[strength] || config[0];
        
        bars.forEach((bar, i) => {
            bar.style.backgroundColor = i < cfg.active
                ? cfg.color
                : 'var(--color-border)';
        });
        
        if (label) {
            label.textContent = cfg.text;
            label.style.color = cfg.color;
        }
    },
    
    // Calcular força da senha
    calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        return score;
    },
    
    async handleSubmit() {
        const name = document.getElementById('register-name')?.value.trim();
        const email = document.getElementById('register-email')?.value.trim();
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById(
            'register-confirm-password'
        )?.value;
        const acceptTerms = document.getElementById('accept-terms')?.checked;
        
        const { isValid, errors } = Validators.validateForm(
            { name, email, password, confirmPassword },
            {
                name: [
                    { type: 'required', message: 'Nome é obrigatório' },
                    {
                        type: 'minLength',
                        min: 3,
                        message: 'Nome deve ter pelo menos 3 caracteres'
                    }
                ],
                email: [
                    { type: 'required', message: 'E-mail é obrigatório' },
                    { type: 'email', message: 'E-mail inválido' }
                ],
                password: [
                    { type: 'required', message: 'Senha é obrigatória' },
                    {
                        type: 'minLength',
                        min: 8,
                        message: 'Senha deve ter pelo menos 8 caracteres'
                    }
                ],
                confirmPassword: [
                    { type: 'required', message: 'Confirme sua senha' },
                    {
                        type: 'matches',
                        field: 'password',
                        message: 'Senhas não conferem'
                    }
                ]
            }
        );
        
        if (!isValid) {
            Object.keys(errors).forEach(field => {
                const fieldId = field === 'confirmPassword'
                    ? 'confirm-password'
                    : field;
                this.showFieldError(fieldId, errors[field]);
            });
            return;
        }
        
        if (!acceptTerms) {
            this.showFieldError('terms', 'Você deve aceitar os termos');
            return;
        }
        
        const submitBtn = document.getElementById('register-submit-btn');
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        try {
            await AuthService.register({ name, email, password });
            Router.navigate(ROUTES.DASHBOARD, true);
        } catch (error) {
            if (error.status === 422 || error.status === 409) {
                this.showFieldError('email', 'Este e-mail já está cadastrado.');
            } else {
                NotificationService.error(
                    error.message || APP_CONFIG.ERROR_MESSAGES.SERVER_ERROR
                );
            }
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    },
    
    showFieldError(field, message) {
        const fieldId = field.includes('-') ? field : `register-${field}`;
        const input = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${field}-error`);
        
        if (input) input.classList.add('is-invalid');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },
    
    clearFieldError(field) {
        const fieldId = field.includes('-') ? field : `register-${field}`;
        const input = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${field}-error`);
        
        if (input) input.classList.remove('is-invalid');
        if (errorEl) errorEl.style.display = 'none';
    }
};