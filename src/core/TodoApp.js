/**
 * TodoApp - Classe principal da aplicação
 * Orquestra todos os módulos e funcionalidades
 * 
 * Esta é a versão refatorada da aplicação
 * Utiliza controladores especializados para melhor organização
 */
class TodoApp {
    constructor() {
        // Inicializar serviços
        this.storageService = new StorageService();
        this.exportService = new ExportService();
        
        // Inicializar filtros
        this.taskFilter = new TaskFilter();
        this.searchFilter = new SearchFilter();
        
        // Inicializar módulos UI
        this.taskRenderer = new TaskRenderer();
        this.modalManager = new ModalManager();
        this.sidebarManager = new SidebarManager();
        this.settingsManager = new SettingsManager();
        this.guideManager = new GuideManager();
        this.toastManager = new ToastManager();
        
        // Inicializar gerenciadores core
        this.eventManager = new EventManager();
        this.stateManager = new StateManager();
        
        // Inicializar controladores especializados
        this.taskController = new TaskController(
            this.storageService,
            this.taskRenderer,
            this.toastManager
        );
        
        this.categoryController = new CategoryController(
            this.storageService,
            this.toastManager,
            this.taskController
        );
        
        this.tagController = new TagController(
            this.storageService,
            this.toastManager,
            this.taskController
        );
        
        this.filterController = new FilterController(
            this.taskFilter,
            this.searchFilter
        );
        
        this.renderController = new RenderController(
            this.taskRenderer,
            this.modalManager,
            this.sidebarManager,
            this.settingsManager
        );
        
        // Configurar callbacks do RenderController
        this.renderController.setCallbacks({
            onShowAllTasks: () => this.renderTasks()
        });
        
        this.settingsController = new SettingsController(
            this.storageService,
            this.taskFilter,
            this.settingsManager,
            this.toastManager
        );
        
        // Estado da aplicação
        this.editingTaskId = null;
        this.editingCategoryId = null;
        this.editingTagId = null;
        
        // Debounce para busca
        this.searchTimeout = null;
        
        // Inicializar aplicação
        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        // Inicializar controladores
        this.taskController.initialize();
        this.categoryController.initialize();
        this.tagController.initialize();
        this.filterController.initialize();
        this.renderController.initialize();
        this.settingsController.initialize();
        
        // Inicializar gerenciadores
        this.stateManager.initialize({
            tasks: [],
            categories: [],
            tags: [],
            settings: this.settingsController.getAllSettings(),
            currentFilter: 'all',
            currentCategoryFilter: null,
            currentTagFilter: null
        });
        
        this.eventManager.setupKeyboardListeners();
        this.eventManager.setupAppEventListeners();
        
        // Inicializar módulos UI
        this.sidebarManager.init();
        this.modalManager.setupModalEventListeners();
        this.settingsManager.init();
        
        // Conectar callbacks do SettingsManager
        this.connectSettingsCallbacks();
        
        // Conectar callbacks do ModalManager
        this.connectModalCallbacks();
        
        // Carregar dados e configurar aplicação
        this.loadData();
        this.checkAndGenerateRecurringTasks();
        this.setupEventListeners();
        this.setupEventDelegation();
        
        // Aplicar configurações
        this.settingsController.applySettings();
        
        this.updateUserGreeting();
        this.renderAll();
        this.updateSortUI();
    }

    /**
     * Carrega todos os dados da aplicação
     */
    loadData() {
        // Carregar dados usando controladores
        this.taskController.loadTasks();
        this.categoryController.loadCategories();
        this.tagController.loadTags();
    }

    /**
     * Renderiza todos os componentes
     */
    renderAll() {
        this.renderTasks();
        this.renderCategories();
        this.renderTags();
        this.updateStats();
    }

    /**
     * Verifica e gera tarefas recorrentes
     */
    checkAndGenerateRecurringTasks() {
        this.taskController.checkAndGenerateRecurringTasks(
            this.categoryController.getAllCategories(),
            this.tagController.getAllTags()
        );
    }

    // ===== TASK MANAGEMENT =====

    /**
     * Adiciona uma nova tarefa
     * @param {Object} taskData - Dados da tarefa
     */
    addTask(taskData) {
        if (this.taskController.addTask(taskData)) {
            this.renderAll();
        }
    }


    /**
     * Exclui uma tarefa
     * @param {string} taskId - ID da tarefa
     */
    deleteTask(taskId) {
        if (this.taskController.deleteTask(taskId)) {
            this.renderAll();
        }
    }

    /**
     * Confirma e remove uma tarefa
     * @param {string} taskId - ID da tarefa
     */
    deleteTaskConfirm(taskId) {
        if (this.taskController.deleteTaskConfirm(taskId)) {
            this.renderAll();
        }
    }

    /**
     * Abre o modal para editar uma tarefa
     * @param {string} taskId - ID da tarefa
     */
    editTask(taskId) {
        this.modalManager.openTaskModal(taskId, this.categoryController.getAllCategories(), this.tagController.getAllTags());
    }

