/**
 * IdGenerator - Utilitário para geração de IDs únicos
 * Responsável por gerar identificadores únicos para toda a aplicação
 * 
 * Funcionalidades:
 * - Geração de IDs únicos baseados em timestamp + random
 * - IDs legíveis e únicos
 * - Consistência em toda a aplicação
 */
class IdGenerator {
    /**
     * Gera um ID único
     * @returns {string} ID único no formato: timestamp + random
     */
    static generate() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Gera um ID único para tarefas
     * @returns {string} ID único para tarefa
     */
    static generateTaskId() {
        return this.generate();
    }

    /**
     * Gera um ID único para categorias
     * @returns {string} ID único para categoria
     */
    static generateCategoryId() {
        return this.generate();
    }

    /**
     * Gera um ID único para tags
     * @returns {string} ID único para tag
     */
    static generateTagId() {
        return this.generate();
    }

    /**
     * Valida se um ID tem o formato correto
     * @param {string} id - ID para validar
     * @returns {boolean} Se o ID é válido
     */
    static isValid(id) {
        return typeof id === 'string' && id.length > 0 && /^[a-z0-9]+$/i.test(id);
    }

    /**
     * Gera um ID com prefixo específico
     * @param {string} prefix - Prefixo para o ID
     * @returns {string} ID com prefixo
     */
    static generateWithPrefix(prefix) {
        return `${prefix}_${this.generate()}`;
    }
}

// Exportar para uso global
window.IdGenerator = IdGenerator;
