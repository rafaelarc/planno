/**
 * TaskRenderer - Renderização de tarefas
 * Responsável por renderizar tarefas, categorias e tags na interface
 * 
 * Funcionalidades:
 * - Renderização de tarefas
 * - Renderização de categorias
 * - Renderização de tags
 * - Estados vazios
 * - HTML templates
 */
class TaskRenderer {
    constructor() {
        this.priorityClasses = {
            high: 'priority-high',
            medium: 'priority-medium',
            low: 'priority-low'
        };

        this.priorityNames = {
            high: 'Alta',
            medium: 'Média',
            low: 'Baixa'
        };
    }

    /**
     * Renderiza a lista de tarefas
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @param {string} emptyMessage - Mensagem para lista vazia
     */
    renderTasks(tasks, categories = [], tags = [], emptyMessage = 'Nenhuma tarefa encontrada') {
        const taskList = DOMUtils.getById('taskList');
        if (!taskList) return;

        // Garantir que os parâmetros sejam arrays válidos
        const safeTasks = Array.isArray(tasks) ? tasks : [];
        const safeCategories = Array.isArray(categories) ? categories : [];
        const safeTags = Array.isArray(tags) ? tags : [];

        if (safeTasks.length === 0) {
            taskList.innerHTML = this.getEmptyStateHTML(emptyMessage);
            return;
        }

        taskList.innerHTML = safeTasks.map(task => 
            this.createTaskHTML(task, safeCategories, safeTags)
        ).join('');
    }

    /**
     * Renderiza a lista de categorias
     * @param {Array} categories - Lista de categorias
     * @param {string} activeCategoryId - ID da categoria ativa
     */
    renderCategories(categories, activeCategoryId = null) {
        const categoryList = DOMUtils.getById('categoryList');
        if (!categoryList) return;

        const safeCategories = Array.isArray(categories) ? categories : [];
        categoryList.innerHTML = safeCategories.map(category => 
            this.createCategoryHTML(category, activeCategoryId)
        ).join('');
    }

    /**
     * Renderiza a lista de tags
     * @param {Array} tags - Lista de tags
     * @param {string} activeTagId - ID da tag ativa
     */
    renderTags(tags, activeTagId = null) {
        const tagList = DOMUtils.getById('tagList');
        if (!tagList) return;

        const safeTags = Array.isArray(tags) ? tags : [];
        tagList.innerHTML = safeTags.map(tag => 
            this.createTagHTML(tag, activeTagId)
        ).join('');
    }

