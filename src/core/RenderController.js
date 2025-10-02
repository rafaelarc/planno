/**
 * RenderController - Gerencia renderização da interface
 * Responsável por coordenar a renderização de todos os componentes
 */
class RenderController {
    constructor(taskRenderer, modalManager, sidebarManager, settingsManager) {
        this.taskRenderer = taskRenderer;
        this.modalManager = modalManager;
        this.sidebarManager = sidebarManager;
        this.settingsManager = settingsManager;
        
        // Cache para updates incrementais
        this.lastRenderedTasks = new Map();
        this.taskListElement = null;
        
        // Configurações de paginação
        this.tasksPerPage = {
            mobile: 15,
            desktop: 25,
            filtered: 20
        };
        this.currentPage = 1;
        this.showAllTasks = false;
    }

    /**
     * Inicializa o controlador
     * @param {Object} options - Opções de inicialização
     */
    initialize(options = {}) {
        this.tasksPerPage = { ...this.tasksPerPage, ...options.tasksPerPage };
        this.currentPage = options.currentPage || 1;
        this.showAllTasks = options.showAllTasks || false;
        
        // Cache do elemento da lista
        this.taskListElement = DOMUtils.getById('taskList');
    }

    /**
     * Configura callbacks
     * @param {Object} callbacks - Objeto com callbacks
     */
    setCallbacks(callbacks) {
        this.onShowAllTasks = callbacks.onShowAllTasks;
    }

    /**
     * Renderiza tarefas com updates incrementais
     * @param {Array} tasks - Lista de tarefas para renderizar
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @param {string} emptyMessage - Mensagem para lista vazia
     */
    renderTasks(tasks, categories = [], tags = [], emptyMessage = 'Nenhuma tarefa encontrada') {
        try {
            // Garantir que taskListElement está definido
            if (!this.taskListElement) {
                this.taskListElement = DOMUtils.getById('taskList');
            }
            
            if (!this.taskListElement) {
                // Fallback para renderização completa se não houver cache
                this.taskRenderer.renderTasks(tasks, categories, tags, emptyMessage);
                return;
            }

            // Verificar se tasks é um array válido e não está vazio
            if (!Array.isArray(tasks) || tasks.length === 0) {
                this.taskListElement.innerHTML = this.taskRenderer.getEmptyStateHTML(emptyMessage);
                this.lastRenderedTasks.clear();
                return;
            }

            // Criar map das tarefas atuais para comparação
            const currentTasks = new Map();
            tasks.forEach(task => {
                currentTasks.set(task.id, task);
            });

            // Encontrar tarefas que foram adicionadas, modificadas ou removidas
            const addedTasks = [];
            const modifiedTasks = [];
            const removedTaskIds = [];

            // Verificar tarefas adicionadas ou modificadas
            currentTasks.forEach((task, taskId) => {
                const lastTask = this.lastRenderedTasks.get(taskId);
                if (!lastTask) {
                    addedTasks.push(task);
                } else if (this.hasTaskChanged(task, lastTask)) {
                    modifiedTasks.push(task);
                }
            });

            // Verificar tarefas removidas
            this.lastRenderedTasks.forEach((task, taskId) => {
                if (!currentTasks.has(taskId)) {
                    removedTaskIds.push(taskId);
                }
            });

            // Aplicar updates incrementais
            this.applyIncrementalUpdates(addedTasks, modifiedTasks, removedTaskIds, categories, tags);

            // Atualizar cache
            this.lastRenderedTasks = new Map(currentTasks);
        } catch (error) {
            console.error('Erro nos updates incrementais:', error);
            // Fallback: renderização completa
            this.taskRenderer.renderTasks(tasks, categories, tags, emptyMessage);
            this.lastRenderedTasks.clear();
        }
    }

    /**
     * Limpa o cache de tarefas renderizadas
     * Força uma re-renderização completa na próxima chamada
     */
    clearCache() {
        this.lastRenderedTasks.clear();
        // Também limpar o elemento da lista para forçar re-renderização completa
        if (this.taskListElement) {
            this.taskListElement.innerHTML = '';
        }
    }

    /**
     * Renderiza tarefas com paginação
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @param {boolean} hasActiveFilters - Se há filtros ativos
     */
    renderTasksWithPagination(tasks, categories, tags, hasActiveFilters = false) {
        // Aplicar limite de paginação
        const limit = this.getTasksLimit(hasActiveFilters);
        const tasksToRender = tasks.slice(0, limit);
        const hasMoreTasks = tasks.length > limit;
        
        // Renderizar tarefas
        this.renderTasks(tasksToRender, categories, tags);
        
        // Renderizar botão "Ver mais" se necessário
        this.renderPaginationButton(tasks.length, limit, hasMoreTasks);
    }

    /**
     * Renderiza categorias
     * @param {Array} categories - Lista de categorias
     * @param {string} activeCategoryId - ID da categoria ativa
     * @param {Array} tasks - Lista de tarefas para contadores
     */
    renderCategories(categories, activeCategoryId = null, tasks = []) {
        // Atualizar contadores antes de renderizar
        this.taskRenderer.updateCategoryUsageCounts(tasks);
        
        this.taskRenderer.renderCategories(categories, activeCategoryId);
        this.modalManager.updateCategoryFormState(categories.length);
    }

