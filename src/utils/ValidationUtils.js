/**
 * ValidationUtils - Utilitários para validação de dados
 * Responsável por validações de formulários e dados
 * 
 * Funcionalidades:
 * - Validação de tarefas
 * - Validação de categorias
 * - Validação de tags
 * - Validação de formulários
 * - Validação de cores
 * - Validação de datas
 */
class ValidationUtils {
    /**
     * Valida se uma string não está vazia
     * @param {string} value - Valor para validar
     * @param {string} fieldName - Nome do campo (para mensagens de erro)
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateRequired(value, fieldName = 'Campo') {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: `${fieldName} é obrigatório.`
            };
        }
        return { isValid: true, message: '' };
    }

    /**
     * Valida o comprimento de uma string
     * @param {string} value - Valor para validar
     * @param {number} minLength - Comprimento mínimo
     * @param {number} maxLength - Comprimento máximo
     * @param {string} fieldName - Nome do campo
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateLength(value, minLength, maxLength, fieldName = 'Campo') {
        if (!value) {
            return { isValid: true, message: '' }; // Campo opcional
        }

        const length = value.trim().length;
        
        if (length < minLength) {
            return {
                isValid: false,
                message: `${fieldName} deve ter pelo menos ${minLength} caracteres.`
            };
        }
        
        if (length > maxLength) {
            return {
                isValid: false,
                message: `${fieldName} deve ter no máximo ${maxLength} caracteres.`
            };
        }
        
        return { isValid: true, message: '' };
    }

    /**
     * Valida se uma cor hexadecimal é válida
     * @param {string} color - Cor para validar
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateColor(color) {
        if (!color) {
            return { isValid: false, message: 'Cor é obrigatória.' };
        }

        const hexColorRegex = /^#[0-9A-F]{6}$/i;
        if (!hexColorRegex.test(color)) {
            return {
                isValid: false,
                message: 'Cor deve estar no formato hexadecimal (#RRGGBB).'
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Valida se uma data é válida
     * @param {string} dateString - Data no formato YYYY-MM-DD
     * @param {boolean} allowPast - Se permite datas passadas
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateDate(dateString, allowPast = true) {
        if (!dateString) {
            return { isValid: true, message: '' }; // Data opcional
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return {
                isValid: false,
                message: 'Data inválida.'
            };
        }

        if (!allowPast) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
                return {
                    isValid: false,
                    message: 'Data não pode ser no passado.'
                };
            }
        }

        return { isValid: true, message: '' };
    }

    /**
     * Valida se um horário é válido
     * @param {string} timeString - Horário no formato HH:MM
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateTime(timeString) {
        if (!timeString) {
            return { isValid: true, message: '' }; // Horário opcional
        }

        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(timeString)) {
            return {
                isValid: false,
                message: 'Horário deve estar no formato HH:MM.'
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Valida uma tarefa completa
     * @param {Object} task - Objeto da tarefa
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    static validateTask(task) {
        const errors = [];

        // Validar título
        const titleValidation = this.validateRequired(task.title, 'Título da tarefa');
        if (!titleValidation.isValid) {
            errors.push(titleValidation.message);
        }

        // Validar comprimento do título
        const titleLengthValidation = this.validateLength(task.title, 1, 100, 'Título da tarefa');
        if (!titleLengthValidation.isValid) {
            errors.push(titleLengthValidation.message);
        }

        // Validar descrição (opcional)
        if (task.description) {
            const descLengthValidation = this.validateLength(task.description, 0, 500, 'Descrição');
            if (!descLengthValidation.isValid) {
                errors.push(descLengthValidation.message);
            }
        }

        // Validar data de vencimento
        const dateValidation = this.validateDate(task.dueDate, true);
        if (!dateValidation.isValid) {
            errors.push(dateValidation.message);
        }

        // Validar horário
        const timeValidation = this.validateTime(task.dueTime);
        if (!timeValidation.isValid) {
            errors.push(timeValidation.message);
        }

        // Validar tags (máximo 3)
        if (task.tags && task.tags.length > 3) {
            errors.push('Você pode selecionar no máximo 3 tags por tarefa.');
        }

        // Validar tarefa recorrente
        if (task.isRecurring && !task.dueDate) {
            errors.push('Tarefas recorrentes precisam de uma data de vencimento.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida uma categoria
     * @param {Object} category - Objeto da categoria
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    static validateCategory(category) {
        const errors = [];

        // Validar nome
        const nameValidation = this.validateRequired(category.name, 'Nome da categoria');
        if (!nameValidation.isValid) {
            errors.push(nameValidation.message);
        }

        // Validar comprimento do nome
        const nameLengthValidation = this.validateLength(category.name, 1, 50, 'Nome da categoria');
        if (!nameLengthValidation.isValid) {
            errors.push(nameLengthValidation.message);
        }

        // Validar cor
        const colorValidation = this.validateColor(category.color);
        if (!colorValidation.isValid) {
            errors.push(colorValidation.message);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida uma tag
     * @param {Object} tag - Objeto da tag
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    static validateTag(tag) {
        const errors = [];

        // Validar nome
        const nameValidation = this.validateRequired(tag.name, 'Nome da tag');
        if (!nameValidation.isValid) {
            errors.push(nameValidation.message);
        }

        // Validar comprimento do nome
        const nameLengthValidation = this.validateLength(tag.name, 1, 30, 'Nome da tag');
        if (!nameLengthValidation.isValid) {
            errors.push(nameLengthValidation.message);
        }

        // Validar cor
        const colorValidation = this.validateColor(tag.color);
        if (!colorValidation.isValid) {
            errors.push(colorValidation.message);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida se um nome já existe em uma lista
     * @param {string} name - Nome para verificar
     * @param {Array} items - Lista de itens
     * @param {string} nameField - Campo que contém o nome
     * @param {string} excludeId - ID para excluir da verificação (para edição)
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateUniqueName(name, items, nameField = 'name', excludeId = null) {
        if (!name || !items) {
            return { isValid: true, message: '' };
        }

        const normalizedName = name.toLowerCase().trim();
        const existingItem = items.find(item => 
            item[nameField].toLowerCase().trim() === normalizedName && 
            item.id !== excludeId
        );

        if (existingItem) {
            return {
                isValid: false,
                message: 'Já existe um item com este nome.'
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Valida configurações de notificação
     * @param {Object} settings - Configurações de notificação
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    static validateNotificationSettings(settings) {
        const errors = [];


        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida tempo de notificação
     * @param {number} time - Tempo em minutos
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateNotificationTime(time) {
        if (typeof time !== 'number' || time < 0 || time > 10080) { // 7 dias em minutos
            return {
                isValid: false,
                message: 'Tempo de notificação deve ser entre 0 e 10080 minutos.'
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Valida configurações de exibição
     * @param {Object} settings - Configurações de exibição
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    static validateDisplaySettings(settings) {
        const errors = [];

        if (settings.completedTasksDays) {
            if (typeof settings.completedTasksDays !== 'number' || 
                settings.completedTasksDays < 1 || 
                settings.completedTasksDays > 365) {
                errors.push('Dias de tarefas concluídas deve ser entre 1 e 365.');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida configurações de ordenação
     * @param {Object} sortOptions - Opções de ordenação
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    static validateSortOptions(sortOptions) {
        const errors = [];

        const validFields = ['createdAt', 'title', 'priority', 'status', 'category', 'tags', 'dueDate'];
        const validDirections = ['asc', 'desc'];

        if (!validFields.includes(sortOptions.field)) {
            errors.push('Campo de ordenação inválido.');
        }

        if (!validDirections.includes(sortOptions.direction)) {
            errors.push('Direção de ordenação inválida.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida um arquivo de importação
     * @param {File} file - Arquivo para validar
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateImportFile(file) {
        if (!file) {
            return {
                isValid: false,
                message: 'Nenhum arquivo selecionado.'
            };
        }

        if (file.type !== 'application/json') {
            return {
                isValid: false,
                message: 'Arquivo deve ser do tipo JSON.'
            };
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            return {
                isValid: false,
                message: 'Arquivo muito grande. Máximo 5MB.'
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Valida dados de importação
     * @param {Object} data - Dados para validar
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    static validateImportData(data) {
        const errors = [];

        if (!data || typeof data !== 'object') {
            errors.push('Dados inválidos.');
            return { isValid: false, errors };
        }

        // Verificar se tem a estrutura básica
        if (!Array.isArray(data.tasks)) {
            errors.push('Dados não contêm lista de tarefas.');
        }

        if (!Array.isArray(data.categories)) {
            errors.push('Dados não contêm lista de categorias.');
        }

        if (!Array.isArray(data.tags)) {
            errors.push('Dados não contêm lista de tags.');
        }

        // Verificar versão
        if (data.version && data.version !== '1.0.0') {
            errors.push('Versão do arquivo não é compatível.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitiza uma string removendo caracteres perigosos
     * @param {string} input - String para sanitizar
     * @returns {string} String sanitizada
     */
    static sanitizeString(input) {
        if (!input) return '';
        return input.trim().replace(/[<>]/g, '');
    }

    /**
     * Valida um email (se necessário no futuro)
     * @param {string} email - Email para validar
     * @returns {Object} { isValid: boolean, message: string }
     */
    static validateEmail(email) {
        if (!email) {
            return { isValid: true, message: '' }; // Email opcional
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                isValid: false,
                message: 'Email inválido.'
            };
        }

        return { isValid: true, message: '' };
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationUtils;
} else {
    window.ValidationUtils = ValidationUtils;
}
