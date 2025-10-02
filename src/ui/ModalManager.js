/**
 * ModalManager - Gerenciamento de modais
 * Responsável por gerenciar modais da aplicação
 * 
 * Funcionalidades:
 * - Abertura e fechamento de modais
 * - Gerenciamento de formulários
 * - Validação de dados
 * - População de formulários
 * - Event listeners de modais
 */
class ModalManager {
    constructor() {
        this.editingTaskId = null;
        this.editingCategoryId = null;
        this.editingTagId = null;
        this.currentModal = null;
    }

    /**
     * Abre o modal de tarefa
     * @param {string} taskId - ID da tarefa (opcional para nova tarefa)
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     */
    openTaskModal(taskId = null, categories = [], tags = []) {
        const modal = DOMUtils.getById('taskModal');
        const form = DOMUtils.getById('taskForm');
        const title = DOMUtils.getById('modalTitle');
        
        this.editingTaskId = taskId;
        this.currentModal = 'task';
        
        // Atualizar selects de categoria e tags
        this.updateCategorySelects(categories);
        this.updateTagSelects(tags);
        
        if (taskId) {
            const task = this.getTaskById(taskId);
            if (task) {
                DOMUtils.setText(title, 'Editar Tarefa');
                this.populateTaskForm(task);
            }
        } else {
            DOMUtils.setText(title, 'Nova Tarefa');
            form.reset();
        }
        
        DOMUtils.addClass(modal, 'show');
        DOMUtils.focus(DOMUtils.getById('taskTitle'));
    }

