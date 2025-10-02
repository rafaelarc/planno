/**
 * Task - Modelo de tarefa
 * Representa uma tarefa no sistema
 * 
 * Propriedades:
 * - id: Identificador único
 * - title: Título da tarefa
 * - description: Descrição da tarefa
 * - category: ID da categoria
 * - tags: Array de IDs das tags
 * - priority: Prioridade (low, medium, high)
 * - dueDate: Data de vencimento (YYYY-MM-DD)
 * - dueTime: Horário de vencimento (HH:MM)
 * - completed: Se a tarefa está concluída
 * - createdAt: Data de criação
 * - completedAt: Data de conclusão
 * - isRecurring: Se é uma tarefa recorrente
 * - recurrenceType: Tipo de recorrência (daily, weekly, monthly, yearly)
 * - recurrenceData: Dados específicos da recorrência
 * - parentRecurringId: ID da tarefa pai (para tarefas geradas automaticamente)
 */
class Task {
    constructor(data = {}) {
        this.id = data.id || IdGenerator.generateTaskId();
        this.title = data.title || '';
        this.description = data.description || '';
        this.category = data.category || 'personal';
        this.tags = data.tags || [];
        this.priority = data.priority || 'medium';
        this.dueDate = data.dueDate || '';
        this.dueTime = data.dueTime || '';
        this.completed = data.completed || false;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.completedAt = data.completedAt || null;
        this.isRecurring = data.isRecurring || false;
        this.recurrenceType = data.recurrenceType || null;
        this.recurrenceData = data.recurrenceData || null;
        this.parentRecurringId = data.parentRecurringId || null;
    }


    /**
     * Marca a tarefa como concluída
     * @param {boolean} completed - Se deve marcar como concluída
     */
    markAsCompleted(completed = true) {
        this.completed = completed;
        if (completed && !this.completedAt) {
            this.completedAt = new Date().toISOString();
        } else if (!completed) {
            this.completedAt = null;
        }
    }

    /**
     * Alterna o status de conclusão da tarefa
     */
    toggleCompleted() {
        this.markAsCompleted(!this.completed);
    }

    /**
     * Adiciona uma tag à tarefa
     * @param {string} tagId - ID da tag
     * @returns {boolean} Se a tag foi adicionada
     */
    addTag(tagId) {
        if (!this.tags.includes(tagId) && this.tags.length < 3) {
            this.tags.push(tagId);
            return true;
        }
        return false;
    }

