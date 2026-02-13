// Profile.js - Página de perfil do aluno

const Profile = {
    _user: null,
    _activeTab: 'personal',

    async render() {
        return `
            <div class="dashboard-layout">
                ${Dashboard.renderNavbar()}
                <div class="dashboard-content">
                    <div class="dashboard-header">
                        <h1 class="dashboard-title">Meu Perfil</h1>
                        <p class="dashboard-subtitle">
                            Gerencie suas informações pessoais e preferências.
                        </p>
                    </div>

                    <div id="profile-content">
                        ${this.renderSkeleton()}
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        SEO.setTitle('Meu Perfil');
        this._user = State.getUser();
        this.renderContent();
    },

    renderContent() {
        const container = document.getElementById('profile-content');
        if (!container || !this._user) return;

        container.innerHTML = `
            <div class="flex gap-xl" style="align-items: flex-start">

                <!-- Sidebar do perfil -->
                <div style="width: 280px; flex-shrink: 0">
                    ${this.renderProfileCard()}
                </div>

                <!-- Conteúdo principal -->
                <div class="flex-1">
                    <div class="tabs" id="profile-tabs">
                        <button class="tab-item active"
                                data-tab="personal"
                                onclick="Profile.switchTab('personal')">
                            Dados Pessoais
                        </button>
                        <button class="tab-item"
                                data-tab="security"
                                onclick="Profile.switchTab('security')">
                            Segurança
                        </button>
                        <button class="tab-item"
                                data-tab="preferences"
                                onclick="Profile.switchTab('preferences')">
                            Preferências
                        </button>
                        <button class="tab-item"
                                data-tab="danger"
                                onclick="Profile.switchTab('danger')">
                            Conta
                        </button>
                    </div>

                    <div id="profile-tab-content">
                        ${this.renderPersonalTab()}
                    </div>
                </div>
            </div>
        `;
    },

    // Card lateral do perfil
    renderProfileCard() {
        const user = this._user;
        const initials = Formatters.initials(user.name);

        return `
            <div class="card">
                <div class="card-body text-center">

                    <!-- Avatar -->
                    <div style="position: relative; display: inline-block; margin-bottom: var(--spacing-md)">
                        <div style="width: 96px; height: 96px; border-radius: 50%;
                                    background: var(--color-primary);
                                    display: flex; align-items: center;
                                    justify-content: center; margin: 0 auto;
                                    font-size: var(--text-3xl);
                                    font-weight: var(--font-bold); color: white">
                            ${user.avatar_url ? `
                                <img src="${user.avatar_url}"
                                     alt="${Validators.sanitize(user.name)}"
                                     style="width:100%;height:100%;
                                            border-radius:50%;object-fit:cover"/>
                            ` : initials}
                        </div>
                        <button
                            onclick="Profile.changeAvatar()"
                            style="position: absolute; bottom: 0; right: 0;
                                   width: 28px; height: 28px;
                                   border-radius: 50%;
                                   background: var(--color-primary);
                                   border: 2px solid white;
                                   display: flex; align-items: center;
                                   justify-content: center; cursor: pointer"
                            aria-label="Alterar foto">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 fill="none" viewBox="0 0 24 24"
                                 stroke="white" width="12" height="12">
                                <path stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                                <path stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </button>
                    </div>

                    <h3 class="font-semibold text-lg">
                        ${Validators.sanitize(user.name)}
                    </h3>
                    <p class="text-secondary text-sm mb-md">
                        ${Validators.sanitize(user.email)}
                    </p>

                    <div style="padding-top: var(--spacing-md);
                                border-top: 1px solid var(--color-border)">
                        <p class="text-xs text-tertiary">
                            Membro desde ${Formatters.date(user.created_at, 'long')}
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // Aba dados pessoais
    renderPersonalTab() {
        const user = this._user;

        return `
            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="h4 mb-0">Dados Pessoais</h3>
                </div>
                <div class="card-body">
                    <form id="personal-form" novalidate>

                        <div class="form-group">
                            <label class="form-label" for="profile-name">
                                Nome completo
                            </label>
                            <input
                                type="text"
                                id="profile-name"
                                class="form-input"
                                value="${Validators.sanitize(user.name)}"
                                autocomplete="name"
                            />
                            <span class="form-feedback error"
                                  id="profile-name-error"
                                  style="display:none">
                            </span>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="profile-email">
                                E-mail
                            </label>
                            <input
                                type="email"
                                id="profile-email"
                                class="form-input"
                                value="${Validators.sanitize(user.email)}"
                                autocomplete="email"
                            />
                            <span class="form-feedback error"
                                  id="profile-email-error"
                                  style="display:none">
                            </span>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="profile-phone">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                id="profile-phone"
                                class="form-input"
                                value="${Validators.sanitize(user.phone || '')}"
                                placeholder="(11) 99999-9999"
                                autocomplete="tel"
                            />
                        </div>

                        <div class="flex justify-end gap-sm">
                            <button
                                type="button"
                                class="btn btn-secondary"
                                onclick="Profile.init()">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                class="btn btn-primary"
                                id="save-personal-btn"
                                onclick="Profile.savePersonal(event)">
                                Salvar alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // Aba segurança
    renderSecurityTab() {
        return `
            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="h4 mb-0">Alterar Senha</h3>
                </div>
                <div class="card-body">
                    <form id="security-form" novalidate>

                        <div class="form-group">
                            <label class="form-label form-label-required"
                                   for="current-password">
                                Senha atual
                            </label>
                            <input
                                type="password"
                                id="current-password"
                                class="form-input"
                                autocomplete="current-password"
                            />
                            <span class="form-feedback error"
                                  id="current-password-error"
                                  style="display:none">
                            </span>
                        </div>

                        <div class="form-group">
                            <label class="form-label form-label-required"
                                   for="new-password">
                                Nova senha
                            </label>
                            <input
                                type="password"
                                id="new-password"
                                class="form-input"
                                placeholder="Mínimo 8 caracteres"
                                autocomplete="new-password"
                                oninput="Register.updatePasswordStrength(this.value)"
                            />
                            <div class="password-strength mt-xs"
                                 id="password-strength">
                                <div class="password-strength-bars">
                                    <div class="strength-bar" id="strength-1"></div>
                                    <div class="strength-bar" id="strength-2"></div>
                                    <div class="strength-bar" id="strength-3"></div>
                                    <div class="strength-bar" id="strength-4"></div>
                                </div>
                                <span class="strength-label text-xs"
                                      id="strength-label"></span>
                            </div>
                            <span class="form-feedback error"
                                  id="new-password-error"
                                  style="display:none">
                            </span>
                        </div>

                        <div class="form-group">
                            <label class="form-label form-label-required"
                                   for="confirm-new-password">
                                Confirmar nova senha
                            </label>
                            <input
                                type="password"
                                id="confirm-new-password"
                                class="form-input"
                                autocomplete="new-password"
                            />
                            <span class="form-feedback error"
                                  id="confirm-new-password-error"
                                  style="display:none">
                            </span>
                        </div>

                        <div class="flex justify-end">
                            <button
                                type="button"
                                class="btn btn-primary"
                                id="save-password-btn"
                                onclick="Profile.savePassword()">
                                Alterar senha
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // Aba preferências
    renderPreferencesTab() {
        const prefs = State.getState().preferences;

        return `
            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="h4 mb-0">Preferências</h3>
                </div>
                <div class="card-body">

                    <div class="form-group">
                        <label class="form-label">Tema</label>
                        <div class="flex gap-md">
                            ${['light', 'dark'].map(theme => `
                                <label class="form-check-label">
                                    <input
                                        type="radio"
                                        class="form-radio"
                                        name="theme"
                                        value="${theme}"
                                        ${State.getState().theme === theme
                                            ? 'checked' : ''}
                                        onchange="State.setTheme('${theme}')"
                                    />
                                    <span class="text-sm capitalize">
                                        ${theme === 'light' ? '☀️ Claro' : '🌙 Escuro'}
                                    </span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Velocidade padrão do vídeo</label>
                        <select
                            class="form-select"
                            style="max-width: 200px"
                            onchange="State.updatePreference('playback_speed', parseFloat(this.value))">
                            ${APP_CONFIG.VIDEO_PLAYBACK_SPEEDS.map(speed => `
                                <option
                                    value="${speed}"
                                    ${(prefs.playback_speed || 1) === speed
                                        ? 'selected' : ''}>
                                    ${speed === 1 ? 'Normal' : speed + 'x'}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-medium">Auto-play</p>
                                <p class="text-sm text-secondary">
                                    Iniciar próxima aula automaticamente
                                </p>
                            </div>
                            <label class="form-switch">
                                <input
                                    type="checkbox"
                                    ${prefs.autoplay_next !== false ? 'checked' : ''}
                                    onchange="State.updatePreference('autoplay_next', this.checked)"
                                />
                                <span class="form-switch-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-medium">Notificações por e-mail</p>
                                <p class="text-sm text-secondary">
                                    Receber atualizações de cursos
                                </p>
                            </div>
                            <label class="form-switch">
                                <input
                                    type="checkbox"
                                    ${prefs.email_notifications !== false
                                        ? 'checked' : ''}
                                    onchange="State.updatePreference(
                                        'email_notifications', this.checked)"
                                />
                                <span class="form-switch-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Aba zona de perigo
    renderDangerTab() {
        return `
            <div class="card mt-lg"
                 style="border-color: var(--color-error)">
                <div class="card-header"
                     style="border-bottom-color: var(--color-error)">
                    <h3 class="h4 mb-0" style="color: var(--color-error)">
                        ⚠️ Zona de Perigo
                    </h3>
                </div>
                <div class="card-body">
                    <div style="padding: var(--spacing-lg);
                                border: 1px solid var(--color-error);
                                border-radius: var(--radius-md)">
                        <h4 class="font-semibold mb-sm">Excluir conta</h4>
                        <p class="text-secondary text-sm mb-lg">
                            Ao excluir sua conta, todos os seus dados serão
                            permanentemente removidos, incluindo progresso de
                            cursos, histórico e matrículas. Esta ação não pode
                            ser desfeita.
                        </p>
                        <button
                            class="btn btn-danger"
                            onclick="Profile.deleteAccount()">
                            Excluir minha conta
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Trocar aba
    switchTab(tab) {
        this._activeTab = tab;

        document.querySelectorAll('[data-tab]').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        const content = document.getElementById('profile-tab-content');
        if (!content) return;

        const renderers = {
            personal: () => this.renderPersonalTab(),
            security: () => this.renderSecurityTab(),
            preferences: () => this.renderPreferencesTab(),
            danger: () => this.renderDangerTab()
        };

        content.innerHTML = renderers[tab]?.() || '';
    },

    // Salvar dados pessoais
    async savePersonal(e) {
        e.preventDefault();

        const name = document.getElementById('profile-name')?.value.trim();
        const email = document.getElementById('profile-email')?.value.trim();
        const phone = document.getElementById('profile-phone')?.value.trim();

        if (!Validators.isRequired(name)) {
            this.showFieldError('profile-name', 'Nome é obrigatório');
            return;
        }

        if (!Validators.isValidEmail(email)) {
            this.showFieldError('profile-email', 'E-mail inválido');
            return;
        }

        const btn = document.getElementById('save-personal-btn');
        btn.classList.add('btn-loading');
        btn.disabled = true;

        try {
            const response = await API.put(API_ENDPOINTS.USER.UPDATE_PROFILE, {
                name,
                email,
                phone
            });

            State.setUser(response.data);
            this._user = response.data;

            NotificationService.success(APP_CONFIG.SUCCESS_MESSAGES.PROFILE_UPDATE);
            this.renderContent();

        } catch (error) {
            if (error.status === 409) {
                this.showFieldError('profile-email', 'E-mail já cadastrado');
            } else {
                NotificationService.error('Erro ao salvar alterações.');
            }
        } finally {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    },

    // Salvar senha
    async savePassword() {
        const current = document.getElementById('current-password')?.value;
        const newPass = document.getElementById('new-password')?.value;
        const confirm = document.getElementById('confirm-new-password')?.value;

        const { isValid, errors } = Validators.validateForm(
            { current, newPass, confirm },
            {
                current: [
                    { type: 'required', message: 'Senha atual é obrigatória' }
                ],
                newPass: [
                    { type: 'required', message: 'Nova senha é obrigatória' },
                    {
                        type: 'minLength',
                        min: 8,
                        message: 'Senha deve ter pelo menos 8 caracteres'
                    }
                ],
                confirm: [
                    { type: 'required', message: 'Confirme a nova senha' },
                    {
                        type: 'matches',
                        field: 'newPass',
                        message: 'Senhas não conferem'
                    }
                ]
            }
        );

        if (!isValid) {
            if (errors.current) {
                this.showFieldError('current-password', errors.current);
            }
            if (errors.newPass) {
                this.showFieldError('new-password', errors.newPass);
            }
            if (errors.confirm) {
                this.showFieldError('confirm-new-password', errors.confirm);
            }
            return;
        }

        const btn = document.getElementById('save-password-btn');
        btn.classList.add('btn-loading');
        btn.disabled = true;

        try {
            await API.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
                current_password: current,
                new_password: newPass,
                new_password_confirmation: confirm
            });

            NotificationService.success('Senha alterada com sucesso!');

            // Limpar campos
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-new-password').value = '';

        } catch (error) {
            if (error.status === 401) {
                this.showFieldError('current-password', 'Senha atual incorreta');
            } else {
                NotificationService.error('Erro ao alterar senha.');
            }
        } finally {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    },

    // Alterar avatar
    async changeAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/webp';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!Validators.isValidFileSize(
                file.size,
                APP_CONFIG.MAX_FILE_SIZE
            )) {
                NotificationService.error('Imagem muito grande. Máximo 10MB.');
                return;
            }

            const loading = ModalService.loading('Enviando imagem...');

            try {
                const response = await API.upload(
                    API_ENDPOINTS.USER.UPDATE_AVATAR,
                    file
                );

                const user = { ...this._user, avatar_url: response.data.url };
                State.setUser(user);
                this._user = user;

                loading.close();
                NotificationService.success('Foto atualizada!');
                this.renderContent();

            } catch (error) {
                loading.close();
                NotificationService.error('Erro ao enviar imagem.');
            }
        };

        input.click();
    },

    // Excluir conta
    async deleteAccount() {
        const confirmed = await ModalService.confirm({
            title: 'Excluir conta',
            message: `Tem certeza que deseja excluir sua conta? 
                     Todos os seus dados serão removidos permanentemente. 
                     Esta ação não pode ser desfeita.`,
            confirmLabel: 'Sim, excluir minha conta',
            cancelLabel: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        const loading = ModalService.loading('Excluindo conta...');

        try {
            await API.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT);
            loading.close();
            await AuthService.logout();
            NotificationService.info('Conta excluída com sucesso.');
        } catch (error) {
            loading.close();
            NotificationService.error('Erro ao excluir conta. Tente novamente.');
        }
    },

    showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        const errorEl = document.getElementById(`${fieldId}-error`);

        if (input) input.classList.add('is-invalid');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },

    renderSkeleton() {
        return `
            <div class="flex gap-xl">
                <div style="width:280px">
                    <div class="card-skeleton"
                         style="height:280px;border-radius:var(--radius-lg)">
                    </div>
                </div>
                <div class="flex-1">
                    <div class="card-skeleton"
                         style="height:400px;border-radius:var(--radius-lg)">
                    </div>
                </div>
            </div>
        `;
    }
};