    /**
     * Renderiza tags
     * @param {Array} tags - Lista de tags
     * @param {string} activeTagId - ID da tag ativa
     * @param {Array} tasks - Lista de tarefas para contadores
     */
    renderTags(tags, activeTagId = null, tasks = []) {
        // Atualizar contadores antes de renderizar
        this.taskRenderer.updateTagUsageCounts(tasks);
        
        this.taskRenderer.renderTags(tags, activeTagId);
        this.modalManager.updateTagFormState(tags.length);
    }

    /**
     * Renderiza lista de categorias no modal de gerenciamento
     * @param {Array} categories - Lista de categorias
     */
    renderCategoriesManagement(categories) {
        const container = DOMUtils.getById('categoriesManagementList');
        if (!container) return;

        if (categories.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma categoria criada ainda.</p>';
            return;
        }

        container.innerHTML = categories.map(category => `
            <div class="management-item" data-category-id="${category.id}">
                <div class="management-item-info">
                    <div class="management-item-color" style="background-color: ${category.color};"></div>
                    <div class="management-item-text">
                        ${DOMUtils.escapeHtml(category.name)}
                    </div>
                </div>
                <div class="management-item-actions">
                    <button class="management-btn management-btn-edit" onclick="app.editCategory('${category.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="management-btn management-btn-delete" onclick="app.deleteCategoryConfirm('${category.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza lista de tags no modal de gerenciamento
     * @param {Array} tags - Lista de tags
     */
    renderTagsManagement(tags) {
        const container = DOMUtils.getById('tagsManagementList');
        if (!container) return;

        if (tags.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma tag criada ainda.</p>';
            return;
        }

        container.innerHTML = tags.map(tag => `
            <div class="management-item" data-tag-id="${tag.id}">
                <div class="management-item-info">
                    <div class="management-item-color" style="background-color: ${tag.color};"></div>
                    <div class="management-item-text">
                        ${DOMUtils.escapeHtml(tag.name)}
                    </div>
                </div>
                <div class="management-item-actions">
                    <button class="management-btn management-btn-edit" onclick="app.editTag('${tag.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="management-btn management-btn-delete" onclick="app.deleteTagConfirm('${tag.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza estatísticas
     * @param {Object} stats - Estatísticas para renderizar
     */
    renderStats(stats) {
        DOMUtils.setText(DOMUtils.getById('totalTasks'), stats.total);
        DOMUtils.setText(DOMUtils.getById('completedTasks'), stats.completed);
        DOMUtils.setText(DOMUtils.getById('pendingTasks'), stats.pending);
    }

    /**
     * Renderiza título da seção
     * @param {string} title - Título da seção
     * @param {boolean} hasActiveFilters - Se há filtros ativos
     */
    renderSectionTitle(title, hasActiveFilters = false) {
        DOMUtils.setText(DOMUtils.getById('taskSectionTitle'), title);
        
        // Mostrar/ocultar botão de limpar filtros
        const activeFiltersDiv = DOMUtils.getById('activeFilters');
        if (hasActiveFilters) {
            DOMUtils.show(activeFiltersDiv, 'flex');
        } else {
            DOMUtils.hide(activeFiltersDiv);
        }
    }

    /**
     * Renderiza botões de filtro ativos
     * @param {string} activeFilter - Filtro ativo
     */
    renderActiveFilterButtons(activeFilter) {
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
     * Renderiza o botão de paginação
     * @param {number} totalTasks - Total de tarefas filtradas
     * @param {number} limit - Limite atual de tarefas exibidas
     * @param {boolean} hasMoreTasks - Se há mais tarefas para exibir
     */
    renderPaginationButton(totalTasks, limit, hasMoreTasks) {
        const taskList = DOMUtils.getById('taskList');
        if (!taskList) return;

        // Remover botão anterior se existir
        const existingButton = DOMUtils.getById('paginationButton');
        if (existingButton) {
            existingButton.remove();
        }

        // Se não há mais tarefas ou se já está mostrando todas, não mostrar botão
        if (!hasMoreTasks || this.showAllTasks) {
            return;
        }

        // Criar botão "Ver mais"
        const button = document.createElement('button');
        button.id = 'paginationButton';
        button.className = 'pagination-btn';
        button.innerHTML = `
            <i class="fas fa-chevron-down"></i>
            Ver mais tarefas (${totalTasks - limit} restantes)
        `;

        // Adicionar evento de clique
        button.addEventListener('click', () => {
            this.showAllTasks = true;
            // Notificar que precisa re-renderizar
            this.onShowAllTasks?.();
        });

        // Adicionar botão após a lista de tarefas
        taskList.appendChild(button);
    }

    /**
     * Determina o limite de tarefas baseado no contexto
     * @param {boolean} hasActiveFilters - Se há filtros ativos
     * @returns {number} Número máximo de tarefas a exibir
     */
    getTasksLimit(hasActiveFilters = false) {
        if (this.showAllTasks) {
            return Number.MAX_SAFE_INTEGER; // Sem limite quando "Ver todas" está ativo
        }

        // Se há filtros ativos, usar limite menor
        if (hasActiveFilters) {
            return this.tasksPerPage.filtered;
        }

        // Se não há filtros, usar limite baseado no dispositivo
        if (this.sidebarManager && this.sidebarManager.isMobile) {
            return this.tasksPerPage.mobile;
        }

        return this.tasksPerPage.desktop;
    }

    /**
     * Verifica se uma tarefa foi modificada comparando com a versão anterior
     * @param {Object} currentTask - Tarefa atual
     * @param {Object} lastTask - Tarefa anterior
     * @returns {boolean}
     */
    hasTaskChanged(currentTask, lastTask) {
        // Comparar propriedades relevantes para renderização
        const relevantProps = ['title', 'description', 'completed', 'priority', 'category', 'tags', 'dueDate', 'dueTime', 'isRecurring', 'recurrenceType', 'recurrenceData'];
        
        return relevantProps.some(prop => {
            if (prop === 'tags') {
                // Comparar arrays de tags
                const currentTags = currentTask[prop] || [];
                const lastTags = lastTask[prop] || [];
                return JSON.stringify(currentTags.sort()) !== JSON.stringify(lastTags.sort());
            }
            if (prop === 'recurrenceData') {
                // Comparar objetos de dados de recorrência
                const currentData = currentTask[prop] || null;
                const lastData = lastTask[prop] || null;
                return JSON.stringify(currentData) !== JSON.stringify(lastData);
            }
            return currentTask[prop] !== lastTask[prop];
        });
    }

    /**
     * Aplica updates incrementais na DOM
     * @param {Array} addedTasks - Tarefas adicionadas
     * @param {Array} modifiedTasks - Tarefas modificadas
     * @param {Array} removedTaskIds - IDs das tarefas removidas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     */
    applyIncrementalUpdates(addedTasks, modifiedTasks, removedTaskIds, categories, tags) {
        try {
            // Remover tarefas deletadas
            removedTaskIds.forEach(taskId => {
                const taskElement = this.taskListElement.querySelector(`[data-task-id="${taskId}"]`);
                if (taskElement) {
                    taskElement.remove();
                }
            });

            // Atualizar tarefas modificadas
            modifiedTasks.forEach(task => {
                const taskElement = this.taskListElement.querySelector(`[data-task-id="${task.id}"]`);
                if (taskElement) {
                    // Substituir o elemento existente
                    const newElement = this.createTaskElement(task, categories, tags);
                    if (newElement) {
                        taskElement.replaceWith(newElement);
                    }
                }
            });

            // Adicionar novas tarefas
            if (addedTasks.length > 0) {
                // Se há tarefas para adicionar e a lista está vazia (mostrando mensagem de erro),
                // limpar o conteúdo primeiro
                if (this.taskListElement.innerHTML.includes('Nenhuma tarefa encontrada')) {
                    this.taskListElement.innerHTML = '';
                }
                
                const newTasksHTML = addedTasks.map(task => 
                    this.taskRenderer.createTaskHTML(task, categories, tags)
                ).join('');
                
                // Adicionar no final da lista
                this.taskListElement.insertAdjacentHTML('beforeend', newTasksHTML);
            }
        } catch (error) {
            console.error('Erro ao aplicar updates incrementais:', error);
            // Fallback: renderização completa
            const allTasks = [...addedTasks, ...modifiedTasks];
            this.taskRenderer.renderTasks(allTasks, categories, tags);
        }
    }

    /**
     * Cria um elemento DOM para uma tarefa (para updates incrementais)
     * @param {Object} task - Tarefa
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {HTMLElement}
     */
    createTaskElement(task, categories, tags) {
        const div = document.createElement('div');
        div.innerHTML = this.taskRenderer.createTaskHTML(task, categories, tags);
        return div.firstElementChild;
    }

    /**
     * Limpa o cache de renderização
     */
    clearRenderCache() {
        this.lastRenderedTasks.clear();
    }

    /**
     * Reseta paginação
     */
    resetPagination() {
        this.showAllTasks = false;
        this.currentPage = 1;
    }

    /**
     * Obtém o estado atual da renderização
     * @returns {Object} Estado de debug
     */
    getRenderState() {
        return {
            lastRenderedTasksCount: this.lastRenderedTasks.size,
            showAllTasks: this.showAllTasks,
            currentPage: this.currentPage,
            taskListElement: !!this.taskListElement
        };
    }

    /**
     * Obtém as tarefas atuais (para contadores)
     * @returns {Array} Lista de tarefas atuais
     */
    getCurrentTasks() {
        // Esta função deve ser implementada pela classe pai
        // que tem acesso aos dados das tarefas
        return [];
    }
}

// Exportar para uso global
window.RenderController = RenderController;
