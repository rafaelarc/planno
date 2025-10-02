/**
 * Tag - Modelo de tag
 * Representa uma tag no sistema
 * 
 * Propriedades:
 * - id: Identificador único
 * - name: Nome da tag
 * - color: Cor da tag (hexadecimal)
 * - createdAt: Data de criação
 * - usageCount: Número de tarefas usando esta tag (calculado dinamicamente)
 */
class Tag {
    constructor(data = {}) {
        this.id = data.id || IdGenerator.generateTagId();
        this.name = data.name || '';
        this.color = data.color || '#dc3545';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.usageCount = data.usageCount || 0;
    }


    /**
     * Atualiza o nome da tag
     * @param {string} name - Novo nome
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Atualiza a cor da tag
     * @param {string} color - Nova cor (hexadecimal)
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Atualiza os dados da tag
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
     * Cria uma cópia da tag
     * @returns {Tag} Nova instância da tag
     */
    clone() {
        return new Tag({
            id: this.id,
            name: this.name,
            color: this.color,
            createdAt: this.createdAt,
            usageCount: this.usageCount
        });
    }

    /**
     * Converte a tag para objeto JSON
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
     * Cria uma tag a partir de um objeto JSON
     * @param {Object} json - Objeto JSON
     * @returns {Tag} Nova instância da tag
     */
    static fromJSON(json) {
        return new Tag(json);
    }

    /**
     * Valida os dados da tag
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    validate() {
        const errors = [];

        if (!this.name || this.name.trim() === '') {
            errors.push('Nome da tag é obrigatório');
        }

        if (this.name && this.name.length > 30) {
            errors.push('Nome da tag deve ter no máximo 30 caracteres');
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
     * Obtém a idade da tag em dias
     * @returns {number} Idade em dias
     */
    getAgeInDays() {
        const created = new Date(this.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Verifica se a tag está sendo usada
     * @param {number} usageCount - Número de tarefas usando esta tag
     * @returns {boolean}
     */
    isInUse(usageCount = 0) {
        return usageCount > 0;
    }

    /**
     * Obtém informações de uso da tag
     * @param {number} usageCount - Número de tarefas usando esta tag
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
     * Cria tags padrão do sistema
     * @returns {Array<Tag>} Array de tags padrão
     */
    static createDefaultTags() {
        return [
            new Tag({
                id: 'urgent',
                name: 'Urgente',
                color: '#dc3545',
                createdAt: new Date().toISOString()
            }),
            new Tag({
                id: 'important',
                name: 'Importante',
                color: '#ffc107',
                createdAt: new Date().toISOString()
            }),
            new Tag({
                id: 'meeting',
                name: 'Reunião',
                color: '#17a2b8',
                createdAt: new Date().toISOString()
            }),
            new Tag({
                id: 'project',
                name: 'Projeto',
                color: '#28a745',
                createdAt: new Date().toISOString()
            })
        ];
    }

    /**
     * Verifica se uma tag é padrão do sistema
     * @returns {boolean}
     */
    isDefault() {
        const defaultIds = ['urgent', 'important', 'meeting', 'project'];
        return defaultIds.includes(this.id);
    }

    /**
     * Obtém informações sobre a tag
     * @returns {Object} Informações da tag
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
     * Compara duas tags por nome
     * @param {Tag} other - Outra tag
     * @returns {number} Resultado da comparação
     */
    compareByName(other) {
        return this.name.localeCompare(other.name);
    }

    /**
     * Compara duas tags por data de criação
     * @param {Tag} other - Outra tag
     * @returns {number} Resultado da comparação
     */
    compareByCreatedAt(other) {
        return new Date(this.createdAt) - new Date(other.createdAt);
    }

    /**
     * Compara duas tags por uso
     * @param {Tag} other - Outra tag
     * @param {number} thisUsage - Uso desta tag
     * @param {number} otherUsage - Uso da outra tag
     * @returns {number} Resultado da comparação
     */
    compareByUsage(other, thisUsage = 0, otherUsage = 0) {
        return otherUsage - thisUsage;
    }

    /**
     * Obtém uma representação em string da tag
     * @returns {string} String representando a tag
     */
    toString() {
        return `Tag(${this.id}: ${this.name})`;
    }

    /**
     * Verifica se duas tags são iguais
     * @param {Tag} other - Outra tag
     * @returns {boolean}
     */
    equals(other) {
        return other instanceof Tag && this.id === other.id;
    }

    /**
     * Obtém o hash da tag para comparações
     * @returns {string} Hash da tag
     */
    hashCode() {
        return this.id;
    }

    /**
     * Obtém o contraste da cor da tag
     * @returns {string} 'light' ou 'dark'
     */
    getContrast() {
        // Converte hex para RGB
        const hex = this.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calcula luminância
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? 'dark' : 'light';
    }

    /**
     * Obtém a cor de texto recomendada para esta tag
     * @returns {string} Cor de texto (#000000 ou #ffffff)
     */
    getTextColor() {
        return this.getContrast() === 'dark' ? '#000000' : '#ffffff';
    }

    /**
     * Obtém estilos CSS para a tag
     * @returns {Object} Objeto com estilos CSS
     */
    getStyles() {
        return {
            backgroundColor: this.color,
            color: this.getTextColor(),
            border: `1px solid ${this.color}`,
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.8em',
            fontWeight: '500'
        };
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tag;
} else {
    window.Tag = Tag;
}
