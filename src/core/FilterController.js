/**
 * FilterController - Gerencia filtros e busca
 * Responsável por toda lógica de filtros, busca e ordenação
 */
class FilterController {
    constructor(taskFilter, searchFilter) {
        this.taskFilter = taskFilter;
        this.searchFilter = searchFilter;
        
        // Estado dos filtros
        this.currentFilter = 'all';
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
        this.currentSearchTerm = '';
    }

    /**
     * Inicializa o controlador
     * @param {Object} options - Opções de inicialização
     */
    initialize(options = {}) {
        this.currentFilter = options.currentFilter || 'all';
        this.currentCategoryFilter = options.currentCategoryFilter || null;
        this.currentTagFilter = options.currentTagFilter || null;
        this.currentSearchTerm = options.currentSearchTerm || '';
    }

    /**
     * Define o filtro atual
     * @param {string} filter - Tipo de filtro
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.taskFilter.setFilter(filter);
        
        // Limpar filtros de categoria/tag quando usar outros filtros
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
    }

    /**
     * Filtra por categoria
     * @param {string} categoryId - ID da categoria
     */
    setCategoryFilter(categoryId) {
        this.currentCategoryFilter = categoryId;
        this.taskFilter.setCategoryFilter(categoryId);
        
        // Limpar visualmente os botões de prioridade/status (SEM mexer na lógica)
        this.currentFilter = 'all';
    }

    /**
     * Filtra por tag
     * @param {string} tagId - ID da tag
     */
    setTagFilter(tagId) {
        this.currentTagFilter = tagId;
        this.taskFilter.setTagFilter(tagId);
        
        // Limpar visualmente os botões de prioridade/status (SEM mexer na lógica)
        this.currentFilter = 'all';
    }

    /**
     * Define termo de busca
     * @param {string} searchTerm - Termo de busca
     */
    setSearchTerm(searchTerm) {
        this.currentSearchTerm = searchTerm;
        this.searchFilter.setSearchTerm(searchTerm);
    }

    /**
     * Limpa todos os filtros
     */
    clearAllFilters() {
        this.currentFilter = 'all';
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
        this.currentSearchTerm = '';
        
        this.taskFilter.clearAllFilters();
        this.searchFilter.clearSearch();
    }

    /**
     * Obtém tarefas filtradas
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Array} Lista de tarefas filtradas
     */
    getFilteredTasks(tasks, categories, tags) {
        return this.taskFilter.filterTasks(
            tasks,
            categories,
            tags,
            this.currentSearchTerm
        );
    }

    /**
     * Verifica se há filtros ativos
     * @returns {boolean} Se há filtros ativos
     */
    hasActiveFilters() {
        return this.currentCategoryFilter !== null || 
               this.currentTagFilter !== null || 
               this.currentSearchTerm !== '';
    }

    /**
     * Obtém o título da seção baseado nos filtros ativos
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {string} Título da seção
     */
    getSectionTitle(categories, tags) {
        return this.taskFilter.getSectionTitle(categories, tags);
    }

    /**
     * Obtém estatísticas dos filtros
     * @param {Array} tasks - Lista de tarefas
     * @returns {Object} Estatísticas dos filtros
     */
    getFilterStats(tasks) {
        return this.taskFilter.getFilterStats(tasks);
    }

    /**
     * Obtém estatísticas considerando apenas filtros de categoria e tag
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Object} Estatísticas filtradas
     */
    getFilteredStats(tasks, categories, tags) {
        if (this.currentCategoryFilter || this.currentTagFilter) {
            const filteredTasks = this.taskFilter.filterTasksByCategoryAndTag(
                tasks,
                categories,
                tags
            );
            return this.taskFilter.getFilterStats(filteredTasks);
        }
        
        return this.taskFilter.getFilterStats(tasks);
    }

