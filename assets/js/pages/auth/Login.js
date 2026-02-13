// Login.js - Página de login

const Login = {
    // Renderizar página
    render() {
        return `
            <div class="auth-layout">
                <div class="auth-card">
                    
                    <!-- Header -->
                    <div class="auth-header">
                        <div class="auth-logo">
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                 viewBox="0 0 64 64" fill="none">
                                <circle cx="32" cy="32" r="32" 
                                        fill="var(--color-primary)"/>
                                <path d="M20 44V20l24 12-24 12z" fill="white"/>
                            </svg>
                        </div>
                        <h1 class="auth-title">Bem-vindo de volta!</h1>
                        <p class="auth-subtitle">
                            Entre na sua conta para continuar aprendendo
                        </p>
                    </div>
                    
                    <!-- Alert de sessão expirada -->
                    <div id="login-alert" style="display: none" 
                         class="auth-success" role="alert">
                    </div>
                    
                    <!-- Form -->
                    <form class="auth-form" id="login-form" novalidate>
                        
                        <!-- Email -->
                        <div class="form-group">
                            <label class="form-label form-label-required" 
                                   for="login-email">
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
                                              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                                    </svg>
                                </span>
                                <input 
                                    type="email"
                                    id="login-email"
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
                                   for="login-password">
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
                                    id="login-password"
                                    name="password"
                                    class="form-input"
                                    placeholder="Sua senha"
                                    autocomplete="current-password"
                                    required
                                />
                                <button 
                                    type="button"
                                    class="form-input-icon-right"
                                    id="toggle-password"
                                    style="pointer-events: auto; cursor: pointer"
                                    aria-label="Mostrar/ocultar senha">
                                    <svg id="eye-open" xmlns="http://www.w3.org/2000/svg" 
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
                                    <svg id="eye-closed" 
                                         xmlns="http://www.w3.org/2000/svg" 
                                         fill="none" viewBox="0 0 24 24" 
                                         stroke="currentColor" 
                                         width="18" height="18"
                                         style="display: none">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                    </svg>
                                </button>
                            </div>
                            <span class="form-feedback error" 
                                  id="password-error" 
                                  style="display: none">
                            </span>
                        </div>
                        
                        <!-- Opções -->
                        <div class="auth-options">
                            <label class="form-check-label">
                                <input 
                                    type="checkbox" 
                                    class="form-checkbox" 
                                    id="remember-me"
                                    name="remember"
                                />
                                <span class="text-sm">Lembrar de mim</span>
                            </label>
                            <a href="${ROUTES.FORGOT_PASSWORD}" 
                               class="text-sm font-medium">
                                Esqueci minha senha
                            </a>
                        </div>
                        
                        <!-- Submit -->
                        <button 
                            type="submit" 
                            class="btn btn-primary btn-block btn-lg"
                            id="login-submit-btn">
                            Entrar
                        </button>
                        
                    </form>
                    
                    <!-- Footer -->
                    <div class="auth-footer">
                        <p>
                            Não tem uma conta? 
                            <a href="${ROUTES.REGISTER}">Cadastre-se grátis</a>
                        </p>
                    </div>
                    
                </div>
            </div>
        `;
    },
    
    // Inicializar página
    init() {
        this.checkUrlParams();
        this.attachEventListeners();
    },
    
    // Verificar parâmetros da URL
    checkUrlParams() {
        const params = Router.getCurrentRoute()?.query || {};
        const alert = document.getElementById('login-alert');
        
        if (!alert) return;
        
        if (params.session === 'expired') {
            alert.textContent = '⚠️ Sua sessão expirou. Faça login novamente.';
            alert.style.display = 'block';
            alert.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            alert.style.borderColor = 'var(--color-warning)';
            alert.style.color = 'var(--color-warning)';
        }
        
        if (params.reason === 'conflict') {
            alert.textContent = '⚠️ Sua conta foi acessada em outro dispositivo.';
            alert.style.display = 'block';
            alert.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            alert.style.borderColor = 'var(--color-error)';
            alert.style.color = 'var(--color-error)';
        }
        
        if (params.registered === 'true') {
            alert.textContent = '✅ Cadastro realizado! Faça login para continuar.';
            alert.style.display = 'block';
        }
    },
    
    // Vincular eventos
    attachEventListeners() {
        const form = document.getElementById('login-form');
        const toggleBtn = document.getElementById('toggle-password');
        const emailInput = document.getElementById('login-email');
        
        // Submit
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Toggle password visibility
        toggleBtn?.addEventListener('click', () => {
            const passwordInput = document.getElementById('login-password');
            const eyeOpen = document.getElementById('eye-open');
            const eyeClosed = document.getElementById('eye-closed');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'block';
            } else {
                passwordInput.type = 'password';
                eyeOpen.style.display = 'block';
                eyeClosed.style.display = 'none';
            }
        });
        
        // Limpar erros ao digitar
        emailInput?.addEventListener('input', () => {
            this.clearFieldError('email');
        });
        
        document.getElementById('login-password')?.addEventListener('input', () => {
            this.clearFieldError('password');
        });
        
        // Focar email ao carregar
        setTimeout(() => emailInput?.focus(), 100);
    },
    
    // Processar submit
    async handleSubmit() {
        const email = document.getElementById('login-email')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        const submitBtn = document.getElementById('login-submit-btn');
        
        // Validar
        const { isValid, errors } = Validators.validateForm(
            { email, password },
            {
                email: [
                    { type: 'required', message: 'E-mail é obrigatório' },
                    { type: 'email', message: 'E-mail inválido' }
                ],
                password: [
                    { type: 'required', message: 'Senha é obrigatória' },
                    { type: 'minLength', min: 6, message: 'Senha muito curta' }
                ]
            }
        );
        
        if (!isValid) {
            Object.keys(errors).forEach(field => {
                this.showFieldError(field, errors[field]);
            });
            return;
        }
        
        // Verificar rate limit
        const rateCheck = RateLimitMiddleware.checkLoginRate(email);
        if (!rateCheck.allowed) {
            NotificationService.error(
                `Conta bloqueada. Tente novamente em ${rateCheck.remainingMinutes} minutos.`
            );
            return;
        }
        
        // Loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        try {
            await AuthService.login(email, password);
            
            // Registrar sucesso
            RateLimitMiddleware.recordLoginAttempt(email, true);
            
            // Redirecionar
            const params = Router.getCurrentRoute()?.query || {};
            const redirect = params.redirect
                ? decodeURIComponent(params.redirect)
                : ROUTES.DASHBOARD;
            
            Router.navigate(redirect, true);
            
        } catch (error) {
            // Registrar falha
            RateLimitMiddleware.recordLoginAttempt(email, false);
            
            const rateInfo = RateLimitMiddleware.checkLoginRate(email);
            
            if (error.status === 401) {
                const msg = rateInfo.remainingAttempts <= 2
                    ? `E-mail ou senha incorretos. Restam ${rateInfo.remainingAttempts} tentativa(s).`
                    : 'E-mail ou senha incorretos.';
                    
                this.showFieldError('password', msg);
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
    
    // Mostrar erro no campo
    showFieldError(field, message) {
        const input = document.getElementById(`login-${field}`);
        const errorEl = document.getElementById(`${field}-error`);
        
        if (input) input.classList.add('is-invalid');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },
    
    // Limpar erro do campo
    clearFieldError(field) {
        const input = document.getElementById(`login-${field}`);
        const errorEl = document.getElementById(`${field}-error`);
        
        if (input) input.classList.remove('is-invalid');
        if (errorEl) errorEl.style.display = 'none';
    }
};