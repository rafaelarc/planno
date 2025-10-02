/**
 * StateManager - Gerenciamento de estado
 * Responsável por gerenciar o estado global da aplicação
 * 
 * Funcionalidades:
 * - Estado centralizado
 * - Observadores de mudanças
 * - Histórico de estado
 * - Persistência de estado
 * - Validação de estado
 */
class StateManager {
    constructor() {
        this.state = {};
        this.observers = new Map();
        this.history = [];
        this.maxHistorySize = 50;
        this.isInitialized = false;
    }

    /**
     * Inicializa o gerenciador de estado
     * @param {Object} initialState - Estado inicial
     */
    initialize(initialState = {}) {
        this.state = { ...initialState };
        this.saveToHistory();
        this.isInitialized = true;
        this.notifyObservers('initialize', this.state);
    }

    /**
     * Obtém o estado atual
     * @param {string} key - Chave específica (opcional)
     * @returns {*} Estado ou valor específico
     */
    getState(key = null) {
        if (key) {
            return this.state[key];
        }
        return { ...this.state };
    }

    /**
     * Define o estado
     * @param {string|Object} key - Chave ou objeto de estado
     * @param {*} value - Valor (se key for string)
     */
    setState(key, value = undefined) {
        const previousState = { ...this.state };
        
        if (typeof key === 'object') {
            // Se key é um objeto, mesclar com o estado atual
            this.state = { ...this.state, ...key };
        } else {
            // Se key é uma string, definir propriedade específica
            this.state[key] = value;
        }
        
        this.saveToHistory();
        this.notifyObservers('change', this.state, previousState);
    }

    /**
     * Atualiza o estado de forma imutável
     * @param {Function} updater - Função que recebe o estado atual e retorna o novo estado
     */
    updateState(updater) {
        const previousState = { ...this.state };
        this.state = updater(this.state);
        this.saveToHistory();
        this.notifyObservers('change', this.state, previousState);
    }

    /**
     * Adiciona um observador de mudanças
     * @param {string} key - Chave específica para observar (opcional)
     * @param {Function} callback - Função de callback
     * @returns {string} ID do observador
     */
    subscribe(key, callback) {
        if (typeof key === 'function') {
            // Se key é uma função, é o callback
            callback = key;
            key = null;
        }
        
        const observerId = this.generateObserverId();
        const observer = {
            id: observerId,
            key,
            callback
        };
        
        if (!this.observers.has(key)) {
            this.observers.set(key, new Set());
        }
        
        this.observers.get(key).add(observer);
        
        return observerId;
    }

    /**
     * Remove um observador
     * @param {string} observerId - ID do observador
     */
    unsubscribe(observerId) {
        for (const [key, observers] of this.observers) {
            for (const observer of observers) {
                if (observer.id === observerId) {
                    observers.delete(observer);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Notifica observadores de mudanças
     * @param {string} event - Tipo do evento
     * @param {Object} newState - Novo estado
     * @param {Object} previousState - Estado anterior
     */
    notifyObservers(event, newState, previousState = null) {
        // Notificar observadores globais
        if (this.observers.has(null)) {
            this.observers.get(null).forEach(observer => {
                try {
                    observer.callback(event, newState, previousState);
                } catch (error) {
                    console.error('Erro no observador:', error);
                }
            });
        }
        
        // Notificar observadores específicos
        for (const [key, observers] of this.observers) {
            if (key && key !== null && newState.hasOwnProperty(key)) {
                observers.forEach(observer => {
                    try {
                        observer.callback(event, newState[key], previousState?.[key]);
                    } catch (error) {
                        console.error('Erro no observador específico:', error);
                    }
                });
            }
        }
    }

    /**
     * Salva estado no histórico
     */
    saveToHistory() {
        this.history.push({
            timestamp: Date.now(),
            state: { ...this.state }
        });
        
        // Limitar tamanho do histórico
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    /**
     * Desfaz a última mudança
     * @returns {boolean} Se foi possível desfazer
     */
    undo() {
        if (this.history.length < 2) return false;
        
        // Remover estado atual
        this.history.pop();
        
        // Restaurar estado anterior
        const previousState = this.history[this.history.length - 1];
        this.state = { ...previousState.state };
        
        this.notifyObservers('undo', this.state);
        return true;
    }

    /**
     * Obtém o histórico de estados
     * @returns {Array} Histórico de estados
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Limpa o histórico
     */
    clearHistory() {
        this.history = [];
        this.saveToHistory();
    }

    /**
     * Valida o estado atual
     * @param {Function} validator - Função de validação
     * @returns {Object} Resultado da validação
     */
    validateState(validator) {
        try {
            return validator(this.state);
        } catch (error) {
            return {
                isValid: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Obtém estatísticas do estado
     * @returns {Object} Estatísticas
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            stateKeys: Object.keys(this.state).length,
            observersCount: Array.from(this.observers.values()).reduce((total, observers) => total + observers.size, 0),
            historySize: this.history.length,
            maxHistorySize: this.maxHistorySize
        };
    }

    /**
     * Exporta o estado atual
     * @returns {Object} Estado exportado
     */
    exportState() {
        return {
            state: { ...this.state },
            timestamp: Date.now(),
            version: '1.0.0'
        };
    }

    /**
     * Importa estado
     * @param {Object} exportedState - Estado exportado
     * @returns {boolean} Se a importação foi bem-sucedida
     */
    importState(exportedState) {
        try {
            if (!exportedState.state) {
                throw new Error('Estado inválido: propriedade state não encontrada');
            }
            
            const previousState = { ...this.state };
            this.state = { ...exportedState.state };
            this.saveToHistory();
            this.notifyObservers('import', this.state, previousState);
            
            return true;
        } catch (error) {
            console.error('Erro ao importar estado:', error);
            return false;
        }
    }

    /**
     * Reseta o estado para o inicial
     * @param {Object} initialState - Estado inicial (opcional)
     */
    resetState(initialState = {}) {
        const previousState = { ...this.state };
        this.state = { ...initialState };
        this.clearHistory();
        this.saveToHistory();
        this.notifyObservers('reset', this.state, previousState);
    }

    /**
     * Gera ID único para observador
     * @returns {string} ID único
     */
    generateObserverId() {
        return `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Obtém snapshot do estado atual
     * @returns {Object} Snapshot do estado
     */
    getSnapshot() {
        return {
            state: { ...this.state },
            timestamp: Date.now(),
            historySize: this.history.length
        };
    }

    /**
     * Verifica se uma propriedade existe no estado
     * @param {string} key - Chave da propriedade
     * @returns {boolean}
     */
    hasProperty(key) {
        return key in this.state;
    }

    /**
     * Remove uma propriedade do estado
     * @param {string} key - Chave da propriedade
     * @returns {boolean} Se a propriedade foi removida
     */
    removeProperty(key) {
        if (key in this.state) {
            const previousState = { ...this.state };
            delete this.state[key];
            this.saveToHistory();
            this.notifyObservers('remove', this.state, previousState);
            return true;
        }
        return false;
    }

    /**
     * Obtém o tamanho do estado
     * @returns {number} Número de propriedades
     */
    getSize() {
        return Object.keys(this.state).length;
    }

    /**
     * Verifica se o estado está vazio
     * @returns {boolean}
     */
    isEmpty() {
        return this.getSize() === 0;
    }

    /**
     * Destrói o gerenciador de estado
     */
    destroy() {
        this.state = {};
        this.observers.clear();
        this.history = [];
        this.isInitialized = false;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
} else {
    window.StateManager = StateManager;
}
