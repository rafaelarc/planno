/**
 * TaskController - Gerencia operações CRUD de tarefas
 * Responsável por toda lógica de negócio relacionada a tarefas
 */
class TaskController {
    constructor(storageService, taskRenderer, toastManager) {
        this.storageService = storageService;
        this.taskRenderer = taskRenderer;
        this.toastManager = toastManager;
        
        // Dados das tarefas
        this.tasks = [];
        
        // Cache para updates incrementais
        this.lastRenderedTasks = new Map();
    }

    /**
     * Inicializa o controlador
     * @param {Array} tasks - Lista inicial de tarefas
     */
    initialize(tasks = []) {
        this.tasks = tasks;
        this.lastRenderedTasks.clear();
    }

    /**
     * Carrega tarefas do storage
     */
    loadTasks() {
        this.tasks = this.storageService.loadTasks();
        return this.tasks;
    }

    /**
     * Salva tarefas no storage
     */
    saveTasks() {
        this.storageService.saveTasks(this.tasks);
    }

    /**
     * Obtém todas as tarefas
     * @returns {Array} Lista de tarefas
     */
    getAllTasks() {
        return this.tasks;
    }

    /**
     * Obtém uma tarefa por ID
     * @param {string} taskId - ID da tarefa
     * @returns {Object|null} Tarefa encontrada ou null
     */
    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId) || null;
    }

    /**
     * Adiciona uma nova tarefa
     * @param {Object} taskData - Dados da tarefa
     * @param {boolean} silent - Se true, não exibe feedback visual
     * @returns {boolean} Se a tarefa foi adicionada com sucesso
     */
    addTask(taskData, silent = false) {
        const task = {
            id: IdGenerator.generateTaskId(),
            title: taskData.title || '',
            description: taskData.description || '',
            category: taskData.category || 'personal',
            tags: taskData.tags || [],
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || '',
            dueTime: taskData.dueTime || '',
            completed: taskData.completed || false,
            createdAt: new Date().toISOString(),
            isRecurring: taskData.isRecurring || false,
            recurrenceType: taskData.recurrenceType || null,
            recurrenceData: taskData.recurrenceData || null,
            parentRecurringId: taskData.parentRecurringId || null
        };
        
        // Validação básica
        if (!task.title.trim()) {
            this.toastManager.validationError('Por favor, insira um título para a tarefa.');
            return false;
        }
        
        this.tasks.push(task);
        this.saveTasks();
        
        // Feedback visual apenas se não for silencioso
        if (!silent) {
            this.toastManager.taskSaved();
        }
        return true;
    }

    /**
     * Atualiza uma tarefa existente
     * @param {string} taskId - ID da tarefa
     * @param {Object} taskData - Novos dados da tarefa
     * @returns {boolean} Se a tarefa foi atualizada com sucesso
     */
    updateTask(taskId, taskData) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            console.error('Tarefa não encontrada:', taskId);
            return false;
        }

        // Atualizar tarefa existente
        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            ...taskData,
            id: taskId // Manter o ID original
        };

        this.saveTasks();
        
        // Feedback visual
        this.toastManager.taskUpdated();
        return true;
    }

    /**
     * Exclui uma tarefa
     * @param {string} taskId - ID da tarefa
     * @returns {boolean} Se a tarefa foi excluída com sucesso
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            console.error('Tarefa não encontrada:', taskId);
            return false;
        }

        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
        
        // Feedback visual
        this.toastManager.taskDeleted();
        return true;
    }

    /**
     * Confirma e remove uma tarefa
     * @param {string} taskId - ID da tarefa
     * @returns {boolean} Se a tarefa foi excluída
     */
    deleteTaskConfirm(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            console.error('Tarefa não encontrada:', taskId);
            return false;
        }

        const taskTitle = task.title;
        if (confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}"?\n\nEsta ação não pode ser desfeita.`)) {
            return this.deleteTask(taskId);
        }
        return false;
    }

    /**
     * Alterna o status de conclusão de uma tarefa
     * @param {string} taskId - ID da tarefa
     * @returns {boolean} Se a tarefa foi alterada com sucesso
     */
    toggleTaskComplete(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            console.error('Tarefa não encontrada:', taskId);
            return false;
        }

        const task = this.tasks[taskIndex];
        const wasCompleted = task.completed;
        
        // Alternar status de conclusão
        task.completed = !task.completed;
        
        this.saveTasks();
        return { success: true, wasCompleted, isNowCompleted: task.completed };
    }

    /**
     * Verifica e gera tarefas recorrentes
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     */
    checkAndGenerateRecurringTasks(categories = [], tags = []) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.tasks.forEach(task => {
            if (task.isRecurring && !task.parentRecurringId) {
                const taskDate = DateUtils.createLocalDate(task.dueDate);
                
                if ((task.completed && taskDate <= today) || (!task.completed && taskDate < today)) {
                    const hasNextOccurrence = this.tasks.some(t => 
                        t.parentRecurringId === task.id && 
                        DateUtils.createLocalDate(t.dueDate) > today
                    );
                    
                    if (!hasNextOccurrence) {
                        this.generateNextRecurringTask(task, categories, tags);
                    }
                }
            }
        });
    }

    /**
     * Gera a próxima tarefa recorrente
     * @param {Object} parentTask - Tarefa pai
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     */
    generateNextRecurringTask(parentTask, categories = [], tags = []) {
        const nextDate = DateUtils.calculateNextRecurrenceDate(parentTask);
        if (!nextDate) return;

        const nextTask = {
            ...parentTask,
            id: IdGenerator.generateTaskId(),
            dueDate: DateUtils.formatDateISO(nextDate),
            completed: false,
            createdAt: new Date().toISOString(),
            parentRecurringId: parentTask.id
        };

        this.tasks.push(nextTask);
        this.saveTasks();
    }

    /**
     * Gera tarefa recorrente após completar uma tarefa
     * @param {Object} completedTask - Tarefa completada
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     */
    generateRecurringAfterComplete(completedTask, categories = [], tags = []) {
        if (completedTask.isRecurring) {
            // Para tarefas filhas, usar a tarefa pai como template mas com a data da tarefa atual
            if (completedTask.parentRecurringId) {
                const parentTask = this.getTaskById(completedTask.parentRecurringId);
                if (parentTask) {
                    // Criar uma cópia da tarefa pai com a data da tarefa atual
                    const taskForCalculation = {
                        ...parentTask,
                        dueDate: completedTask.dueDate
                    };
                    this.generateNextRecurringTask(taskForCalculation, categories, tags);
                }
            } else {
                // Se é uma tarefa pai, gerar próxima ocorrência diretamente
                this.generateNextRecurringTask(completedTask, categories, tags);
            }
        }
    }

    /**
     * Obtém estatísticas das tarefas
     * @returns {Object} Estatísticas das tarefas
     */
    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        return { total, completed, pending };
    }

    /**
     * Obtém contagem de tarefas por categoria
     * @param {string} categoryId - ID da categoria
     * @returns {number} Número de tarefas
     */
    getCategoryTaskCount(categoryId) {
        return this.tasks.filter(task => task.category === categoryId).length;
    }

    /**
     * Obtém contagem de tarefas por tag
     * @param {string} tagId - ID da tag
     * @returns {number} Número de tarefas
     */
    getTagTaskCount(tagId) {
        return this.tasks.filter(task => task.tags && task.tags.includes(tagId)).length;
    }

    /**
     * Verifica se uma tarefa foi modificada (para updates incrementais)
     * @param {Object} currentTask - Tarefa atual
     * @param {Object} lastTask - Tarefa anterior
     * @returns {boolean}
     */
    hasTaskChanged(currentTask, lastTask) {
        const relevantProps = ['title', 'description', 'completed', 'priority', 'category', 'tags', 'dueDate', 'dueTime', 'isRecurring'];
        
        return relevantProps.some(prop => {
            if (prop === 'tags') {
                const currentTags = currentTask[prop] || [];
                const lastTags = lastTask[prop] || [];
                return JSON.stringify(currentTags.sort()) !== JSON.stringify(lastTags.sort());
            }
            return currentTask[prop] !== lastTask[prop];
        });
    }

    /**
     * Limpa o cache de renderização
     */
    clearRenderCache() {
        this.lastRenderedTasks.clear();
    }

    /**
     * Atualiza o cache de renderização
     * @param {Map} newCache - Novo cache
     */
    updateRenderCache(newCache) {
        this.lastRenderedTasks = newCache;
    }

    /**
     * Obtém o cache de renderização
     * @returns {Map} Cache atual
     */
    getRenderCache() {
        return this.lastRenderedTasks;
    }
}

// Exportar para uso global
window.TaskController = TaskController;