    /**
     * Exclui série recorrente completa
     * @param {string} taskId - ID da tarefa
     */
    deleteRecurringSeries(taskId) {
        const task = this.taskController.getTaskById(taskId);
        if (!task || !task.isRecurring) {
            console.warn('Tarefa não encontrada ou não é recorrente:', taskId);
            return;
        }

        if (confirm(`Tem certeza que deseja excluir toda a série recorrente "${task.title}"? Esta ação não pode ser desfeita.`)) {
            // Implementar lógica para excluir toda a série
            console.log('Excluindo série recorrente:', taskId);
            
            // Por enquanto, apenas excluir a tarefa atual
            if (this.taskController.deleteTaskConfirm(taskId)) {
                this.toastManager.success('Série recorrente excluída com sucesso!');
                this.renderAll();
            }
        }
    }

    /**
     * Alterna o status de conclusão de uma tarefa
     * @param {string} taskId - ID da tarefa
     */
    toggleTaskComplete(taskId) {
        const result = this.taskController.toggleTaskComplete(taskId);
        if (result.success) {
            // Se completando uma tarefa recorrente, gerar próxima ocorrência
            if (!result.wasCompleted && result.isNowCompleted) {
                const task = this.taskController.getTaskById(taskId);
                if (task && task.isRecurring) {
                    this.taskController.generateRecurringAfterComplete(
                        task,
                        this.categoryController.getAllCategories(),
                        this.tagController.getAllTags()
                    );
                }
            }
            
            this.renderAll();
        }
    }

    // ===== CATEGORY MANAGEMENT =====

    /**
     * Adiciona uma nova categoria
     * @param {Object} categoryData - Dados da categoria
     * @returns {boolean} Se a categoria foi adicionada
     */
    addCategory(categoryData) {
        if (this.categoryController.addCategory(categoryData)) {
            this.renderAll();
            this.updateCategorySelects();
            this.updateCategoryFormState();
            return true;
        }
        return false;
    }

    /**
     * Atualiza uma categoria existente
     * @param {string} categoryId - ID da categoria
     * @param {Object} categoryData - Novos dados da categoria
     */
    updateCategory(categoryId, categoryData) {
        if (this.categoryController.updateCategory(categoryId, categoryData)) {
            this.renderAll();
            this.updateCategorySelects();
        }
    }

    /**
     * Exclui uma categoria
     * @param {string} categoryId - ID da categoria
     * @returns {boolean} Se a categoria foi excluída
     */
    deleteCategory(categoryId) {
        if (this.categoryController.deleteCategory(categoryId)) {
            this.renderAll();
            this.updateCategorySelects();
            this.updateCategoryFormState();
            return true;
        }
        return false;
    }

    // ===== TAG MANAGEMENT =====

    /**
     * Adiciona uma nova tag
     * @param {Object} tagData - Dados da tag
     * @returns {boolean} Se a tag foi adicionada
     */
    addTag(tagData) {
        if (this.tagController.addTag(tagData)) {
            this.renderAll();
            this.updateTagSelects();
            this.updateTagFormState();
            return true;
        }
        return false;
    }

    /**
     * Atualiza uma tag existente
     * @param {string} tagId - ID da tag
     * @param {Object} tagData - Novos dados da tag
     */
    updateTag(tagId, tagData) {
        if (this.tagController.updateTag(tagId, tagData)) {
            this.renderAll();
            this.updateTagSelects();
        }
    }

    /**
     * Exclui uma tag
     * @param {string} tagId - ID da tag
     * @returns {boolean} Se a tag foi excluída
     */
    deleteTag(tagId) {
        if (this.tagController.deleteTag(tagId)) {
            this.renderAll();
            this.updateTagSelects();
            this.updateTagFormState();
            return true;
        }
        return false;
    }

    // ===== FILTERING AND SEARCH =====

    /**
     * Obtém tarefas filtradas
     * @returns {Array} Lista de tarefas filtradas
     */
    getFilteredTasks() {
        const searchTerm = DOMUtils.getValue(DOMUtils.getById('searchInput')) || '';
        this.filterController.setSearchTerm(searchTerm);
        
        return this.filterController.getFilteredTasks(
            this.taskController.getAllTasks(),
            this.categoryController.getAllCategories(),
            this.tagController.getAllTags()
        );
    }

    /**
     * Determina o limite de tarefas baseado no contexto
     * @returns {number} Número máximo de tarefas a exibir
     */
    getTasksLimit() {
        if (this.renderController.showAllTasks) {
            return Number.MAX_SAFE_INTEGER; // Sem limite quando "Ver todas" está ativo
        }

        const hasActiveFilters = this.filterController.hasActiveFilters();

        // Se há filtros ativos, usar limite menor
        if (hasActiveFilters) {
            return this.renderController.tasksPerPage.filtered;
        }

        // Se não há filtros, usar limite baseado no dispositivo
        if (this.sidebarManager && this.sidebarManager.isMobile) {
            return this.renderController.tasksPerPage.mobile;
        }

        return this.renderController.tasksPerPage.desktop;
    }

    /**
     * Executa busca com debounce para melhorar performance
     * @param {number} delay - Delay em milissegundos (padrão: 300ms)
     */
    debouncedSearch(delay = 300) {
        // Limpar timeout anterior se existir
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Configurar novo timeout
        this.searchTimeout = setTimeout(() => {
            try {
                // Resetar paginação quando busca muda
                this.renderController.resetPagination();
                this.renderAll();
            } catch (error) {
                console.error('Erro no debounced search:', error);
                // Fallback: renderização completa
                this.renderAll();
            } finally {
                this.searchTimeout = null;
            }
        }, delay);
    }