    /**
     * Cria HTML para uma tarefa
     * @param {Object} task - Dados da tarefa
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {string} HTML da tarefa
     */
    createTaskHTML(task, categories = [], tags = []) {
        // Garantir que categories e tags sejam arrays válidos
        const safeCategories = Array.isArray(categories) ? categories : [];
        const safeTags = Array.isArray(tags) ? tags : [];
        
        const category = safeCategories.find(cat => cat.id === task.category);
        const categoryColor = category ? category.color : '#6c757d';
        const categoryName = category ? category.name : 'Sem categoria';
        
        // Obter tags da tarefa
        const taskTags = task.tags ? task.tags.map(tagId => 
            safeTags.find(tag => tag.id === tagId)
        ).filter(tag => tag) : [];

        const dueDate = task.dueDate ? DateUtils.formatDateBR(DateUtils.createLocalDate(task.dueDate)) : '';
        const dueTime = task.dueTime || '';

        // Determinar indicadores de urgência
        const isOverdue = DateUtils.isTaskOverdue(task);
        const isDueToday = DateUtils.isTaskDueToday(task);
        const isUpcoming = DateUtils.isTaskUpcoming(task);

        let urgencyClass = '';
        let urgencyIcon = '';
        let urgencyText = '';

        if (isOverdue) {
            urgencyClass = 'overdue';
            urgencyIcon = 'fas fa-exclamation-triangle';
            urgencyText = 'Atrasada';
        } else if (isDueToday) {
            urgencyClass = 'due-today';
            urgencyIcon = 'fas fa-clock';
            urgencyText = 'Hoje';
        } else if (isUpcoming) {
            urgencyClass = 'upcoming';
            urgencyIcon = 'fas fa-calendar-check';
            urgencyText = 'Em breve';
        }

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${urgencyClass} ${task.isRecurring ? 'recurring' : ''}" data-task-id="${task.id}">
                <div class="task-header-content">
                    <div class="task-main">
                        <input type="checkbox" id="task-checkbox-${task.id}" name="task-completed-${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <div class="task-content">
                            <h3 class="task-title">${DOMUtils.escapeHtml(task.title)}</h3>
                            ${task.description ? `<p class="task-description" title="${DOMUtils.escapeHtml(task.description)}">${DOMUtils.escapeHtml(task.description.length > 60 ? task.description.substring(0, 60) + '...' : task.description)}</p>` : ''}
                        </div>
                    </div>
        <div class="task-actions">
            <button class="task-action-btn edit" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            ${task.isRecurring && !task.parentRecurringId ? `
                <button class="task-action-btn delete-series" title="Excluir Série Completa">
                    <i class="fas fa-trash-alt"></i>
                </button>
            ` : ''}
            <button class="task-action-btn delete" title="Excluir">
                <i class="fas fa-trash"></i>
            </button>
        </div>
                </div>
                <div class="task-meta">
                    <div class="task-category">
                        <span class="category-color" style="background-color: ${categoryColor};"></span>
                        <span>${categoryName}</span>
                    </div>
                    <div class="task-priority ${this.priorityClasses[task.priority]}">
                        ${this.priorityNames[task.priority]}
                    </div>
                    ${dueDate ? `
                        <div class="task-date">
                            <i class="fas fa-calendar"></i>
                            <span>${dueDate}${dueTime ? ` às ${dueTime}` : ''}</span>
                        </div>
                    ` : ''}
                    ${urgencyClass ? `
                        <div class="task-urgency ${urgencyClass}">
                            <i class="${urgencyIcon}"></i>
                            <span>${urgencyText}</span>
                        </div>
                    ` : ''}
                    ${task.isRecurring ? `
                        <div class="task-recurrence">
                            <i class="fas fa-sync-alt"></i>
                            <span>${this.getRecurrenceLabel(task.recurrenceType)}</span>
                        </div>
                    ` : ''}
                    ${taskTags.length > 0 ? `
                        <div class="task-tags">
                            ${taskTags.map(tag => `
                                <span class="task-tag" style="background-color: ${tag.color};">
                                    ${DOMUtils.escapeHtml(tag.name)}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Cria HTML para uma categoria
     * @param {Object} category - Dados da categoria
     * @param {string} activeCategoryId - ID da categoria ativa
     * @returns {string} HTML da categoria
     */
    createCategoryHTML(category, activeCategoryId = null) {
        const usageCount = this.getCategoryUsageCount(category.id);
        const isActive = activeCategoryId === category.id;
        
        return `
            <div class="category-item ${isActive ? 'active' : ''}" 
                 data-category-id="${category.id}" 
                 data-category-name="${DOMUtils.escapeHtml(category.name)}"
                 onclick="app.filterByCategory('${category.id}')">
                <span class="category-color" style="background-color: ${category.color};"></span>
                <span>${DOMUtils.escapeHtml(category.name)}</span>
                ${usageCount > 0 ? `<span class="category-usage">(${usageCount})</span>` : ''}
            </div>
        `;
    }

    /**
     * Cria HTML para uma tag
     * @param {Object} tag - Dados da tag
     * @param {string} activeTagId - ID da tag ativa
     * @returns {string} HTML da tag
     */
    createTagHTML(tag, activeTagId = null) {
        const usageCount = this.getTagUsageCount(tag.id);
        const isActive = activeTagId === tag.id;
        
        return `
            <div class="tag-item ${isActive ? 'active' : ''}" 
                 data-tag-id="${tag.id}" 
                 data-tag-name="${DOMUtils.escapeHtml(tag.name)}"
                 onclick="app.filterByTag('${tag.id}')">
                <span class="tag-color" style="background-color: ${tag.color};"></span>
                <span>${DOMUtils.escapeHtml(tag.name)}</span>
                ${usageCount > 0 ? `<span class="tag-usage">(${usageCount})</span>` : ''}
            </div>
        `;
    }

    /**
     * Cria HTML para estado vazio
     * @param {string} message - Mensagem para exibir
     * @param {string} description - Descrição adicional
     * @returns {string} HTML do estado vazio
     */
    getEmptyStateHTML(message = 'Nenhuma tarefa encontrada', description = 'Comece adicionando uma nova tarefa!') {
        return `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>${message}</h3>
                <p>${description}</p>
            </div>
        `;
    }

    /**
     * Obtém o rótulo de recorrência
     * @param {string} recurrenceType - Tipo de recorrência
     * @returns {string} Rótulo da recorrência
     */
    getRecurrenceLabel(recurrenceType) {
        const labels = {
            daily: 'Diária',
            weekly: 'Semanal',
            monthly: 'Mensal',
            yearly: 'Anual'
        };
        return labels[recurrenceType] || 'Recorrente';
    }

    /**
     * Obtém o número de tarefas usando uma categoria
     * @param {string} categoryId - ID da categoria
     * @returns {number} Número de tarefas
     */
    getCategoryUsageCount(categoryId) {
        if (!this.categoryUsageCounts) {
            return 0;
        }
        return this.categoryUsageCounts.get(categoryId) || 0;
    }

    /**
     * Obtém o número de tarefas usando uma tag
     * @param {string} tagId - ID da tag
     * @returns {number} Número de tarefas
     */
    getTagUsageCount(tagId) {
        if (!this.tagUsageCounts) {
            return 0;
        }
        return this.tagUsageCounts.get(tagId) || 0;
    }

    /**
     * Atualiza o contador de uso de categorias
     * @param {Array} tasks - Lista de tarefas
     */
    updateCategoryUsageCounts(tasks) {
        this.categoryUsageCounts = new Map();
        tasks.forEach(task => {
            if (!task.completed) {
                const count = this.categoryUsageCounts.get(task.category) || 0;
                this.categoryUsageCounts.set(task.category, count + 1);
            }
        });
    }

    /**
     * Atualiza o contador de uso de tags
     * @param {Array} tasks - Lista de tarefas
     */
    updateTagUsageCounts(tasks) {
        this.tagUsageCounts = new Map();
        tasks.forEach(task => {
            if (!task.completed && task.tags) {
                task.tags.forEach(tagId => {
                    const count = this.tagUsageCounts.get(tagId) || 0;
                    this.tagUsageCounts.set(tagId, count + 1);
                });
            }
        });
    }

    /**
     * Renderiza estatísticas
     * @param {Object} stats - Estatísticas para renderizar
     */
    renderStats(stats) {
        DOMUtils.setText(DOMUtils.getById('totalTasks'), stats.total || 0);
        DOMUtils.setText(DOMUtils.getById('completedTasks'), stats.completed || 0);
        DOMUtils.setText(DOMUtils.getById('pendingTasks'), stats.pending || 0);
    }

    /**
     * Atualiza o título da seção
     * @param {string} title - Título da seção
     */
    updateSectionTitle(title) {
        DOMUtils.setText(DOMUtils.getById('taskSectionTitle'), title);
    }

    /**
     * Mostra/oculta botão de limpar filtros
     * @param {boolean} show - Se deve mostrar o botão
     */
    toggleClearFiltersButton(show) {
        const activeFiltersDiv = DOMUtils.getById('activeFilters');
        if (show) {
            DOMUtils.show(activeFiltersDiv, 'flex');
        } else {
            DOMUtils.hide(activeFiltersDiv);
        }
    }

    /**
     * Atualiza botões de filtro ativos
     * @param {string} activeFilter - Filtro ativo
     */
    updateActiveFilterButtons(activeFilter) {
        // Limpar todos os botões
        DOMUtils.querySelectorAll('.filter-btn').forEach(btn => {
            DOMUtils.removeClass(btn, 'active');
        });
        
        // Ativar botão correspondente
        const activeButton = DOMUtils.querySelector(`[data-filter="${activeFilter}"]`);
        if (activeButton) {
            DOMUtils.addClass(activeButton, 'active');
        }
    }

    /**
     * Renderiza informações de recorrência
     * @param {Object} task - Tarefa recorrente
     * @returns {string} HTML com informações de recorrência
     */
    renderRecurrenceInfo(task) {
        if (!task.isRecurring) return '';

        const info = this.getRecurrenceInfo(task);
        return `
            <div class="recurrence-info">
                <i class="fas fa-sync-alt"></i>
                <span>${info.label}</span>
            </div>
        `;
    }

    /**
     * Obtém informações de recorrência
     * @param {Object} task - Tarefa
     * @returns {Object} Informações de recorrência
     */
    getRecurrenceInfo(task) {
        const labels = {
            daily: 'Diária',
            weekly: 'Semanal',
            monthly: 'Mensal',
            yearly: 'Anual'
        };

        return {
            type: task.recurrenceType,
            label: labels[task.recurrenceType] || 'Recorrente',
            data: task.recurrenceData
        };
    }

    /**
     * Destrói o renderizador
     */
    destroy() {
        this.categoryUsageCounts = null;
        this.tagUsageCounts = null;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskRenderer;
} else {
    window.TaskRenderer = TaskRenderer;
}