    /**
     * Remove uma tag da tarefa
     * @param {string} tagId - ID da tag
     * @returns {boolean} Se a tag foi removida
     */
    removeTag(tagId) {
        const index = this.tags.indexOf(tagId);
        if (index > -1) {
            this.tags.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Verifica se a tarefa tem uma tag específica
     * @param {string} tagId - ID da tag
     * @returns {boolean}
     */
    hasTag(tagId) {
        return this.tags.includes(tagId);
    }

    /**
     * Define a categoria da tarefa
     * @param {string} categoryId - ID da categoria
     */
    setCategory(categoryId) {
        this.category = categoryId;
    }

    /**
     * Define a prioridade da tarefa
     * @param {string} priority - Prioridade (low, medium, high)
     */
    setPriority(priority) {
        if (['low', 'medium', 'high'].includes(priority)) {
            this.priority = priority;
        }
    }

    /**
     * Define a data de vencimento
     * @param {string} dueDate - Data no formato YYYY-MM-DD
     */
    setDueDate(dueDate) {
        this.dueDate = dueDate;
    }

    /**
     * Define o horário de vencimento
     * @param {string} dueTime - Horário no formato HH:MM
     */
    setDueTime(dueTime) {
        this.dueTime = dueTime;
    }

    /**
     * Configura a recorrência da tarefa
     * @param {string} type - Tipo de recorrência
     * @param {Object} data - Dados específicos da recorrência
     */
    setRecurrence(type, data = null) {
        this.isRecurring = true;
        this.recurrenceType = type;
        this.recurrenceData = data;
    }

    /**
     * Remove a recorrência da tarefa
     */
    removeRecurrence() {
        this.isRecurring = false;
        this.recurrenceType = null;
        this.recurrenceData = null;
    }

    /**
     * Atualiza os dados da tarefa
     * @param {Object} data - Dados para atualizar
     */
    update(data) {
        Object.keys(data).forEach(key => {
            if (key in this && key !== 'id' && key !== 'createdAt') {
                this[key] = data[key];
            }
        });
    }

    /**
     * Cria uma cópia da tarefa
     * @returns {Task} Nova instância da tarefa
     */
    clone() {
        return new Task({
            id: this.id,
            title: this.title,
            description: this.description,
            category: this.category,
            tags: [...this.tags],
            priority: this.priority,
            dueDate: this.dueDate,
            dueTime: this.dueTime,
            completed: this.completed,
            createdAt: this.createdAt,
            completedAt: this.completedAt,
            isRecurring: this.isRecurring,
            recurrenceType: this.recurrenceType,
            recurrenceData: this.recurrenceData ? { ...this.recurrenceData } : null,
            parentRecurringId: this.parentRecurringId
        });
    }

    /**
     * Cria uma nova tarefa baseada nesta (para recorrência)
     * @param {string} newId - Novo ID para a tarefa
     * @param {string} newDueDate - Nova data de vencimento
     * @returns {Task} Nova tarefa
     */
    createRecurringInstance(newId, newDueDate) {
        const newTask = this.clone();
        newTask.id = newId;
        newTask.dueDate = newDueDate;
        newTask.completed = false;
        newTask.createdAt = new Date().toISOString();
        newTask.completedAt = null;
        newTask.parentRecurringId = this.id;
        return newTask;
    }

    /**
     * Converte a tarefa para objeto JSON
     * @returns {Object} Objeto JSON
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            category: this.category,
            tags: this.tags,
            priority: this.priority,
            dueDate: this.dueDate,
            dueTime: this.dueTime,
            completed: this.completed,
            createdAt: this.createdAt,
            completedAt: this.completedAt,
            isRecurring: this.isRecurring,
            recurrenceType: this.recurrenceType,
            recurrenceData: this.recurrenceData,
            parentRecurringId: this.parentRecurringId
        };
    }

    /**
     * Cria uma tarefa a partir de um objeto JSON
     * @param {Object} json - Objeto JSON
     * @returns {Task} Nova instância da tarefa
     */
    static fromJSON(json) {
        return new Task(json);
    }

    /**
     * Valida os dados da tarefa
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    validate() {
        const errors = [];

        if (!this.title || this.title.trim() === '') {
            errors.push('Título é obrigatório');
        }

        if (this.title && this.title.length > 100) {
            errors.push('Título deve ter no máximo 100 caracteres');
        }

        if (this.description && this.description.length > 500) {
            errors.push('Descrição deve ter no máximo 500 caracteres');
        }

        if (this.tags && this.tags.length > 3) {
            errors.push('Máximo de 3 tags por tarefa');
        }

        if (!['low', 'medium', 'high'].includes(this.priority)) {
            errors.push('Prioridade inválida');
        }

        if (this.isRecurring && !this.dueDate) {
            errors.push('Tarefas recorrentes precisam de data de vencimento');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Obtém informações sobre a recorrência
     * @returns {Object} Informações da recorrência
     */
    getRecurrenceInfo() {
        if (!this.isRecurring) {
            return { type: 'none', label: 'Não recorrente' };
        }

        const labels = {
            daily: 'Diária',
            weekly: 'Semanal',
            monthly: 'Mensal',
            yearly: 'Anual'
        };

        return {
            type: this.recurrenceType,
            label: labels[this.recurrenceType] || 'Recorrente',
            data: this.recurrenceData
        };
    }

    /**
     * Verifica se a tarefa está vencida
     * @returns {boolean}
     */
    isOverdue() {
        if (!this.dueDate || this.completed) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(this.dueDate);
        
        return dueDate < today;
    }

    /**
     * Verifica se a tarefa vence hoje
     * @returns {boolean}
     */
    isDueToday() {
        if (!this.dueDate) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(this.dueDate);
        
        return today.toDateString() === dueDate.toDateString();
    }

    /**
     * Verifica se a tarefa está próxima (próximos 7 dias)
     * @returns {boolean}
     */
    isUpcoming() {
        if (!this.dueDate) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(this.dueDate);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        return dueDate > today && dueDate <= nextWeek;
    }

    /**
     * Obtém a idade da tarefa em dias
     * @returns {number} Idade em dias
     */
    getAgeInDays() {
        const created = new Date(this.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Obtém o tempo até o vencimento em dias
     * @returns {number|null} Dias até vencimento ou null se não tiver data
     */
    getDaysUntilDue() {
        if (!this.dueDate) return null;
        
        const due = new Date(this.dueDate);
        const now = new Date();
        const diffTime = due - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Task;
} else {
    window.Task = Task;
}