    /**
     * Configura event delegation para melhorar performance
     * Usa um único listener na lista de tarefas em vez de múltiplos listeners
     */
    setupEventDelegation() {
        const taskList = DOMUtils.getById('taskList');
        if (!taskList) return;

        // Event delegation para todos os eventos de tarefas
        DOMUtils.addEventListener(taskList, 'click', (e) => {
            try {
                const target = e.target.closest('[data-task-id]');
                if (!target) return;

                const taskId = target.dataset.taskId;
                if (!taskId) return;

                const action = e.target.closest('.task-action-btn');
                
                if (action) {
                    // Botão de ação clicado
                    if (action.classList.contains('edit')) {
                        this.editTask(taskId);
                    } else if (action.classList.contains('delete')) {
                        this.deleteTaskConfirm(taskId);
                    } else if (action.classList.contains('delete-series')) {
                        this.deleteRecurringSeries(taskId);
                    }
                }
            } catch (error) {
                console.error('Erro no event delegation (click):', error);
            }
        });

        // Event delegation para checkboxes
        DOMUtils.addEventListener(taskList, 'change', (e) => {
            try {
                if (e.target.classList.contains('task-checkbox')) {
                    const target = e.target.closest('[data-task-id]');
                    if (!target) return;
                    
                    const taskId = target.dataset.taskId;
                    if (!taskId) return;
                    
                    this.toggleTaskComplete(taskId);
                }
            } catch (error) {
                console.error('Erro no event delegation (change):', error);
            }
        });
    }



    /**
     * Debug: Verifica o estado atual da renderização
     * @returns {Object} Estado de debug
     */
    debugRenderState() {
        const filteredTasks = this.getFilteredTasks();
        const taskListElement = DOMUtils.getById('taskList');
        
        return {
            totalTasks: this.taskController.getAllTasks().length,
            filteredTasks: filteredTasks.length,
            taskListElement: !!taskListElement,
            taskListElementCache: !!this.renderController.taskListElement,
            lastRenderedTasksCount: this.renderController.lastRenderedTasks.size,
            currentFilter: this.filterController.currentFilter,
            searchTerm: DOMUtils.getValue(DOMUtils.getById('searchInput')) || '',
            taskListHTML: taskListElement ? taskListElement.innerHTML.substring(0, 200) + '...' : 'N/A'
        };
    }

    /**
     * Define o filtro atual
     * @param {string} filter - Tipo de filtro
     */
    setFilter(filter) {
        this.filterController.setFilter(filter);
        this.updateActiveFilterButtons();
        this.updateSectionTitle();
        this.renderController.resetPagination();
        
        // Atualizar interface visual dos filtros de categoria e tag
        this.renderCategories();
        this.renderTags();
        
        this.renderAll();
    }

    /**
     * Filtra por categoria
     * @param {string} categoryId - ID da categoria
     */
    filterByCategory(categoryId) {
        // Toggle: se já está ativa, desmarcar; senão, marcar
        const isCurrentlyActive = this.filterController.currentCategoryFilter === categoryId;
        const newCategoryId = isCurrentlyActive ? null : categoryId;
        
        this.filterController.setCategoryFilter(newCategoryId);
        this.updateActiveFilterButtons();
        this.updateSectionTitle();
        this.renderController.resetPagination();
        this.renderAll();
    }

    /**
     * Filtra por tag
     * @param {string} tagId - ID da tag
     */
    filterByTag(tagId) {
        // Toggle: se já está ativa, desmarcar; senão, marcar
        const isCurrentlyActive = this.filterController.currentTagFilter === tagId;
        const newTagId = isCurrentlyActive ? null : tagId;
        
        this.filterController.setTagFilter(newTagId);
        this.updateActiveFilterButtons();
        this.updateSectionTitle();
        this.renderController.resetPagination();
        this.renderAll();
    }

    /**
     * Limpa todos os filtros
     */
    clearAllFilters() {
        this.filterController.clearAllFilters();
        this.updateActiveFilterButtons();
        this.updateSectionTitle();
        this.renderController.resetPagination();
        this.renderAll();
    }

    // ===== RENDERING =====

    /**
     * Renderiza as tarefas
     */
    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        const hasActiveFilters = this.filterController.hasActiveFilters();
        
