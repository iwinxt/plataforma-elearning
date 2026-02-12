// Notification.js - Sistema de notificações toast

const NotificationService = {
    // Container de notificações
    _container: null,
    
    // Notificações ativas
    _notifications: new Map(),
    
    // Inicializar
    init() {
        this._container = document.getElementById('notifications-container');
        
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.id = 'notifications-container';
            document.body.appendChild(this._container);
        }
    },
    
    // Mostrar notificação
    show(message, type = 'info', duration = APP_CONFIG.NOTIFICATION_DURATION) {
        // Garantir que container existe
        if (!this._container) this.init();
        
        // Limitar número de notificações
        if (this._notifications.size >= APP_CONFIG.MAX_NOTIFICATIONS) {
            const firstId = this._notifications.keys().next().value;
            this.dismiss(firstId);
        }
        
        const id = CryptoUtils.generateUUID();
        
        const notification = this.createNotificationElement(id, message, type, duration);
        this._container.appendChild(notification);
        this._notifications.set(id, notification);
        
        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }
        
        // Emitir evento
        EventBus.emit(APP_EVENTS.NOTIFICATION_SHOWN, { id, message, type });
        
        return id;
    },
    
    // Criar elemento de notificação
    createNotificationElement(id, message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>`,
            error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                   </svg>`
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                ${icons[type] || icons.info}
            </div>
            <div class="notification-content">
                <p class="notification-message">${Validators.sanitize(String(message))}</p>
            </div>
            <button class="notification-close" aria-label="Fechar notificação">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                     stroke="currentColor" width="16" height="16">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
            ${duration > 0 ? `
                <div class="notification-progress" 
                     style="animation-duration: ${duration}ms">
                </div>` : ''
            }
        `;
        
        // Fechar ao clicar no X
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.dismiss(id);
        });
        
        return notification;
    },
    
    // Dispensar notificação
    dismiss(id) {
        const notification = this._notifications.get(id);
        if (!notification) return;
        
        notification.classList.add('removing');
        
        setTimeout(() => {
            notification.remove();
            this._notifications.delete(id);
        }, 300);
    },
    
    // Atalhos por tipo
    success(message, duration) {
        return this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    },
    
    // Dispensar todas
    dismissAll() {
        this._notifications.forEach((_, id) => this.dismiss(id));
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => NotificationService.init());