    /**
     * Fecha o modal de tarefa
     */
    closeTaskModal() {
        const modal = DOMUtils.getById('taskModal');
        DOMUtils.removeClass(modal, 'show');
        this.editingTaskId = null;
        this.currentModal = null;
        
        // Resetar formulário
        const form = DOMUtils.getById('taskForm');
        form.reset();
        
        // Resetar opções de recorrência
        DOMUtils.hide(DOMUtils.getById('recurrenceOptions'));
        DOMUtils.hide(DOMUtils.getById('weeklyOptions'));
        
        // Resetar checkboxes visuais
        DOMUtils.querySelectorAll('.weekday-label').forEach(label => {
            DOMUtils.removeClass(label, 'checked');
        });
        
        // Resetar checkboxes de tags
        DOMUtils.querySelectorAll('.tag-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    /**
     * Abre o modal de categoria
     */
    openCategoryModal() {
        const modal = DOMUtils.getById('categoryModal');
        DOMUtils.addClass(modal, 'show');
        this.currentModal = 'category';
        this.renderCategoryManagement();
        DOMUtils.focus(DOMUtils.getById('categoryName'));
    }

    /**
     * Fecha o modal de categoria
     */
    closeCategoryModal() {
        const modal = DOMUtils.getById('categoryModal');
        DOMUtils.removeClass(modal, 'show');
        this.editingCategoryId = null;
        this.currentModal = null;
    }

    /**
     * Abre o modal de tag
     */
    openTagModal() {
        const modal = DOMUtils.getById('tagModal');
        DOMUtils.addClass(modal, 'show');
        this.currentModal = 'tag';
        this.renderTagManagement();
        DOMUtils.focus(DOMUtils.getById('tagName'));
    }

    /**
     * Fecha o modal de tag
     */
    closeTagModal() {
        const modal = DOMUtils.getById('tagModal');
        DOMUtils.removeClass(modal, 'show');
        this.editingTagId = null;
        this.currentModal = null;
    }

    /**
     * Popula o formulário de tarefa
     * @param {Object} task - Dados da tarefa
     */
    populateTaskForm(task) {
        DOMUtils.setValue(DOMUtils.getById('taskTitle'), task.title);
        DOMUtils.setValue(DOMUtils.getById('taskDescription'), task.description);
        DOMUtils.setValue(DOMUtils.getById('taskCategory'), task.category);
        DOMUtils.setValue(DOMUtils.getById('taskPriority'), task.priority);
        DOMUtils.setValue(DOMUtils.getById('taskDate'), task.dueDate);
        DOMUtils.setValue(DOMUtils.getById('taskTime'), task.dueTime);
        
        // Popular tags
        if (task.tags && task.tags.length > 0) {
            task.tags.forEach(tagId => {
                const tagCheckbox = DOMUtils.querySelector(`input[type="checkbox"][value="${tagId}"]`);
                if (tagCheckbox) {
                    tagCheckbox.checked = true;
                }
            });
        }
        
        // Popular recorrência
        if (task.isRecurring) {
            DOMUtils.getById('isRecurring').checked = true;
            DOMUtils.setValue(DOMUtils.getById('recurrenceType'), task.recurrenceType);
            DOMUtils.show(DOMUtils.getById('recurrenceOptions'));
            
            if (task.recurrenceType === 'weekly' && task.recurrenceData?.weekdays) {
                DOMUtils.show(DOMUtils.getById('weeklyOptions'));
                task.recurrenceData.weekdays.forEach(weekday => {
                    const checkbox = DOMUtils.querySelector(`input[value="${weekday}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        DOMUtils.addClass(checkbox.closest('.weekday-label'), 'checked');
                    }
                });
            }
        }
    }

    /**
     * Atualiza seleções de categoria
     * @param {Array} categories - Lista de categorias
     */
    updateCategorySelects(categories = []) {
        const categorySelect = document.getElementById('taskCategory');
        if (categorySelect) {
            categorySelect.innerHTML = categories.map(category => 
                `<option value="${category.id}">${DOMUtils.escapeHtml(category.name)}</option>`
            ).join('');
        }
    }

    /**
     * Atualiza seleções de tags
     * @param {Array} tags - Lista de tags
     */
    updateTagSelects(tags = []) {
        const tagContainer = document.getElementById('tagSelection');
        
        if (tagContainer) {
            tagContainer.innerHTML = tags.map(tag => `
                <label class="tag-checkbox-label" for="tag-checkbox-${tag.id}">
                    <input type="checkbox" id="tag-checkbox-${tag.id}" name="tag-${tag.id}" class="tag-checkbox" value="${tag.id}">
                    <span class="tag-checkbox-text" style="background-color: ${tag.color};">
                        ${DOMUtils.escapeHtml(tag.name)}
                    </span>
                </label>
            `).join('');
        } else {
            console.error('Elemento tagSelection não encontrado');
        }
    }

    /**
     * Renderiza gerenciamento de categorias
     * @param {Array} categories - Lista de categorias
     */
    renderCategoryManagement(categories = []) {
        const categoryManagementList = DOMUtils.getById('categoriesManagementList');
        if (categoryManagementList) {
            categoryManagementList.innerHTML = categories.map(category => 
                this.createCategoryManagementHTML(category)
            ).join('');
        }
    }

    /**
     * Renderiza gerenciamento de tags
     * @param {Array} tags - Lista de tags
     */
    renderTagManagement(tags = []) {
        const tagManagementList = DOMUtils.getById('tagsManagementList');
        if (tagManagementList) {
            tagManagementList.innerHTML = tags.map(tag => 
                this.createTagManagementHTML(tag)
            ).join('');
        }
    }

    /**
     * Cria HTML para gerenciamento de categoria
     * @param {Object} category - Dados da categoria
     * @returns {string} HTML da categoria
     */
    createCategoryManagementHTML(category) {
        const usageCount = this.getCategoryUsageCount(category.id);
        const isEditing = this.editingCategoryId === category.id;
        
        if (isEditing) {
            return `
                <div class="category-management-item" data-category-id="${category.id}">
                    <div class="edit-category-form">
                        <input type="text" id="editCategoryName_${category.id}" value="${DOMUtils.escapeHtml(category.name)}" placeholder="Nome da categoria">
                        <input type="color" id="editCategoryColor_${category.id}" value="${category.color}">
                        <div class="edit-category-actions">
                            <button class="btn btn-primary" onclick="app.saveCategoryEdit('${category.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-secondary" onclick="app.cancelCategoryEdit()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="category-management-item" data-category-id="${category.id}">
                <div class="category-info">
                    <span class="category-management-color" style="background-color: ${category.color};"></span>
                    <span class="category-management-name">${DOMUtils.escapeHtml(category.name)}</span>
                    ${usageCount > 0 ? `<span class="category-usage">(${usageCount} tarefa${usageCount > 1 ? 's' : ''})</span>` : ''}
                </div>
                <div class="category-actions">
                    <button class="category-action-btn edit" onclick="app.editCategory('${category.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="category-action-btn delete" onclick="app.deleteCategory('${category.id}')" 
                            title="Excluir" ${usageCount > 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Cria HTML para gerenciamento de tag
     * @param {Object} tag - Dados da tag
     * @returns {string} HTML da tag
     */
    createTagManagementHTML(tag) {
        const usageCount = this.getTagUsageCount(tag.id);
        const isEditing = this.editingTagId === tag.id;
        
        if (isEditing) {
            return `
                <div class="tag-management-item" data-tag-id="${tag.id}">
                    <div class="edit-tag-form">
                        <input type="text" id="editTagName_${tag.id}" value="${DOMUtils.escapeHtml(tag.name)}" placeholder="Nome da tag">
                        <input type="color" id="editTagColor_${tag.id}" value="${tag.color}">
                        <div class="edit-tag-actions">
                            <button class="btn btn-primary" onclick="app.saveTagEdit('${tag.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-secondary" onclick="app.cancelTagEdit()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="tag-management-item" data-tag-id="${tag.id}">
                <div class="tag-info">
                    <span class="tag-management-color" style="background-color: ${tag.color};"></span>
                    <span class="tag-management-name">${DOMUtils.escapeHtml(tag.name)}</span>
                    ${usageCount > 0 ? `<span class="tag-usage">(${usageCount} tarefa${usageCount > 1 ? 's' : ''})</span>` : ''}
                </div>
                <div class="tag-actions">
                    <button class="tag-action-btn edit" onclick="app.editTag('${tag.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="tag-action-btn delete" onclick="app.deleteTag('${tag.id}')" 
                            title="Excluir" ${usageCount > 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Atualiza estado do formulário de categoria
     * @param {number} categoryCount - Número de categorias
     */
    updateCategoryFormState(categoryCount) {
        const addButton = DOMUtils.querySelector('#categoryForm button[type="submit"]');
        
        if (addButton) {
            if (categoryCount >= 5) {
                addButton.disabled = true;
                addButton.innerHTML = '<i class="fas fa-ban"></i> Limite Atingido (5/5)';
                DOMUtils.addClass(addButton, 'disabled');
            } else {
                addButton.disabled = false;
                addButton.innerHTML = `<i class="fas fa-plus"></i> Adicionar Categoria (${categoryCount}/5)`;
                DOMUtils.removeClass(addButton, 'disabled');
            }
        }
    }

    /**
     * Atualiza estado do formulário de tag
     * @param {number} tagCount - Número de tags
     */
    updateTagFormState(tagCount) {
        const addButton = DOMUtils.querySelector('#tagForm button[type="submit"]');
        
        if (addButton) {
            if (tagCount >= 5) {
                addButton.disabled = true;
                addButton.innerHTML = '<i class="fas fa-ban"></i> Limite Atingido (5/5)';
                DOMUtils.addClass(addButton, 'disabled');
            } else {
                addButton.disabled = false;
                addButton.innerHTML = `<i class="fas fa-plus"></i> Adicionar Tag (${tagCount}/5)`;
                DOMUtils.removeClass(addButton, 'disabled');
            }
        }
    }

    /**
     * Configura event listeners dos modais
     */
    setupModalEventListeners() {
        // Modal de tarefa
        DOMUtils.addEventListener(DOMUtils.getById('closeModal'), 'click', () => {
            this.closeTaskModal();
        });

        DOMUtils.addEventListener(DOMUtils.getById('cancelTask'), 'click', () => {
            this.closeTaskModal();
        });

        // Fechar modal ao clicar no backdrop
        DOMUtils.addEventListener(DOMUtils.getById('taskModal'), 'click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });

        // Formulário de tarefa
        DOMUtils.addEventListener(DOMUtils.getById('taskForm'), 'submit', (e) => {
            e.preventDefault();
            this.handleTaskFormSubmit();
        });

        // Modal de categoria
        DOMUtils.addEventListener(DOMUtils.getById('closeCategoryModal'), 'click', () => {
            this.closeCategoryModal();
        });

        DOMUtils.addEventListener(DOMUtils.getById('categoryModal'), 'click', (e) => {
            if (e.target.id === 'categoryModal') {
                this.closeCategoryModal();
            }
        });

        // Modal de tag
        DOMUtils.addEventListener(DOMUtils.getById('closeTagModal'), 'click', () => {
            this.closeTagModal();
        });

        DOMUtils.addEventListener(DOMUtils.getById('tagModal'), 'click', (e) => {
            if (e.target.id === 'tagModal') {
                this.closeTagModal();
            }
        });

        // Opções de recorrência
        DOMUtils.addEventListener(DOMUtils.getById('isRecurring'), 'change', (e) => {
            const recurrenceOptions = DOMUtils.getById('recurrenceOptions');
            if (e.target.checked) {
                DOMUtils.show(recurrenceOptions);
            } else {
                DOMUtils.hide(recurrenceOptions);
            }
        });

        DOMUtils.addEventListener(DOMUtils.getById('recurrenceType'), 'change', (e) => {
            const weeklyOptions = DOMUtils.getById('weeklyOptions');
            if (e.target.value === 'weekly') {
                DOMUtils.show(weeklyOptions);
            } else {
                DOMUtils.hide(weeklyOptions);
            }
        });

        // Checkboxes de dias da semana
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('weekday-checkbox')) {
                const label = e.target.closest('.weekday-label');
                if (e.target.checked) {
                    DOMUtils.addClass(label, 'checked');
                } else {
                    DOMUtils.removeClass(label, 'checked');
                }
            }
        });
    }

    /**
     * Obtém dados do formulário de tarefa
     * @returns {Object} Dados do formulário
     */
    getTaskFormData() {
        const isRecurring = DOMUtils.getById('isRecurring').checked;
        const recurrenceType = DOMUtils.getValue(DOMUtils.getById('recurrenceType'));
        
        // Obter dias da semana selecionados
        const weekdays = [];
        if (recurrenceType === 'weekly') {
            DOMUtils.querySelectorAll('.weekday-checkbox:checked').forEach(checkbox => {
                weekdays.push(checkbox.value);
            });
        }

        // Obter tags selecionadas
        const selectedTags = [];
        DOMUtils.querySelectorAll('.tag-checkbox:checked').forEach(checkbox => {
            selectedTags.push(checkbox.value);
        });

        return {
            title: DOMUtils.getValue(DOMUtils.getById('taskTitle')),
            description: DOMUtils.getValue(DOMUtils.getById('taskDescription')),
            category: DOMUtils.getValue(DOMUtils.getById('taskCategory')),
            tags: selectedTags,
            priority: DOMUtils.getValue(DOMUtils.getById('taskPriority')),
            dueDate: DOMUtils.getValue(DOMUtils.getById('taskDate')),
            dueTime: DOMUtils.getValue(DOMUtils.getById('taskTime')),
            isRecurring: isRecurring,
            recurrenceType: isRecurring ? recurrenceType : null,
            recurrenceData: isRecurring && weekdays.length > 0 ? { weekdays } : null
        };
    }

    /**
     * Valida dados do formulário de tarefa
     * @param {Object} formData - Dados do formulário
     * @returns {Object} Resultado da validação
     */
    validateTaskForm(formData) {
        const errors = [];

        if (!formData.title.trim()) {
            errors.push('Por favor, insira um título para a tarefa.');
        }

        if (formData.tags.length > 3) {
            errors.push('Você pode selecionar no máximo 3 tags por tarefa.');
        }

        if (formData.isRecurring && !formData.dueDate) {
            errors.push('Tarefas recorrentes precisam de uma data de vencimento.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Lida com o envio do formulário de tarefa
     */
    handleTaskFormSubmit() {
        const formData = this.getTaskFormData();
        const validation = this.validateTaskForm(formData);
        
        if (!validation.isValid) {
            // Usar callback de erro de validação se disponível
            if (this.onValidationError) {
                this.onValidationError(validation.errors.join('\n'));
            } else {
                // Fallback para alert se callback não estiver disponível
                alert(validation.errors.join('\n'));
            }
            return;
        }
        
        // Chamar callback da aplicação principal
        if (this.onTaskFormSubmit) {
            this.onTaskFormSubmit(formData, this.editingTaskId);
        }
        
        this.closeTaskModal();
    }


    /**
     * Métodos auxiliares (serão implementados pela aplicação principal)
     */
    getTaskById(taskId) { return null; }
    getCategoryUsageCount(categoryId) { return 0; }
    getTagUsageCount(tagId) { return 0; }
    onTaskFormSubmit(formData, taskId) { /* Implementar na aplicação principal */ }

    /**
     * Destrói o gerenciador de modais
     */
    destroy() {
        this.editingTaskId = null;
        this.editingCategoryId = null;
        this.editingTagId = null;
        this.currentModal = null;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
} else {
    window.ModalManager = ModalManager;
}