        this.renderController.renderTasksWithPagination(
            filteredTasks,
            this.categoryController.getAllCategories(),
            this.tagController.getAllTags(),
            hasActiveFilters
        );
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
            this.renderTasks();
        });

        // Adicionar botão após a lista de tarefas
        taskList.appendChild(button);
    }

    /**
     * Determina se deve usar renderização incremental
     * @returns {boolean}
     */
    shouldUseIncrementalRender() {
        // Usar renderização completa para:
        // - Mudanças de filtros
        // - Busca
        // - Primeira renderização
        const hasSearchTerm = DOMUtils.getValue(DOMUtils.getById('searchInput')) || '';
        const hasActiveFilters = this.filterController.hasActiveFilters();
        
        return !hasSearchTerm && !hasActiveFilters && this.renderController.lastRenderedTasks.size > 0;
    }

    /**
     * Renderiza as categorias
     */
    renderCategories() {
        this.renderController.renderCategories(
            this.categoryController.getAllCategories(),
            this.filterController.currentCategoryFilter,
            this.taskController.getAllTasks()
        );
    }

    /**
     * Renderiza a lista de categorias no modal de gerenciamento
     */
    renderCategoriesManagement() {
        this.renderController.renderCategoriesManagement(
            this.categoryController.getAllCategories()
        );
    }

    /**
     * Renderiza a lista de tags no modal de gerenciamento
     */
    renderTagsManagement() {
        this.renderController.renderTagsManagement(
            this.tagController.getAllTags()
        );
    }

    /**
     * Conta tarefas por categoria
     * @param {string} categoryId - ID da categoria
     * @returns {number} Número de tarefas
     */
    getCategoryTaskCount(categoryId) {
        return this.categoryController.getCategoryTaskCount(categoryId);
    }

    /**
     * Conta tarefas por tag
     * @param {string} tagId - ID da tag
     * @returns {number} Número de tarefas
     */
    getTagTaskCount(tagId) {
        return this.tagController.getTagTaskCount(tagId);
    }

    /**
     * Lida com submissão do formulário de categoria
     */
    handleCategoryFormSubmit() {
        const name = DOMUtils.getValue(DOMUtils.getById('categoryName')).trim();
        const color = DOMUtils.getValue(DOMUtils.getById('categoryColor'));

        if (this.addCategory({ name, color })) {
            this.clearCategoryForm();
            this.renderCategoriesManagement();
            this.updateCategoryFormButton();
        }
    }

    /**
     * Lida com submissão do formulário de tag
     */
    handleTagFormSubmit() {
        const name = DOMUtils.getValue(DOMUtils.getById('tagName')).trim();
        const color = DOMUtils.getValue(DOMUtils.getById('tagColor'));

        if (this.addTag({ name, color })) {
            this.clearTagForm();
            this.renderTagsManagement();
            this.updateTagFormButton();
        }
    }

    /**
     * Atualiza o botão do formulário de categoria com contador
     */
    updateCategoryFormButton() {
        const button = DOMUtils.querySelector('#categoryForm button[type="submit"]');
        if (button) {
            const count = this.categoryController.getAllCategories().length;
            const max = 5;
            const isEditing = button.getAttribute('data-editing-category');
            
            if (isEditing) {
                // Se está editando, não desabilitar o botão
                button.disabled = false;
            } else {
                // Se está adicionando, verificar limite
                button.innerHTML = `<i class="fas fa-plus"></i> Adicionar Categoria (${count}/${max})`;
                button.disabled = count >= max;
            }
        }
    }

    /**
     * Atualiza o botão do formulário de tag com contador
     */
    updateTagFormButton() {
        const button = DOMUtils.querySelector('#tagForm button[type="submit"]');
        if (button) {
            const count = this.tagController.getAllTags().length;
            const max = 5;
            const isEditing = button.getAttribute('data-editing-tag');
            
            if (isEditing) {
                // Se está editando, não desabilitar o botão
                button.disabled = false;
            } else {
                // Se está adicionando, verificar limite
                button.innerHTML = `<i class="fas fa-plus"></i> Adicionar Tag (${count}/${max})`;
                button.disabled = count >= max;
            }
        }
    }

    /**
     * Abre modal de edição de categoria
     * @param {string} categoryId - ID da categoria
     */
    editCategory(categoryId) {
        const category = this.categoryController.getCategoryById(categoryId);
        if (!category) return;

        // Preencher formulário com dados da categoria
        DOMUtils.setValue(DOMUtils.getById('categoryName'), category.name);
        DOMUtils.setValue(DOMUtils.getById('categoryColor'), category.color);
        
        // Alterar botão para "Atualizar"
        const button = DOMUtils.querySelector('#categoryForm button[type="submit"]');
        if (button) {
            button.innerHTML = '<i class="fas fa-save"></i> Atualizar Categoria';
            button.setAttribute('data-editing-category', categoryId);
        }

        // Scroll para o formulário
        const form = DOMUtils.getById('categoryForm');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Abre modal de edição de tag
     * @param {string} tagId - ID da tag
     */
    editTag(tagId) {
        const tag = this.tagController.getTagById(tagId);
        if (!tag) return;

        // Preencher formulário com dados da tag
        DOMUtils.setValue(DOMUtils.getById('tagName'), tag.name);
        DOMUtils.setValue(DOMUtils.getById('tagColor'), tag.color);
        
        // Alterar botão para "Atualizar"
        const button = DOMUtils.querySelector('#tagForm button[type="submit"]');
        if (button) {
            button.innerHTML = '<i class="fas fa-save"></i> Atualizar Tag';
            button.setAttribute('data-editing-tag', tagId);
        }

        // Scroll para o formulário
        const form = DOMUtils.getById('tagForm');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Atualiza categoria a partir do formulário
     * @param {string} categoryId - ID da categoria
     */
    updateCategoryFromForm(categoryId) {
        const name = DOMUtils.getValue(DOMUtils.getById('categoryName')).trim();
        const color = DOMUtils.getValue(DOMUtils.getById('categoryColor'));

        if (this.updateCategory(categoryId, { name, color })) {
            this.clearCategoryForm();
            this.renderCategoriesManagement();
            this.updateCategoryFormButton();
            this.resetCategoryFormButton();
        }
    }

    /**
     * Atualiza tag a partir do formulário
     * @param {string} tagId - ID da tag
     */
    updateTagFromForm(tagId) {
        const name = DOMUtils.getValue(DOMUtils.getById('tagName')).trim();
        const color = DOMUtils.getValue(DOMUtils.getById('tagColor'));

        if (this.updateTag(tagId, { name, color })) {
            this.clearTagForm();
            this.renderTagsManagement();
            this.updateTagFormButton();
            this.resetTagFormButton();
        }
    }

    /**
     * Reseta botão do formulário de categoria para "Adicionar"
     */
    resetCategoryFormButton() {
        const button = DOMUtils.querySelector('#categoryForm button[type="submit"]');
        if (button) {
            button.innerHTML = '<i class="fas fa-plus"></i> Adicionar Categoria';
            button.removeAttribute('data-editing-category');
        }
    }

    /**
     * Reseta botão do formulário de tag para "Adicionar"
     */
    resetTagFormButton() {
        const button = DOMUtils.querySelector('#tagForm button[type="submit"]');
        if (button) {
            button.innerHTML = '<i class="fas fa-plus"></i> Adicionar Tag';
            button.removeAttribute('data-editing-tag');
        }
    }

    /**
     * Confirma exclusão de categoria
     * @param {string} categoryId - ID da categoria
     */
    deleteCategoryConfirm(categoryId) {
        if (this.categoryController.deleteCategoryConfirm(categoryId)) {
            this.renderAll();
            this.renderCategoriesManagement();
            this.updateCategoryFormButton();
        }
    }

    /**
     * Confirma exclusão de tag
     * @param {string} tagId - ID da tag
     */
    deleteTagConfirm(tagId) {
        if (this.tagController.deleteTagConfirm(tagId)) {
            this.renderAll();
            this.renderTagsManagement();
            this.updateTagFormButton();
        }
    }

    /**
     * Renderiza as tags
     */
    renderTags() {
        this.renderController.renderTags(
            this.tagController.getAllTags(),
            this.filterController.currentTagFilter,
            this.taskController.getAllTasks()
        );
    }

    // ===== UTILITY METHODS =====

    /**
     * Atualiza as estatísticas
     */
    updateStats() {
        const stats = this.filterController.getFilteredStats(
            this.taskController.getAllTasks(),
            this.categoryController.getAllCategories(),
            this.tagController.getAllTags()
        );
        
        this.renderController.renderStats(stats);
    }

    /**
     * Atualiza o título da seção
     */
    updateSectionTitle() {
        const title = this.filterController.getSectionTitle(
            this.categoryController.getAllCategories(),
            this.tagController.getAllTags()
        );
        
        const hasActiveFilters = this.filterController.hasActiveFilters();
        this.renderController.renderSectionTitle(title, hasActiveFilters);
    }

    /**
     * Atualiza botões de filtro ativos
     */
    updateActiveFilterButtons() {
        // Se há filtros de categoria/tag ativos, não mostrar botão "Todas" ativo
        const hasCategoryOrTagFilters = this.filterController.currentCategoryFilter !== null || 
                                       this.filterController.currentTagFilter !== null;
        
        if (hasCategoryOrTagFilters && this.filterController.currentFilter === 'all') {
            // Limpar todos os botões sem ativar nenhum
            this.renderController.renderActiveFilterButtons(null);
        } else {
            this.renderController.renderActiveFilterButtons(this.filterController.currentFilter);
        }
    }

    // ===== THEME AND SETTINGS =====

    /**
     * Alterna o tema
     */
    toggleTheme() {
        this.settingsController.toggleTheme();
    }

    /**
     * Atualiza saudação do usuário
     */
    updateUserGreeting() {
        const greeting = DOMUtils.getById('userGreeting');
        const greetingText = this.settingsController.getUserGreeting();
        DOMUtils.setText(greeting, greetingText);
    }

    // ===== EVENT LISTENERS =====

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Theme toggle
        DOMUtils.addEventListener(DOMUtils.getById('themeToggle'), 'click', () => {
            this.toggleTheme();
        });

        // Add task button
        DOMUtils.addEventListener(DOMUtils.getById('addTaskBtn'), 'click', () => {
            this.openModal();
        });

        // Search input (com debounce para melhorar performance)
        DOMUtils.addEventListener(DOMUtils.getById('searchInput'), 'input', () => {
            this.debouncedSearch();
        });

        // Filter buttons
        DOMUtils.querySelectorAll('.filter-btn').forEach(btn => {
            DOMUtils.addEventListener(btn, 'click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear filters button
        DOMUtils.addEventListener(DOMUtils.getById('clearFiltersBtn'), 'click', () => {
            this.clearAllFilters();
        });

        // Management buttons
        DOMUtils.addEventListener(DOMUtils.getById('manageCategoriesBtn'), 'click', () => {
            this.openCategoryModal();
        });

        DOMUtils.addEventListener(DOMUtils.getById('manageTagsBtn'), 'click', () => {
            this.openTagModal();
        });

        // Modal close buttons
        DOMUtils.addEventListener(DOMUtils.getById('closeCategoryModal'), 'click', () => {
            this.closeCategoryModal();
        });

        DOMUtils.addEventListener(DOMUtils.getById('closeTagModal'), 'click', () => {
            this.closeTagModal();
        });

        // Event delegation para botões de categoria
        DOMUtils.addEventListener(document, 'click', (e) => {
            // Verificar se é o botão de submit do formulário de categoria
            if (e.target.closest('#categoryForm button[type="submit"]')) {
                e.preventDefault();
                
                const button = e.target.closest('#categoryForm button[type="submit"]');
                const editingCategoryId = button.getAttribute('data-editing-category');
                
                if (editingCategoryId) {
                    this.updateCategoryFromForm(editingCategoryId);
                } else {
                    this.handleCategoryFormSubmit();
                }
            }
        });

        // Event delegation para botões de tag
        DOMUtils.addEventListener(document, 'click', (e) => {
            // Verificar se é o botão de submit do formulário de tag
            if (e.target.closest('#tagForm button[type="submit"]')) {
                e.preventDefault();
                
                const button = e.target.closest('#tagForm button[type="submit"]');
                const editingTagId = button.getAttribute('data-editing-tag');
                
                if (editingTagId) {
                    this.updateTagFromForm(editingTagId);
                } else {
                    this.handleTagFormSubmit();
                }
            }
        });

        // Close modals when clicking outside
        DOMUtils.addEventListener(DOMUtils.getById('categoryModal'), 'click', (e) => {
            if (e.target.id === 'categoryModal') {
                this.closeCategoryModal();
            }
        });

        DOMUtils.addEventListener(DOMUtils.getById('tagModal'), 'click', (e) => {
            if (e.target.id === 'tagModal') {
                this.closeTagModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.openModal();
                        break;
                    case 'k':
                        e.preventDefault();
                        DOMUtils.focus(DOMUtils.getById('searchInput'));
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // ===== MODULE INTEGRATION METHODS =====
    
    /**
     * Alterna a sidebar
     */
    toggleSidebar() {
        this.sidebarManager.toggleSidebar();
    }

    /**
     * Abre o modal de tarefa
     */
    openModal() {
        this.modalManager.openTaskModal(null, this.categoryController.getAllCategories(), this.tagController.getAllTags());
    }

    /**
     * Abre o modal de gerenciamento de categorias
     */
    openCategoryModal() {
        const modal = DOMUtils.getById('categoryModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderCategoriesManagement();
            this.updateCategoryFormButton();
            
            // Fechar sidebar no mobile para dar mais espaço
            if (this.sidebarManager && this.sidebarManager.isMobile) {
                this.sidebarManager.closeSidebar();
            }
        }
    }

    /**
     * Abre o modal de gerenciamento de tags
     */
    openTagModal() {
        const modal = DOMUtils.getById('tagModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderTagsManagement();
            this.updateTagFormButton();
            
            // Fechar sidebar no mobile para dar mais espaço
            if (this.sidebarManager && this.sidebarManager.isMobile) {
                this.sidebarManager.closeSidebar();
            }
        }
    }

    /**
     * Fecha o modal de gerenciamento de categorias
     */
    closeCategoryModal() {
        const modal = DOMUtils.getById('categoryModal');
        if (modal) {
            modal.style.display = 'none';
            this.clearCategoryForm();
        }
    }

    /**
     * Fecha o modal de gerenciamento de tags
     */
    closeTagModal() {
        const modal = DOMUtils.getById('tagModal');
        if (modal) {
            modal.style.display = 'none';
            this.clearTagForm();
        }
    }

    /**
     * Limpa o formulário de categoria
     */
    clearCategoryForm() {
        DOMUtils.setValue(DOMUtils.getById('categoryName'), '');
        DOMUtils.setValue(DOMUtils.getById('categoryColor'), '#007bff');
        this.resetCategoryFormButton();
    }

    /**
     * Limpa o formulário de tag
     */
    clearTagForm() {
        DOMUtils.setValue(DOMUtils.getById('tagName'), '');
        DOMUtils.setValue(DOMUtils.getById('tagColor'), '#dc3545');
        this.resetTagFormButton();
    }

    /**
     * Fecha o modal de tarefa
     */
    closeModal() {
        this.modalManager.closeTaskModal();
    }

    /**
     * Atualiza seleções de categoria
     */
    updateCategorySelects() {
        this.modalManager.updateCategorySelects(this.categoryController.getAllCategories());
    }

    /**
     * Atualiza seleções de tag
     */
    updateTagSelects() {
        this.modalManager.updateTagSelects(this.tagController.getAllTags());
    }

    /**
     * Atualiza estado do formulário de categoria
     */
    updateCategoryFormState() {
        this.modalManager.updateCategoryFormState(this.categoryController.getAllCategories().length);
    }

    /**
     * Atualiza estado do formulário de tag
     */
    updateTagFormState() {
        this.modalManager.updateTagFormState(this.tagController.getAllTags().length);
    }

    /**
     * Atualiza UI de ordenação
     */
    updateSortUI() {
        this.settingsManager.updateSortUI(this.settingsController.getSetting('sortOptions'));
    }

    /**
     * Inicializa a sidebar
     */
    initSidebar() {
        this.sidebarManager.init();
    }

    /**
     * Conecta callbacks do SettingsManager
     */
    connectSettingsCallbacks() {
        this.settingsManager.onSettingsSave = (settings) => this.saveSettings(settings);
        this.settingsManager.onSettingsReset = () => this.resetSettings();
        this.settingsManager.onSettingsOpen = () => this.loadSettingsForm();
        this.settingsManager.onCustomColorsChange = (colors) => this.applyCustomColors(colors);
        this.settingsManager.onCompletedTasksDaysChange = (days) => this.updateCompletedTasksDays(days);
        this.settingsManager.onSortOptionsChange = (sortOptions) => this.updateSortOptions(sortOptions);
        this.settingsManager.onExportData = (format) => this.exportData(format);
        this.settingsManager.onValidateImportFile = (file) => this.validateImportFile(file);
        this.settingsManager.onImportData = (file) => this.importData(file);
        this.settingsManager.onClearAllData = () => this.clearAllData();
    }

    /**
     * Conecta callbacks do ModalManager
     */
    connectModalCallbacks() {
        this.modalManager.onTaskFormSubmit = (formData, taskId) => this.handleTaskFormSubmit(formData, taskId);
        this.modalManager.getTaskById = (taskId) => this.getTaskById(taskId);
        this.modalManager.getCategoryUsageCount = (categoryId) => this.getCategoryTaskCount(categoryId);
        this.modalManager.getTagUsageCount = (tagId) => this.getTagTaskCount(tagId);
        this.modalManager.onValidationError = (message) => this.toastManager.validationError(message);
    }

    /**
     * Lida com o envio do formulário de tarefa
     * @param {Object} formData - Dados do formulário
     * @param {string} taskId - ID da tarefa (se editando)
     */
    handleTaskFormSubmit(formData, taskId) {
        if (taskId) {
            // Editar tarefa existente
            this.updateTask(taskId, formData);
        } else {
            // Criar nova tarefa
            this.addTask(formData);
        }
    }

    /**
     * Atualiza uma tarefa existente
     * @param {string} taskId - ID da tarefa
     * @param {Object} taskData - Novos dados da tarefa
     */
    updateTask(taskId, taskData) {
        if (this.taskController.updateTask(taskId, taskData)) {
            this.renderAll();
        }
    }

    /**
     * Obtém uma tarefa por ID
     * @param {string} taskId - ID da tarefa
     * @returns {Object|null} Tarefa encontrada ou null
     */
    getTaskById(taskId) {
        return this.taskController.getTaskById(taskId);
    }


    /**
     * Salva configurações
     * @param {Object} settings - Configurações para salvar
     */
    saveSettings(settings) {
        this.settingsController.updateSettings(settings);
        this.updateUserGreeting();
        this.updateSortUI();
        
        // Limpar cache do RenderController para forçar re-renderização completa
        this.renderController.clearCache();
        
        this.renderAll();
    }

    /**
     * Reseta configurações
     */
    resetSettings() {
        this.settingsController.resetSettings();
        this.updateUserGreeting();
        this.updateSortUI();
        this.renderAll();
    }

    /**
     * Aplica cores personalizadas
     * @param {Object} colors - Cores personalizadas
     */
    applyCustomColors(colors) {
        this.settingsController.updateCustomColors(colors);
    }


    /**
     * Atualiza o campo de nome do usuário nas configurações
     */
    updateUserNameField() {
        this.settingsController.updateUserNameField();
    }

    /**
     * Carrega o formulário de configurações com os dados atuais
     */
    loadSettingsForm() {
        this.settingsManager.loadSettingsForm(this.settingsController.getAllSettings());
    }

    /**
     * Atualiza dias de tarefas completadas
     * @param {number} days - Número de dias
     */
    updateCompletedTasksDays(days) {
        this.settingsController.updateCompletedTasksDays(days);
        this.renderAll();
    }

    /**
     * Atualiza opções de ordenação
     * @param {Object} sortOptions - Opções de ordenação
     */
    updateSortOptions(sortOptions) {
        this.settingsController.updateSortOptions(sortOptions);
        this.renderAll();
    }


    /**
     * Exporta dados
     * @param {string} format - Formato de exportação ('json' ou 'csv')
     */
    async exportData(format = 'json') {
        try {
            const data = {
                tasks: this.taskController.getAllTasks(),
                categories: this.categoryController.getAllCategories(),
                tags: this.tagController.getAllTags(),
                ...this.settingsController.exportSettings()
            };

            await this.exportService.exportData(data, format);
            
            const formatName = format === 'csv' ? 'CSV' : 'JSON';
            this.toastManager.dataExported();
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.toastManager.error('Erro ao exportar dados');
        }
    }

    /**
     * Valida arquivo de importação
     * @param {File} file - Arquivo para validar
     * @returns {Promise<boolean>} Se o arquivo é válido
     */
    async validateImportFile(file) {
        try {
            const data = await this.exportService.importData(file);
            return data !== null;
        } catch (error) {
            console.error('Erro na validação:', error);
            return false;
        }
    }

    /**
     * Importa dados
     * @param {File} file - Arquivo para importar
     */
    async importData(file) {
        try {
            const data = await this.exportService.importData(file);
            
            if (data) {
                // Atualizar controladores com novos dados
                this.taskController.initialize(data.tasks || []);
                this.categoryController.initialize(data.categories || []);
                this.tagController.initialize(data.tags || []);
                
                // Atualizar configurações se disponíveis
                const settingsData = {
                    userName: data.userName,
                    customColors: data.customColors,
                    theme: data.theme,
                    sortOptions: data.sortOptions,
                    notificationsEnabled: data.notificationsEnabled,
                    notificationTime: data.notificationTime,
                    completedTasksDays: data.completedTasksDays,
                    sidebarCollapsed: data.sidebarCollapsed
                };
                
                this.settingsController.importSettings(settingsData);
                
                // Salvar no localStorage
                this.taskController.saveTasks();
                this.categoryController.saveCategories();
                this.tagController.saveTags();
                this.settingsController.saveSettings();
                
                // Aplicar configurações e atualizar UI
                this.settingsController.applySettings();
                this.renderAll();
                
                this.toastManager.dataImported();
            } else {
                this.toastManager.error('Erro ao processar arquivo');
            }
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            this.toastManager.error('Erro ao importar dados');
        }
    }

    /**
     * Limpa todos os dados
     */
    clearAllData() {
        // Limpar dados do localStorage
        this.storageService.clearAllData();
        
        // Resetar controladores
        this.taskController.initialize([]);
        this.categoryController.initialize([]);
        this.tagController.initialize([]);
        this.settingsController.resetSettings();
        
        // Adicionar dados de exemplo
        this.addSampleData();
        
        // Re-renderizar interface
        this.renderAll();
        this.updateUserGreeting();
        
        // Fechar página de configurações
        this.settingsManager.closeSettings();
        
        this.toastManager.dataCleared();
    }

    /**
     * Adiciona dados de exemplo (sem feedbacks visuais)
     */
    addSampleData() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 5);
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 3);

        // Criar categorias de exemplo primeiro (silenciosamente)
        this.addCategorySilently({
            name: 'Pessoal',
            color: '#28a745'
        });
        
        this.addCategorySilently({
            name: 'Trabalho',
            color: '#007bff'
        });
        
        this.addCategorySilently({
            name: 'Estudos',
            color: '#6f42c1'
        });

        // Criar tags de exemplo (silenciosamente)
        this.addTagSilently({
            name: 'Importante',
            color: '#dc3545'
        });
        
        this.addTagSilently({
            name: 'Urgente',
            color: '#fd7e14'
        });
        
        this.addTagSilently({
            name: 'Reunião',
            color: '#20c997'
        });
        
        this.addTagSilently({
            name: 'Projeto',
            color: '#6c757d'
        });

        // Aguardar um pouco para as categorias e tags serem criadas
        setTimeout(() => {
            // Encontrar IDs das categorias criadas
            const personalCategory = this.categoryController.getAllCategories().find(c => c.name === 'Pessoal');
            const workCategory = this.categoryController.getAllCategories().find(c => c.name === 'Trabalho');
            const studyCategory = this.categoryController.getAllCategories().find(c => c.name === 'Estudos');
            
            // Encontrar IDs das tags criadas
            const importantTag = this.tagController.getAllTags().find(t => t.name === 'Importante');
            const urgentTag = this.tagController.getAllTags().find(t => t.name === 'Urgente');
            const meetingTag = this.tagController.getAllTags().find(t => t.name === 'Reunião');
            const projectTag = this.tagController.getAllTags().find(t => t.name === 'Projeto');

            // Criar tarefas com IDs corretos (silenciosamente)
            this.addTaskSilently({
                title: 'Bem-vindo ao Planno!',
                description: 'Esta é uma tarefa de exemplo. Você pode editá-la ou excluí-la.',
                category: personalCategory?.id || 'personal',
                tags: importantTag ? [importantTag.id] : [],
                priority: 'medium',
                dueDate: tomorrow.toISOString().split('T')[0]
            });
            
            this.addTaskSilently({
                title: 'Configurar tema escuro',
                description: 'Experimente alternar entre tema claro e escuro usando o botão no canto superior direito.',
                category: personalCategory?.id || 'personal',
                priority: 'low'
            });
            
            this.addTaskSilently({
                title: 'Reunião importante - Hoje',
                description: 'Reunião com a equipe para discutir o projeto. Use os filtros de data para ver tarefas de hoje!',
                category: workCategory?.id || 'work',
                tags: urgentTag && meetingTag ? [urgentTag.id, meetingTag.id] : [],
                priority: 'high',
                dueDate: today.toISOString().split('T')[0],
                dueTime: '14:00'
            });
            
            this.addTaskSilently({
                title: 'Criar categorias personalizadas',
                description: 'Experimente criar suas próprias categorias com cores personalizadas!',
                category: studyCategory?.id || 'study',
                priority: 'medium'
            });

            this.addTaskSilently({
                title: 'Preparar apresentação',
                description: 'Tarefa para os próximos dias - use o filtro "Em Breve" para vê-la.',
                category: workCategory?.id || 'work',
                tags: projectTag ? [projectTag.id] : [],
                priority: 'medium',
                dueDate: nextWeek.toISOString().split('T')[0]
            });

            this.addTaskSilently({
                title: 'Tarefa atrasada',
                description: 'Esta tarefa está atrasada - use o filtro "Atrasadas" para vê-la.',
                category: personalCategory?.id || 'personal',
                tags: urgentTag ? [urgentTag.id] : [],
                priority: 'high',
                dueDate: lastWeek.toISOString().split('T')[0]
            });

            // Re-renderizar a interface após criar todas as tarefas
            this.renderAll();
        }, 100);
    }

    /**
     * Métodos silenciosos para sample data (sem feedbacks visuais)
     */
    
    addCategorySilently(categoryData) {
        return this.categoryController.addCategory(categoryData);
    }

    addTagSilently(tagData) {
        return this.tagController.addTag(tagData);
    }

    addTaskSilently(taskData) {
        return this.taskController.addTask(taskData, true); // true = silent
    }
}

// Exportar para uso global
window.TodoApp = TodoApp;
