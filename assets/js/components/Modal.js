// Modal.js - Sistema de modais reutilizáveis

const ModalService = {
    // Modais ativos
    _activeModals: [],
    
    // Container
    _container: null,
    
    // Inicializar
    init() {
        this._container = document.getElementById('modal-root');
        
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.id = 'modal-root';
            document.body.appendChild(this._container);
        }
        
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._activeModals.length > 0) {
                const lastModal = this._activeModals[this._activeModals.length - 1];
                if (lastModal.closeable !== false) {
                    this.close(lastModal.id);
                }
            }
        });
    },
    
    // Criar configuração de modal
    create(config) {
        return {
            id: CryptoUtils.generateUUID(),
            title: config.title || '',
            content: config.content || '',
            size: config.size || 'md',
            closeable: config.closeable !== false,
            actions: config.actions || [],
            onClose: config.onClose || null,
            onOpen: config.onOpen || null,
            className: config.className || ''
        };
    },
    
    // Abrir modal
    open(modalConfig) {
        if (!this._container) this.init();
        
        const modal = typeof modalConfig === 'object' && modalConfig.id
            ? modalConfig
            : this.create(modalConfig);
        
        // Prevenir scroll do body
        document.body.classList.add('modal-open');
        
        // Criar elemento
        const backdrop = this.createBackdropElement(modal);
        this._container.appendChild(backdrop);
        
        // Registrar modal ativo
        this._activeModals.push(modal);
        
        // Callback de abertura
        if (modal.onOpen) modal.onOpen();
        
        // Emitir evento
        EventBus.emit(APP_EVENTS.MODAL_OPENED, { id: modal.id });
        
        // Foco no primeiro elemento focável
        setTimeout(() => {
            const focusable = backdrop.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable) focusable.focus();
        }, 100);
        
        return modal.id;
    },
    
    // Criar elemento backdrop/modal
    createBackdropElement(modal) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.dataset.modalId = modal.id;
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');
        backdrop.setAttribute('aria-labelledby', `modal-title-${modal.id}`);
        
        // Fechar ao clicar no backdrop
        if (modal.closeable) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) this.close(modal.id);
            });
        }
        
        // Gerar actions HTML
        const actionsHtml = modal.actions.map(action => `
            <button 
                class="btn btn-${action.type || 'secondary'}" 
                data-action="${action.label}"
                ${action.disabled ? 'disabled' : ''}
            >
                ${action.label}
            </button>
        `).join('');
        
        backdrop.innerHTML = `
            <div class="modal modal-${modal.size} ${modal.className}">
                ${modal.title ? `
                    <div class="modal-header">
                        <h3 class="modal-title" id="modal-title-${modal.id}">
                            ${modal.title}
                        </h3>
                        ${modal.closeable ? `
                            <button class="modal-close" aria-label="Fechar modal">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
                                     viewBox="0 0 24 24" stroke="currentColor" 
                                     width="20" height="20">
                                    <path stroke-linecap="round" stroke-linejoin="round" 
                                          stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="modal-body">
                    ${modal.content}
                </div>
                ${actionsHtml ? `
                    <div class="modal-footer">
                        ${actionsHtml}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Vincular eventos dos botões
        if (modal.closeable) {
            const closeBtn = backdrop.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close(modal.id));
            }
        }
        
        // Vincular actions
        modal.actions.forEach(action => {
            const btn = backdrop.querySelector(`[data-action="${action.label}"]`);
            if (btn && action.onClick) {
                btn.addEventListener('click', () => {
                    action.onClick();
                    if (action.closeOnClick !== false) {
                        this.close(modal.id);
                    }
                });
            }
        });
        
        return backdrop;
    },
    
    // Fechar modal
    close(modalId) {
        const backdrop = this._container?.querySelector(
            `[data-modal-id="${modalId}"]`
        );
        
        if (!backdrop) return;
        
        backdrop.classList.add('closing');
        
        setTimeout(() => {
            backdrop.remove();
            
            // Remover da lista de ativos
            const index = this._activeModals.findIndex(m => m.id === modalId);
            if (index !== -1) {
                const modal = this._activeModals[index];
                
                if (modal.onClose) modal.onClose();
                
                this._activeModals.splice(index, 1);
            }
            
            // Restaurar scroll se não houver mais modais
            if (this._activeModals.length === 0) {
                document.body.classList.remove('modal-open');
            }
            
            EventBus.emit(APP_EVENTS.MODAL_CLOSED, { id: modalId });
        }, 300);
    },
    
    // Fechar todos os modais
    closeAll() {
        [...this._activeModals].forEach(modal => this.close(modal.id));
    },
    
    // Atualizar conteúdo do modal
    updateContent(modalId, content) {
        const backdrop = this._container?.querySelector(
            `[data-modal-id="${modalId}"]`
        );
        
        if (!backdrop) return;
        
        const body = backdrop.querySelector('.modal-body');
        if (body) body.innerHTML = content;
    },
    
    // Modal de confirmação
    confirm({
        title = 'Confirmar',
        message = 'Tem certeza?',
        confirmLabel = 'Confirmar',
        cancelLabel = 'Cancelar',
        type = 'danger'
    } = {}) {
        return new Promise((resolve) => {
            const modal = this.create({
                title,
                content: `<p class="text-secondary">${message}</p>`,
                actions: [
                    {
                        label: cancelLabel,
                        type: 'secondary',
                        onClick: () => resolve(false)
                    },
                    {
                        label: confirmLabel,
                        type,
                        onClick: () => resolve(true)
                    }
                ],
                onClose: () => resolve(false)
            });
            
            this.open(modal);
        });
    },
    
    // Modal de alerta simples
    alert({ title = 'Aviso', message = '', label = 'OK' } = {}) {
        return new Promise((resolve) => {
            const modal = this.create({
                title,
                content: `<p class="text-secondary">${message}</p>`,
                actions: [
                    {
                        label,
                        type: 'primary',
                        onClick: () => resolve(true)
                    }
                ]
            });
            
            this.open(modal);
        });
    },
    
    // Modal de loading
    loading(message = 'Carregando...') {
        const modal = this.create({
            content: `
                <div class="flex flex-col items-center justify-center p-xl gap-md">
                    <div class="loader-spinner"></div>
                    <p class="text-secondary">${message}</p>
                </div>
            `,
            closeable: false,
            size: 'sm'
        });
        
        const id = this.open(modal);
        
        return {
            close: () => this.close(id),
            updateMessage: (msg) => {
                const p = this._container
                    ?.querySelector(`[data-modal-id="${id}"] p`);
                if (p) p.textContent = msg;
            }
        };
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => ModalService.init());