    /**
     * Obtém o estado atual dos filtros
     * @returns {Object} Estado dos filtros
     */
    getFilterState() {
        return {
            currentFilter: this.currentFilter,
            currentCategoryFilter: this.currentCategoryFilter,
            currentTagFilter: this.currentTagFilter,
            currentSearchTerm: this.currentSearchTerm,
            hasActiveFilters: this.hasActiveFilters()
        };
    }

    /**
     * Aplica um estado de filtros
     * @param {Object} filterState - Estado dos filtros
     */
    applyFilterState(filterState) {
        this.currentFilter = filterState.currentFilter || 'all';
        this.currentCategoryFilter = filterState.currentCategoryFilter || null;
        this.currentTagFilter = filterState.currentTagFilter || null;
        this.currentSearchTerm = filterState.currentSearchTerm || '';
        
        // Aplicar no TaskFilter
        this.taskFilter.setFilter(this.currentFilter);
        if (this.currentCategoryFilter) {
            this.taskFilter.setCategoryFilter(this.currentCategoryFilter);
        }
        if (this.currentTagFilter) {
            this.taskFilter.setTagFilter(this.currentTagFilter);
        }
        
        // Aplicar no SearchFilter
        if (this.currentSearchTerm) {
            this.searchFilter.setSearchTerm(this.currentSearchTerm);
        }
    }

    /**
     * Obtém filtros de categoria disponíveis
     * @param {Array} categories - Lista de categorias
     * @param {Array} tasks - Lista de tarefas
     * @returns {Array} Categorias com contagem de tarefas
     */
    getAvailableCategoryFilters(categories, tasks) {
        return categories.map(category => ({
            ...category,
            taskCount: tasks.filter(task => task.category === category.id).length
        })).filter(category => category.taskCount > 0);
    }

    /**
     * Obtém filtros de tag disponíveis
     * @param {Array} tags - Lista de tags
     * @param {Array} tasks - Lista de tarefas
     * @returns {Array} Tags com contagem de tarefas
     */
    getAvailableTagFilters(tags, tasks) {
        return tags.map(tag => ({
            ...tag,
            taskCount: tasks.filter(task => task.tags && task.tags.includes(tag.id)).length
        })).filter(tag => tag.taskCount > 0);
    }

    /**
     * Obtém histórico de busca
     * @returns {Array} Histórico de busca
     */
    getSearchHistory() {
        return this.searchFilter.getSearchHistory();
    }

    /**
     * Adiciona termo ao histórico de busca
     * @param {string} term - Termo de busca
     */
    addToSearchHistory(term) {
        this.searchFilter.addToHistory(term);
    }

    /**
     * Limpa histórico de busca
     */
    clearSearchHistory() {
        this.searchFilter.clearSearchHistory();
    }

    /**
     * Obtém sugestões de busca
     * @param {string} query - Query de busca
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Array} Sugestões de busca
     */
    getSearchSuggestions(query, tasks, categories, tags) {
        return this.searchFilter.getSuggestions(query);
    }

    /**
     * Obtém filtros de data disponíveis
     * @param {Array} tasks - Lista de tarefas
     * @returns {Object} Filtros de data disponíveis
     */
    getDateFilters(tasks) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const overdue = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDate = DateUtils.createLocalDate(task.dueDate);
            return taskDate < today;
        }).length;
        
        const todayTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDate = DateUtils.createLocalDate(task.dueDate);
            return taskDate.getTime() === today.getTime();
        }).length;
        
        const tomorrowTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDate = DateUtils.createLocalDate(task.dueDate);
            return taskDate.getTime() === tomorrow.getTime();
        }).length;
        
        const nextWeekTasks = tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const taskDate = DateUtils.createLocalDate(task.dueDate);
            return taskDate >= today && taskDate <= nextWeek;
        }).length;
        
        return {
            overdue,
            today: todayTasks,
            tomorrow: tomorrowTasks,
            nextWeek: nextWeekTasks
        };
    }
}

// Exportar para uso global
window.FilterController = FilterController;
