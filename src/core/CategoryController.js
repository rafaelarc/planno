/**
 * CategoryController - Gerencia operações CRUD de categorias
 * Responsável por toda lógica de negócio relacionada a categorias
 */
class CategoryController {
    constructor(storageService, toastManager, taskController) {
        this.storageService = storageService;
        this.toastManager = toastManager;
        this.taskController = taskController;
        
        // Dados das categorias
        this.categories = [];
    }

    /**
     * Inicializa o controlador
     * @param {Array} categories - Lista inicial de categorias
     */
    initialize(categories = []) {
        this.categories = categories;
    }

    /**
     * Carrega categorias do storage
     */
    loadCategories() {
        this.categories = this.storageService.loadCategories();
        return this.categories;
    }

    /**
     * Salva categorias no storage
     */
    saveCategories() {
        this.storageService.saveCategories(this.categories);
    }

    /**
     * Obtém todas as categorias
     * @returns {Array} Lista de categorias
     */
    getAllCategories() {
        return this.categories;
    }

    /**
     * Obtém uma categoria por ID
     * @param {string} categoryId - ID da categoria
     * @returns {Object|null} Categoria encontrada ou null
     */
    getCategoryById(categoryId) {
        return this.categories.find(cat => cat.id === categoryId) || null;
    }

    /**
     * Adiciona uma nova categoria
     * @param {Object} categoryData - Dados da categoria
     * @returns {boolean} Se a categoria foi adicionada
     */
    addCategory(categoryData) {
        if (this.categories.length >= 5) {
            this.toastManager.validationError('Limite de 5 categorias atingido. Exclua uma categoria existente para criar uma nova.');
            return false;
        }

        const category = {
            id: IdGenerator.generateCategoryId(),
            name: categoryData.name.trim(),
            color: categoryData.color,
            createdAt: new Date().toISOString()
        };
        
        // Validação básica
        if (!category.name) {
            this.toastManager.validationError('Por favor, insira um nome para a categoria.');
            return false;
        }
        
        // Verificar se nome já existe
        const existingCategory = this.categories.find(cat => 
            cat.name.toLowerCase() === category.name.toLowerCase()
        );
        
        if (existingCategory) {
            this.toastManager.validationError('Já existe uma categoria com este nome.');
            return false;
        }
        
        this.categories.push(category);
        this.saveCategories();
        
        // Sem feedback visual para criação de categorias
        
        return true;
    }

    /**
     * Atualiza uma categoria existente
     * @param {string} categoryId - ID da categoria
     * @param {Object} categoryData - Novos dados da categoria
     * @returns {boolean} Se a categoria foi atualizada
     */
    updateCategory(categoryId, categoryData) {
        const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex === -1) {
            console.error('Categoria não encontrada:', categoryId);
            return false;
        }

        // Verificar se nome já existe (exceto a atual)
        if (categoryData.name) {
            const existingCategory = this.categories.find(cat => 
                cat.id !== categoryId && 
                cat.name.toLowerCase() === categoryData.name.toLowerCase()
            );
            
            if (existingCategory) {
                this.toastManager.validationError('Já existe uma categoria com este nome.');
                return false;
            }
        }

        this.categories[categoryIndex] = {
            ...this.categories[categoryIndex],
            ...categoryData,
            id: categoryId // Manter o ID original
        };
        
        this.saveCategories();
        
        // Sem feedback visual para atualização de categorias
        return true;
    }

    /**
     * Exclui uma categoria
     * @param {string} categoryId - ID da categoria
     * @returns {boolean} Se a categoria foi excluída
     */
    deleteCategory(categoryId) {
        const tasksUsingCategory = this.taskController.getAllTasks().filter(task => task.category === categoryId);
        if (tasksUsingCategory.length > 0) {
            this.toastManager.validationError(`Esta categoria está sendo usada por ${tasksUsingCategory.length} tarefa(s). Não é possível excluí-la.`);
            return false;
        }

        const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex === -1) {
            console.error('Categoria não encontrada:', categoryId);
            return false;
        }

        this.categories.splice(categoryIndex, 1);
        this.saveCategories();
        
        // Sem feedback visual para exclusão de categorias
        
        return true;
    }

    /**
     * Confirma exclusão de categoria
     * @param {string} categoryId - ID da categoria
     * @returns {boolean} Se a categoria foi excluída
     */
    deleteCategoryConfirm(categoryId) {
        const category = this.getCategoryById(categoryId);
        if (!category) {
            console.error('Categoria não encontrada:', categoryId);
            return false;
        }

        const taskCount = this.taskController.getCategoryTaskCount(categoryId);
        const message = taskCount > 0 
            ? `A categoria "${category.name}" está sendo usada por ${taskCount} tarefa(s). Deseja realmente excluí-la?`
            : `Deseja realmente excluir a categoria "${category.name}"?`;

        if (confirm(message)) {
            return this.deleteCategory(categoryId);
        }
        return false;
    }

    /**
     * Obtém contagem de tarefas por categoria
     * @param {string} categoryId - ID da categoria
     * @returns {number} Número de tarefas
     */
    getCategoryTaskCount(categoryId) {
        return this.taskController.getCategoryTaskCount(categoryId);
    }

    /**
     * Verifica se uma categoria está sendo usada
     * @param {string} categoryId - ID da categoria
     * @returns {boolean} Se a categoria está sendo usada
     */
    isCategoryInUse(categoryId) {
        return this.taskController.getAllTasks().some(task => task.category === categoryId);
    }

    /**
     * Obtém estatísticas das categorias
     * @returns {Object} Estatísticas das categorias
     */
    getCategoryStats() {
        const total = this.categories.length;
        const inUse = this.categories.filter(cat => this.isCategoryInUse(cat.id)).length;
        const unused = total - inUse;
        
        return { total, inUse, unused };
    }

    /**
     * Valida dados de categoria
     * @param {Object} categoryData - Dados da categoria
     * @param {string} excludeId - ID a excluir da validação (para updates)
     * @returns {Object} Resultado da validação
     */
    validateCategoryData(categoryData, excludeId = null) {
        const errors = [];

        if (!categoryData.name || !categoryData.name.trim()) {
            errors.push('Nome da categoria é obrigatório');
        }

        if (categoryData.name && categoryData.name.trim().length > 50) {
            errors.push('Nome da categoria deve ter no máximo 50 caracteres');
        }

        if (categoryData.name) {
            const existingCategory = this.categories.find(cat => 
                cat.id !== excludeId && 
                cat.name.toLowerCase() === categoryData.name.toLowerCase()
            );
            
            if (existingCategory) {
                errors.push('Já existe uma categoria com este nome');
            }
        }

        if (this.categories.length >= 5 && !excludeId) {
            errors.push('Limite máximo de 5 categorias atingido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Obtém categorias ordenadas por uso
     * @returns {Array} Categorias ordenadas
     */
    getCategoriesByUsage() {
        return this.categories.sort((a, b) => {
            const countA = this.getCategoryTaskCount(a.id);
            const countB = this.getCategoryTaskCount(b.id);
            return countB - countA;
        });
    }

    /**
     * Obtém categorias não utilizadas
     * @returns {Array} Categorias não utilizadas
     */
    getUnusedCategories() {
        return this.categories.filter(cat => !this.isCategoryInUse(cat.id));
    }
}

// Exportar para uso global
window.CategoryController = CategoryController;
