/**
 * EventManager - Gerenciamento de eventos
 * Responsável por centralizar e gerenciar todos os eventos da aplicação
 * 
 * Funcionalidades:
 * - Centralização de event listeners
 * - Gerenciamento de eventos de teclado
 * - Event delegation
 * - Cleanup de eventos
 * - Eventos customizados
 */
class EventManager {
    constructor() {
        this.listeners = new Map();
        this.keyboardShortcuts = new Map();
        this.eventDelegation = new Map();
    }

    /**
     * Adiciona um event listener
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} event - Tipo do evento
     * @param {Function} handler - Função de callback
     * @param {Object} options - Opções do event listener
     * @returns {string} ID do listener
     */
    addEventListener(element, event, handler, options = {}) {
        if (!element) return null;

        const listenerId = this.generateListenerId();
        const listener = {
            element,
            event,
            handler,
            options,
            id: listenerId
        };

        element.addEventListener(event, handler, options);
        
        if (!this.listeners.has(element)) {
            this.listeners.set(element, new Map());
        }
        
        this.listeners.get(element).set(listenerId, listener);
        
        return listenerId;
    }

    /**
     * Remove um event listener
     * @param {string} listenerId - ID do listener
     */
    removeEventListener(listenerId) {
        for (const [element, elementListeners] of this.listeners) {
            if (elementListeners.has(listenerId)) {
                const listener = elementListeners.get(listenerId);
                element.removeEventListener(listener.event, listener.handler);
                elementListeners.delete(listenerId);
                return true;
            }
        }
        return false;
    }

    /**
     * Remove todos os listeners de um elemento
     * @param {HTMLElement} element - Elemento DOM
     */
    removeAllListeners(element) {
        if (!this.listeners.has(element)) return;

        const elementListeners = this.listeners.get(element);
        for (const [listenerId, listener] of elementListeners) {
            element.removeEventListener(listener.event, listener.handler);
        }
        
        elementListeners.clear();
    }

    /**
     * Adiciona um atalho de teclado
     * @param {string} key - Tecla
     * @param {Function} handler - Função de callback
     * @param {Object} modifiers - Modificadores (ctrl, alt, shift)
     */
    addKeyboardShortcut(key, handler, modifiers = {}) {
        const shortcutId = this.generateListenerId();
        const shortcut = {
            key,
            handler,
            modifiers,
            id: shortcutId
        };

        this.keyboardShortcuts.set(shortcutId, shortcut);
        return shortcutId;
    }

    /**
     * Remove um atalho de teclado
     * @param {string} shortcutId - ID do atalho
     */
    removeKeyboardShortcut(shortcutId) {
        return this.keyboardShortcuts.delete(shortcutId);
    }

    /**
     * Configura event delegation
     * @param {HTMLElement} parent - Elemento pai
     * @param {string} selector - Seletor CSS
     * @param {string} event - Tipo do evento
     * @param {Function} handler - Função de callback
     * @returns {string} ID do listener
     */
    addDelegatedEventListener(parent, selector, event, handler) {
        if (!parent) return null;

        const listenerId = this.generateListenerId();
        const delegatedHandler = (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        };

        parent.addEventListener(event, delegatedHandler);
        
        if (!this.eventDelegation.has(parent)) {
            this.eventDelegation.set(parent, new Map());
        }
        
        this.eventDelegation.get(parent).set(listenerId, {
            selector,
            event,
            handler: delegatedHandler,
            originalHandler: handler,
            id: listenerId
        });
        
        return listenerId;
    }

    /**
     * Remove event delegation
     * @param {string} listenerId - ID do listener
     */
    removeDelegatedEventListener(listenerId) {
        for (const [parent, parentDelegation] of this.eventDelegation) {
            if (parentDelegation.has(listenerId)) {
                const delegation = parentDelegation.get(listenerId);
                parent.removeEventListener(delegation.event, delegation.handler);
                parentDelegation.delete(listenerId);
                return true;
            }
        }
        return false;
    }

    /**
     * Configura listeners de teclado
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardEvent(e);
        });
    }

    /**
     * Lida com eventos de teclado
     * @param {KeyboardEvent} e - Evento de teclado
     */
    handleKeyboardEvent(e) {
        for (const [shortcutId, shortcut] of this.keyboardShortcuts) {
            if (this.matchesShortcut(e, shortcut)) {
                e.preventDefault();
                shortcut.handler(e);
                return;
            }
        }
    }

    /**
     * Verifica se o evento corresponde ao atalho
     * @param {KeyboardEvent} e - Evento de teclado
     * @param {Object} shortcut - Configuração do atalho
     * @returns {boolean}
     */
    matchesShortcut(e, shortcut) {
        if (e.key !== shortcut.key) return false;
        
        if (shortcut.modifiers.ctrl && !e.ctrlKey) return false;
        if (shortcut.modifiers.alt && !e.altKey) return false;
        if (shortcut.modifiers.shift && !e.shiftKey) return false;
        
        return true;
    }

