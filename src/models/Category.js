/**
 * Category - Modelo de categoria
 * Representa uma categoria no sistema
 * 
 * Propriedades:
 * - id: Identificador único
 * - name: Nome da categoria
 * - color: Cor da categoria (hexadecimal)
 * - createdAt: Data de criação
 * - usageCount: Número de tarefas usando esta categoria (calculado dinamicamente)
 */
class Category {
    constructor(data = {}) {
        this.id = data.id || IdGenerator.generateCategoryId();
        this.name = data.name || '';
        this.color = data.color || '#007bff';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.usageCount = data.usageCount || 0;
    }


    /**
     * Atualiza o nome da categoria
     * @param {string} name - Novo nome
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Atualiza a cor da categoria
     * @param {string} color - Nova cor (hexadecimal)
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Atualiza os dados da categoria
     * @param {Object} data - Dados para atualizar
     */
    update(data) {
        Object.keys(data).forEach(key => {
            if (key in this && key !== 'id' && key !== 'createdAt' && key !== 'usageCount') {
                this[key] = data[key];
            }
        });
    }

    /**
     * Cria uma cópia da categoria
     * @returns {Category} Nova instância da categoria
     */
    clone() {
        return new Category({
            id: this.id,
            name: this.name,
            color: this.color,
            createdAt: this.createdAt,
            usageCount: this.usageCount
        });
    }

    /**
     * Converte a categoria para objeto JSON
     * @returns {Object} Objeto JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            createdAt: this.createdAt
        };
    }

    /**
     * Cria uma categoria a partir de um objeto JSON
     * @param {Object} json - Objeto JSON
     * @returns {Category} Nova instância da categoria
     */
    static fromJSON(json) {
        return new Category(json);
    }

    /**
     * Valida os dados da categoria
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    validate() {
        const errors = [];

        if (!this.name || this.name.trim() === '') {
            errors.push('Nome da categoria é obrigatório');
        }

        if (this.name && this.name.length > 50) {
            errors.push('Nome da categoria deve ter no máximo 50 caracteres');
        }

        if (!this.color || !this.isValidColor(this.color)) {
            errors.push('Cor deve estar no formato hexadecimal válido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Verifica se uma cor é válida
     * @param {string} color - Cor para verificar
     * @returns {boolean}
     */
    isValidColor(color) {
        const hexColorRegex = /^#[0-9A-F]{6}$/i;
        return hexColorRegex.test(color);
    }

    /**
     * Obtém a idade da categoria em dias
     * @returns {number} Idade em dias
     */
    getAgeInDays() {
        const created = new Date(this.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Verifica se a categoria está sendo usada
     * @param {number} usageCount - Número de tarefas usando esta categoria
     * @returns {boolean}
     */
    isInUse(usageCount = 0) {
        return usageCount > 0;
    }

    /**
     * Obtém informações de uso da categoria
     * @param {number} usageCount - Número de tarefas usando esta categoria
     * @returns {Object} Informações de uso
     */
    getUsageInfo(usageCount = 0) {
        return {
            isInUse: this.isInUse(usageCount),
            count: usageCount,
            message: usageCount > 0 
                ? `Usada por ${usageCount} tarefa${usageCount > 1 ? 's' : ''}`
                : 'Não está sendo usada'
        };
    }

    /**
     * Cria categorias padrão do sistema
     * @returns {Array<Category>} Array de categorias padrão
     */
    static createDefaultCategories() {
        return [
            new Category({
                id: 'work',
                name: 'Trabalho',
                color: '#ff6b6b',
                createdAt: new Date().toISOString()
            }),
            new Category({
                id: 'personal',
                name: 'Pessoal',
                color: '#4ecdc4',
                createdAt: new Date().toISOString()
            }),
            new Category({
                id: 'study',
                name: 'Estudos',
                color: '#45b7d1',
                createdAt: new Date().toISOString()
            })
        ];
    }

    /**
     * Verifica se uma categoria é padrão do sistema
     * @returns {boolean}
     */
    isDefault() {
        const defaultIds = ['work', 'personal', 'study'];
        return defaultIds.includes(this.id);
    }

    /**
     * Obtém informações sobre a categoria
     * @returns {Object} Informações da categoria
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            createdAt: this.createdAt,
            isDefault: this.isDefault(),
            ageInDays: this.getAgeInDays()
        };
    }

    /**
     * Compara duas categorias por nome
     * @param {Category} other - Outra categoria
     * @returns {number} Resultado da comparação
     */
    compareByName(other) {
        return this.name.localeCompare(other.name);
    }

    /**
     * Compara duas categorias por data de criação
     * @param {Category} other - Outra categoria
     * @returns {number} Resultado da comparação
     */
    compareByCreatedAt(other) {
        return new Date(this.createdAt) - new Date(other.createdAt);
    }

    /**
     * Compara duas categorias por uso
     * @param {Category} other - Outra categoria
     * @param {number} thisUsage - Uso desta categoria
     * @param {number} otherUsage - Uso da outra categoria
     * @returns {number} Resultado da comparação
     */
    compareByUsage(other, thisUsage = 0, otherUsage = 0) {
        return otherUsage - thisUsage;
    }

    /**
     * Obtém uma representação em string da categoria
     * @returns {string} String representando a categoria
     */
    toString() {
        return `Category(${this.id}: ${this.name})`;
    }

    /**
     * Verifica se duas categorias são iguais
     * @param {Category} other - Outra categoria
     * @returns {boolean}
     */
    equals(other) {
        return other instanceof Category && this.id === other.id;
    }

    /**
     * Obtém o hash da categoria para comparações
     * @returns {string} Hash da categoria
     */
    hashCode() {
        return this.id;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Category;
} else {
    window.Category = Category;
}
