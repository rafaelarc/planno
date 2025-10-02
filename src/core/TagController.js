/**
 * TagController - Gerencia operações CRUD de tags
 * Responsável por toda lógica de negócio relacionada a tags
 */
class TagController {
    constructor(storageService, toastManager, taskController) {
        this.storageService = storageService;
        this.toastManager = toastManager;
        this.taskController = taskController;
        
        // Dados das tags
        this.tags = [];
    }

    /**
     * Inicializa o controlador
     * @param {Array} tags - Lista inicial de tags
     */
    initialize(tags = []) {
        this.tags = tags;
    }

    /**
     * Carrega tags do storage
     */
    loadTags() {
        this.tags = this.storageService.loadTags();
        return this.tags;
    }

    /**
     * Salva tags no storage
     */
    saveTags() {
        this.storageService.saveTags(this.tags);
    }

    /**
     * Obtém todas as tags
     * @returns {Array} Lista de tags
     */
    getAllTags() {
        return this.tags;
    }

    /**
     * Obtém uma tag por ID
     * @param {string} tagId - ID da tag
     * @returns {Object|null} Tag encontrada ou null
     */
    getTagById(tagId) {
        return this.tags.find(tag => tag.id === tagId) || null;
    }

    /**
     * Adiciona uma nova tag
     * @param {Object} tagData - Dados da tag
     * @returns {boolean} Se a tag foi adicionada
     */
    addTag(tagData) {
        if (this.tags.length >= 5) {
            this.toastManager.validationError('Limite de 5 tags atingido. Exclua uma tag existente para criar uma nova.');
            return false;
        }

        const tag = {
            id: IdGenerator.generateTagId(),
            name: tagData.name.trim(),
            color: tagData.color,
            createdAt: new Date().toISOString()
        };
        
        // Validação básica
        if (!tag.name) {
            this.toastManager.validationError('Por favor, insira um nome para a tag.');
            return false;
        }
        
        // Verificar se nome já existe
        const existingTag = this.tags.find(t => 
            t.name.toLowerCase() === tag.name.toLowerCase()
        );
        
        if (existingTag) {
            this.toastManager.validationError('Já existe uma tag com este nome.');
            return false;
        }
        
        this.tags.push(tag);
        this.saveTags();
        
        // Sem feedback visual para criação de tags
        
        return true;
    }

    /**
     * Atualiza uma tag existente
     * @param {string} tagId - ID da tag
     * @param {Object} tagData - Novos dados da tag
     * @returns {boolean} Se a tag foi atualizada
     */
    updateTag(tagId, tagData) {
        const tagIndex = this.tags.findIndex(tag => tag.id === tagId);
        if (tagIndex === -1) {
            console.error('Tag não encontrada:', tagId);
            return false;
        }

        // Verificar se nome já existe (exceto a atual)
        if (tagData.name) {
            const existingTag = this.tags.find(tag => 
                tag.id !== tagId && 
                tag.name.toLowerCase() === tagData.name.toLowerCase()
            );
            
            if (existingTag) {
                this.toastManager.validationError('Já existe uma tag com este nome.');
                return false;
            }
        }

        this.tags[tagIndex] = {
            ...this.tags[tagIndex],
            ...tagData,
            id: tagId // Manter o ID original
        };
        
        this.saveTags();
        
        // Sem feedback visual para atualização de tags
        return true;
    }

    /**
     * Exclui uma tag
     * @param {string} tagId - ID da tag
     * @returns {boolean} Se a tag foi excluída
     */
    deleteTag(tagId) {
        const tasksUsingTag = this.taskController.getAllTasks().filter(task => 
            task.tags && task.tags.includes(tagId)
        );
        
        if (tasksUsingTag.length > 0) {
            this.toastManager.validationError(`Esta tag está sendo usada por ${tasksUsingTag.length} tarefa(s). Não é possível excluí-la.`);
            return false;
        }

        const tagIndex = this.tags.findIndex(tag => tag.id === tagId);
        if (tagIndex === -1) {
            console.error('Tag não encontrada:', tagId);
            return false;
        }

        this.tags.splice(tagIndex, 1);
        this.saveTags();
        
        // Sem feedback visual para exclusão de tags
        
        return true;
    }