    /**
     * Dispara um evento customizado
     * @param {HTMLElement} element - Elemento alvo
     * @param {string} eventName - Nome do evento
     * @param {Object} detail - Dados do evento
     */
    dispatchCustomEvent(element, eventName, detail = {}) {
        if (!element) return;

        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(event);
    }

    /**
     * Adiciona listener para evento customizado
     * @param {HTMLElement} element - Elemento alvo
     * @param {string} eventName - Nome do evento
     * @param {Function} handler - Função de callback
     * @returns {string} ID do listener
     */
    addCustomEventListener(element, eventName, handler) {
        return this.addEventListener(element, eventName, handler);
    }

    /**
     * Configura eventos específicos da aplicação
     */
    setupAppEventListeners() {
        // Atalhos de teclado globais
        this.addKeyboardShortcut('n', (e) => {
            if (e.altKey) {
                this.dispatchCustomEvent(document, 'app:openTaskModal');
            }
        }, { alt: true });

        this.addKeyboardShortcut('k', (e) => {
            if (e.altKey) {
                this.dispatchCustomEvent(document, 'app:focusSearch');
            }
        }, { alt: true });

        this.addKeyboardShortcut('Escape', (e) => {
            this.dispatchCustomEvent(document, 'app:closeModals');
        });

        // Eventos de formulário
        this.addDelegatedEventListener(document, 'form', 'submit', (e) => {
            e.preventDefault();
            const formId = e.target.id;
            this.dispatchCustomEvent(document, 'app:formSubmit', { formId, form: e.target });
        });

        // Eventos de botão
        this.addDelegatedEventListener(document, 'button[data-action]', 'click', (e) => {
            const action = e.target.dataset.action;
            this.dispatchCustomEvent(document, 'app:buttonClick', { action, button: e.target });
        });

        // Eventos de input
        this.addDelegatedEventListener(document, 'input[data-action]', 'change', (e) => {
            const action = e.target.dataset.action;
            this.dispatchCustomEvent(document, 'app:inputChange', { action, input: e.target, value: e.target.value });
        });

        // Eventos de filtro
        this.addDelegatedEventListener(document, '.filter-btn', 'click', (e) => {
            const filter = e.target.dataset.filter;
            this.dispatchCustomEvent(document, 'app:filterChange', { filter });
        });

        // Eventos de categoria
        this.addDelegatedEventListener(document, '.category-item', 'click', (e) => {
            const categoryId = e.target.dataset.categoryId;
            this.dispatchCustomEvent(document, 'app:categoryClick', { categoryId });
        });

        // Eventos de tag
        this.addDelegatedEventListener(document, '.tag-item', 'click', (e) => {
            const tagId = e.target.dataset.tagId;
            this.dispatchCustomEvent(document, 'app:tagClick', { tagId });
        });

        // Eventos de tarefa
        this.addDelegatedEventListener(document, '.task-checkbox', 'change', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            this.dispatchCustomEvent(document, 'app:taskToggle', { taskId, completed: e.target.checked });
        });

        this.addDelegatedEventListener(document, '.task-action-btn.edit', 'click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            this.dispatchCustomEvent(document, 'app:taskEdit', { taskId });
        });

        this.addDelegatedEventListener(document, '.task-action-btn.delete', 'click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            this.dispatchCustomEvent(document, 'app:taskDelete', { taskId });
        });
    }

    /**
     * Gera ID único para listener
     * @returns {string} ID único
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Obtém estatísticas dos listeners
     * @returns {Object} Estatísticas
     */
    getStats() {
        let totalListeners = 0;
        let totalDelegated = 0;
        
        for (const elementListeners of this.listeners.values()) {
            totalListeners += elementListeners.size;
        }
        
        for (const parentDelegation of this.eventDelegation.values()) {
            totalDelegated += parentDelegation.size;
        }
        
        return {
            totalListeners,
            totalDelegated,
            totalKeyboardShortcuts: this.keyboardShortcuts.size,
            totalElements: this.listeners.size,
            totalDelegationParents: this.eventDelegation.size
        };
    }

    /**
     * Limpa todos os listeners
     */
    cleanup() {
        // Limpar listeners normais
        for (const [element, elementListeners] of this.listeners) {
            for (const [listenerId, listener] of elementListeners) {
                element.removeEventListener(listener.event, listener.handler);
            }
            elementListeners.clear();
        }
        this.listeners.clear();

        // Limpar event delegation
        for (const [parent, parentDelegation] of this.eventDelegation) {
            for (const [listenerId, delegation] of parentDelegation) {
                parent.removeEventListener(delegation.event, delegation.handler);
            }
            parentDelegation.clear();
        }
        this.eventDelegation.clear();

        // Limpar atalhos de teclado
        this.keyboardShortcuts.clear();
    }

    /**
     * Destrói o gerenciador de eventos
     */
    destroy() {
        this.cleanup();
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
} else {
    window.EventManager = EventManager;
}
