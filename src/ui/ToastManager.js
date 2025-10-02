/**
 * ToastManager - Gerenciador de notificações toast
 * Responsável por exibir feedback visual para ações do usuário
 */
class ToastManager {
    constructor() {
        this.toasts = [];
        this.container = null;
        this.init();
    }

    /**
     * Inicializa o gerenciador de toasts
     */
    init() {
        this.createContainer();
    }

    /**
     * Cria o container para os toasts
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    /**
     * Exibe um toast de sucesso
     * @param {string} message - Mensagem a ser exibida
     * @param {number} duration - Duração em milissegundos (padrão: 3000)
     */
    success(message, duration = 3000) {
        this.showToast(message, 'success', duration);
    }

    /**
     * Exibe um toast de erro
     * @param {string} message - Mensagem a ser exibida
     * @param {number} duration - Duração em milissegundos (padrão: 4000)
     */
    error(message, duration = 4000) {
        this.showToast(message, 'error', duration);
    }

    /**
     * Exibe um toast de aviso
     * @param {string} message - Mensagem a ser exibida
     * @param {number} duration - Duração em milissegundos (padrão: 3500)
     */
    warning(message, duration = 3500) {
        this.showToast(message, 'warning', duration);
    }

    /**
     * Exibe um toast de informação
     * @param {string} message - Mensagem a ser exibida
     * @param {number} duration - Duração em milissegundos (padrão: 3000)
     */
    info(message, duration = 3000) {
        this.showToast(message, 'info', duration);
    }

    /**
     * Exibe um toast personalizado
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo do toast (success, error, warning, info)
     * @param {number} duration - Duração em milissegundos
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // Auto-remover após duração especificada
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Permitir fechar manualmente
        toast.addEventListener('click', () => {
            this.removeToast(toast);
        });
    }

    /**
     * Cria um elemento toast
     * @param {string} message - Mensagem do toast
     * @param {string} type - Tipo do toast
     * @returns {HTMLElement} Elemento toast criado
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" aria-label="Fechar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-progress"></div>
        `;

        return toast;
    }

    /**
     * Retorna o ícone apropriado para cada tipo
     * @param {string} type - Tipo do toast
     * @returns {string} Classe do ícone
     */
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove um toast específico
     * @param {HTMLElement} toast - Elemento toast a ser removido
     */
    removeToast(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.add('toast-hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            // Remover da lista de toasts ativos
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300); // Duração da animação de saída
    }

    /**
     * Remove todos os toasts ativos
     */
    clearAll() {
        this.toasts.forEach(toast => {
            this.removeToast(toast);
        });
    }

    /**
     * Métodos de conveniência para ações específicas
     * Apenas feedbacks essenciais conforme solicitado
     */
    
    // === FEEDBACKS DE TAREFAS ===
    taskSaved() {
        this.success('Tarefa criada com sucesso!');
    }

    taskUpdated() {
        this.success('Tarefa atualizada com sucesso!');
    }

    taskDeleted() {
        this.success('Tarefa excluída com sucesso!');
    }

    taskError(message = 'Erro ao processar tarefa') {
        this.error(message);
    }

    // === FEEDBACKS DE CONFIGURAÇÕES ===
    settingsSaved() {
        this.success('Configurações salvas com sucesso!');
    }

    dataExported() {
        this.success('Dados exportados com sucesso!');
    }

    dataImported() {
        this.success('Dados importados com sucesso!');
    }

    dataCleared() {
        this.success('Dados limpos com sucesso!');
    }

    validationError(message) {
        this.warning(message);
    }

    saveError(message = 'Erro ao salvar dados') {
        this.error(message);
    }

    loadError(message = 'Erro ao carregar dados') {
        this.error(message);
    }
}

// Exportar para uso global
window.ToastManager = ToastManager;