    /**
     * Confirma exclusão de tag
     * @param {string} tagId - ID da tag
     * @returns {boolean} Se a tag foi excluída
     */
    deleteTagConfirm(tagId) {
        const tag = this.getTagById(tagId);
        if (!tag) {
            console.error('Tag não encontrada:', tagId);
            return false;
        }

        const taskCount = this.taskController.getTagTaskCount(tagId);
        const message = taskCount > 0 
            ? `A tag "${tag.name}" está sendo usada por ${taskCount} tarefa(s). Deseja realmente excluí-la?`
            : `Deseja realmente excluir a tag "${tag.name}"?`;

        if (confirm(message)) {
            return this.deleteTag(tagId);
        }
        return false;
    }

    /**
     * Obtém contagem de tarefas por tag
     * @param {string} tagId - ID da tag
     * @returns {number} Número de tarefas
     */
    getTagTaskCount(tagId) {
        return this.taskController.getTagTaskCount(tagId);
    }

    /**
     * Verifica se uma tag está sendo usada
     * @param {string} tagId - ID da tag
     * @returns {boolean} Se a tag está sendo usada
     */
    isTagInUse(tagId) {
        return this.taskController.getAllTasks().some(task => 
            task.tags && task.tags.includes(tagId)
        );
    }

    /**
     * Obtém estatísticas das tags
     * @returns {Object} Estatísticas das tags
     */
    getTagStats() {
        const total = this.tags.length;
        const inUse = this.tags.filter(tag => this.isTagInUse(tag.id)).length;
        const unused = total - inUse;
        
        return { total, inUse, unused };
    }

    /**
     * Valida dados de tag
     * @param {Object} tagData - Dados da tag
     * @param {string} excludeId - ID a excluir da validação (para updates)
     * @returns {Object} Resultado da validação
     */
    validateTagData(tagData, excludeId = null) {
        const errors = [];

        if (!tagData.name || !tagData.name.trim()) {
            errors.push('Nome da tag é obrigatório');
        }

        if (tagData.name && tagData.name.trim().length > 30) {
            errors.push('Nome da tag deve ter no máximo 30 caracteres');
        }

        if (tagData.name) {
            const existingTag = this.tags.find(tag => 
                tag.id !== excludeId && 
                tag.name.toLowerCase() === tagData.name.toLowerCase()
            );
            
            if (existingTag) {
                errors.push('Já existe uma tag com este nome');
            }
        }

        if (this.tags.length >= 5 && !excludeId) {
            errors.push('Limite máximo de 5 tags atingido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Obtém tags ordenadas por uso
     * @returns {Array} Tags ordenadas
     */
    getTagsByUsage() {
        return this.tags.sort((a, b) => {
            const countA = this.getTagTaskCount(a.id);
            const countB = this.getTagTaskCount(b.id);
            return countB - countA;
        });
    }

    /**
     * Obtém tags não utilizadas
     * @returns {Array} Tags não utilizadas
     */
    getUnusedTags() {
        return this.tags.filter(tag => !this.isTagInUse(tag.id));
    }

    /**
     * Obtém tags por cor
     * @param {string} color - Cor da tag
     * @returns {Array} Tags com a cor especificada
     */
    getTagsByColor(color) {
        return this.tags.filter(tag => tag.color === color);
    }

    /**
     * Obtém tags mais utilizadas
     * @param {number} limit - Limite de tags a retornar
     * @returns {Array} Tags mais utilizadas
     */
    getMostUsedTags(limit = 5) {
        return this.getTagsByUsage().slice(0, limit);
    }
}

// Exportar para uso global
window.TagController = TagController;
