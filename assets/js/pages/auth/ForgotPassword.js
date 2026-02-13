// ForgotPassword.js - Página de recuperação de senha

const ForgotPassword = {
    _step: 'email', // email | sent
    
    render() {
        return `
            <div class="auth-layout">
                <div class="auth-card">
                    
                    <a href="${ROUTES.LOGIN}" class="auth-back-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             fill="none" viewBox="0 0 24 24" 
                             stroke="currentColor" width="16" height="16">
                            <path stroke-linecap="round" stroke-linejoin="round" 
                                  stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Voltar para o login
                    </a>
                    
                    <div id="forgot-content">
                        ${this.renderEmailStep()}
                    </div>
                    
                </div>
            </div>
        `;
    },
    
    renderEmailStep() {
        return `
            <div class="auth-header">
                <div class="auth-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         fill="none" viewBox="0 0 24 24" 
                         stroke="var(--color-primary)" 
                         width="64" height="64">
                        <path stroke-linecap="round" stroke-linejoin="round" 
                              stroke-width="1.5" 
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                </div>
                <h1 class="auth-title">Esqueceu a senha?</h1>
                <p class="auth-subtitle">
                    Digite seu e-mail e enviaremos um link para redefinição.
                </p>
            </div>
            
            <form class="auth-form" id="forgot-form" novalidate>
                <div class="form-group">
                    <label class="form-label form-label-required" 
                           for="forgot-email">
                        E-mail cadastrado
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
                            id="forgot-email"
                            class="form-input"
                            placeholder="seu@email.com"
                            autocomplete="email"
                            required
                        />
                    </div>
                    <span class="form-feedback error" 
                          id="forgot-email-error" 
                          style="display: none">
                    </span>
                </div>
                
                <button 
                    type="submit" 
                    class="btn btn-primary btn-block btn-lg"
                    id="forgot-submit-btn">
                    Enviar link de redefinição
                </button>
            </form>
        `;
    },
    
    renderSentStep(email) {
        return `
            <div class="auth-header">
                <div class="auth-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                         fill="none" viewBox="0 0 24 24" 
                         stroke="var(--color-success)" 
                         width="64" height="64">
                        <path stroke-linecap="round" stroke-linejoin="round" 
                              stroke-width="1.5" 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h1 class="auth-title">E-mail enviado!</h1>
                <p class="auth-subtitle">
                    Enviamos um link de redefinição para<br>
                    <strong>${Validators.sanitize(email)}</strong>
                </p>
            </div>
            
            <div style="text-align: center; padding: var(--spacing-lg) 0">
                <p class="text-secondary text-sm mb-md">
                    Não recebeu o e-mail? Verifique sua pasta de spam 
                    ou solicite um novo link.
                </p>
                <button 
                    class="btn btn-outline btn-block"
                    id="resend-btn"
                    onclick="ForgotPassword.resendEmail('${Validators.sanitize(email)}')">
                    Reenviar e-mail
                </button>
            </div>
            
            <div class="auth-footer">
                <a href="${ROUTES.LOGIN}">← Voltar para o login</a>
            </div>
        `;
    },
    
    init() {
        this.attachEventListeners();
        setTimeout(() => {
            document.getElementById('forgot-email')?.focus();
        }, 100);
    },
    
    attachEventListeners() {
        document.getElementById('forgot-form')
            ?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        
        document.getElementById('forgot-email')
            ?.addEventListener('input', () => {
                const errorEl = document.getElementById('forgot-email-error');
                const input = document.getElementById('forgot-email');
                if (errorEl) errorEl.style.display = 'none';
                if (input) input.classList.remove('is-invalid');
            });
    },
    
    async handleSubmit() {
        const email = document.getElementById('forgot-email')?.value.trim();
        const submitBtn = document.getElementById('forgot-submit-btn');
        
        if (!Validators.isValidEmail(email)) {
            const input = document.getElementById('forgot-email');
            const errorEl = document.getElementById('forgot-email-error');
            
            if (input) input.classList.add('is-invalid');
            if (errorEl) {
                errorEl.textContent = 'Digite um e-mail válido';
                errorEl.style.display = 'block';
            }
            return;
        }
        
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        try {
            await AuthService.forgotPassword(email);
            
            // Mostrar tela de sucesso
            const content = document.getElementById('forgot-content');
            if (content) {
                content.innerHTML = this.renderSentStep(email);
            }
            
        } catch (error) {
            // Por segurança, não revelar se email existe ou não
            const content = document.getElementById('forgot-content');
            if (content) {
                content.innerHTML = this.renderSentStep(email);
            }
        } finally {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    },
    
    async resendEmail(email) {
        const resendBtn = document.getElementById('resend-btn');
        
        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.textContent = 'Enviando...';
        }
        
        try {
            await AuthService.forgotPassword(email);
            NotificationService.success('E-mail reenviado com sucesso!');
        } catch (error) {
            NotificationService.success('E-mail reenviado com sucesso!');
        } finally {
            if (resendBtn) {
                setTimeout(() => {
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Reenviar e-mail';
                }, 30000);
            }
        }
    }
};