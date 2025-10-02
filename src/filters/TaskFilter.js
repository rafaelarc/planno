/**
 * TaskFilter - Filtros de tarefas
 * Responsável por filtrar e ordenar tarefas
 * 
 * Funcionalidades:
 * - Filtros por status (pendente, concluída, recorrente, etc.)
 * - Filtros por data (hoje, em breve, atrasadas)
 * - Filtros por prioridade
 * - Filtros por categoria
 * - Filtros por tags
 * - Ordenação dinâmica
 * - Filtros combinados
 */
class TaskFilter {
    constructor() {
        this.currentFilter = 'all';
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
        this.sortOptions = {
            field: 'createdAt',
            direction: 'desc'
        };
        this.completedTasksDays = 30;
    }

    /**
     * Define o filtro atual
     * @param {string} filter - Tipo de filtro
     */
    setFilter(filter) {
        this.currentFilter = filter;
        // Limpa filtros de categoria e tag quando usa filtros de status
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
    }

    /**
     * Define o filtro por categoria
     * @param {string} categoryId - ID da categoria
     */
    setCategoryFilter(categoryId) {
        // Se já está filtrado por esta categoria, desfazer o filtro
        if (this.currentCategoryFilter === categoryId) {
            this.currentCategoryFilter = null;
        } else {
            this.currentCategoryFilter = categoryId;
        }
        this.currentFilter = 'all'; // Volta para "todas" quando filtra por categoria
    }

    /**
     * Define o filtro por tag
     * @param {string} tagId - ID da tag
     */
    setTagFilter(tagId) {
        // Se já está filtrado por esta tag, desfazer o filtro
        if (this.currentTagFilter === tagId) {
            this.currentTagFilter = null;
        } else {
            this.currentTagFilter = tagId;
        }
        this.currentFilter = 'all'; // Volta para "todas" quando filtra por tag
    }

    /**
     * Limpa todos os filtros
     */
    clearAllFilters() {
        this.currentFilter = 'all';
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
    }

    /**
     * Define as opções de ordenação
     * @param {Object} options - Opções de ordenação
     */
    setSortOptions(options) {
        this.sortOptions = { ...this.sortOptions, ...options };
    }

    /**
     * Define o número de dias para mostrar tarefas concluídas
     * @param {number} days - Número de dias
     */
    setCompletedTasksDays(days) {
        this.completedTasksDays = days;
    }

    /**
     * Filtra uma lista de tarefas
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @param {string} searchTerm - Termo de busca
     * @returns {Array} Lista filtrada e ordenada
     */
    filterTasks(tasks, categories = [], tags = [], searchTerm = '') {
        let filtered = [...tasks];

        // Aplicar filtro de status (sempre aplicado)
        filtered = this.applyStatusFilter(filtered);

        // Aplicar filtro de prioridade (independente de categoria/tag)
        filtered = this.applyPriorityFilter(filtered);

        // Coletar filtros de categoria/tag (que se combinam)
        const activeFilters = [];
        
        if (this.currentCategoryFilter) {
            activeFilters.push({
                type: 'category',
                filter: (task) => task.category === this.currentCategoryFilter
            });
        }

        if (this.currentTagFilter) {
            activeFilters.push({
                type: 'tag',
                filter: (task) => task.tags && task.tags.includes(this.currentTagFilter)
            });
        }

        if (searchTerm) {
            activeFilters.push({
                type: 'search',
                filter: (task) => this.matchesSearchTerm(task, searchTerm, categories, tags)
            });
        }

        // Aplicar filtros de categoria/tag com AND logic
        activeFilters.forEach(({ filter }) => {
            filtered = filtered.filter(filter);
        });

        // Ordenar tarefas
        return this.sortTasks(filtered, categories, tags);
    }

    /**
     * Verifica se uma tarefa corresponde ao termo de busca
     * @param {Object} task - Tarefa para verificar
     * @param {string} searchTerm - Termo de busca
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {boolean}
     */
    matchesSearchTerm(task, searchTerm, categories = [], tags = []) {
        const term = searchTerm.toLowerCase();
        
        // Buscar no título
        const titleMatch = task.title.toLowerCase().includes(term);
        
        // Buscar na descrição
        const descriptionMatch = task.description.toLowerCase().includes(term);
        
        // Buscar na categoria
        const category = categories.find(cat => cat.id === task.category);
        const categoryMatch = category && category.name.toLowerCase().includes(term);
        
        // Buscar nas tags
        let tagMatch = false;
        if (task.tags && task.tags.length > 0) {
            const taskTags = task.tags.map(tagId => 
                tags.find(tag => tag.id === tagId)
            ).filter(tag => tag);
            tagMatch = taskTags.some(tag => tag.name.toLowerCase().includes(term));
        }
        
        return titleMatch || descriptionMatch || categoryMatch || tagMatch;
    }

    /**
     * Filtra tarefas apenas por categoria e tag (para estatísticas)
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Array} Lista filtrada apenas por categoria e tag
     */
    filterTasksByCategoryAndTag(tasks, categories = [], tags = []) {
        let filtered = [...tasks];

        // Aplicar apenas filtro de categoria
        if (this.currentCategoryFilter) {
            filtered = filtered.filter(task => task.category === this.currentCategoryFilter);
        }

        // Aplicar apenas filtro de tag
        if (this.currentTagFilter) {
            filtered = filtered.filter(task => 
                task.tags && task.tags.includes(this.currentTagFilter)
            );
        }

        return filtered;
    }

    /**
     * Aplica filtros de status
     * @param {Array} tasks - Lista de tarefas
     * @returns {Array} Lista filtrada
     */
    applyStatusFilter(tasks) {
        let filtered = [...tasks];

        switch (this.currentFilter) {
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                // Aplicar filtro de dias para tarefas concluídas
                if (this.completedTasksDays > 0) {
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - this.completedTasksDays);
                    filtered = filtered.filter(task => {
                        const completedDate = new Date(task.completedAt || task.createdAt);
                        return completedDate >= cutoffDate;
                    });
                }
                break;
            case 'recurring':
                filtered = filtered.filter(task => task.isRecurring);
                break;
            case 'today':
                filtered = filtered.filter(task => this.isTaskDueToday(task));
                break;
            case 'upcoming':
                filtered = filtered.filter(task => this.isTaskUpcoming(task));
                break;
            case 'overdue':
                filtered = filtered.filter(task => this.isTaskOverdue(task));
                break;
        }

        // Esconder tarefas concluídas de todos os filtros exceto 'completed'
        if (this.currentFilter !== 'completed') {
            filtered = filtered.filter(task => !task.completed);
        }

        return filtered;
    }

    /**
     * Aplica filtro de prioridade (independente de categoria/tag)
     * @param {Array} tasks - Lista de tarefas
     * @returns {Array} Lista filtrada
     */
    applyPriorityFilter(tasks) {
        // Se o filtro atual é de prioridade, aplicar
        if (['low', 'medium', 'high'].includes(this.currentFilter)) {
            return tasks.filter(task => task.priority === this.currentFilter);
        }
        
        // Se não é filtro de prioridade, retornar todas as tarefas
        return tasks;
    }

    /**
     * Ordena uma lista de tarefas
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Array} Lista ordenada
     */
    sortTasks(tasks, categories = [], tags = []) {
        const sortedTasks = [...tasks];
        
        sortedTasks.sort((a, b) => {
            let aValue, bValue;
            
            switch (this.sortOptions.field) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                    
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    aValue = priorityOrder[a.priority] || 0;
                    bValue = priorityOrder[b.priority] || 0;
                    break;
                    
                case 'status':
                    aValue = a.completed ? 1 : 0;
                    bValue = b.completed ? 1 : 0;
                    break;
                    
                case 'category':
                    const categoryA = categories.find(cat => cat.id === a.category);
                    const categoryB = categories.find(cat => cat.id === b.category);
                    aValue = categoryA ? categoryA.name.toLowerCase() : '';
                    bValue = categoryB ? categoryB.name.toLowerCase() : '';
                    break;
                    
                case 'tags':
                    const tagsA = a.tags ? a.tags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? tag.name.toLowerCase() : '';
                    }).sort().join(',') : '';
                    const tagsB = b.tags ? b.tags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? tag.name.toLowerCase() : '';
                    }).sort().join(',') : '';
                    aValue = tagsA;
                    bValue = tagsB;
                    break;
                    
                case 'dueDate':
                    aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    break;
                    
                case 'createdAt':
                default:
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
            }
            
            if (aValue < bValue) {
                return this.sortOptions.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return this.sortOptions.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        return sortedTasks;
    }

    /**
     * Verifica se uma tarefa vence hoje
     * @param {Object} task - Tarefa para verificar
     * @returns {boolean}
     */
    isTaskDueToday(task) {
        // Usar a mesma lógica do DateUtils que cria as marcações visuais
        return DateUtils.isTaskDueToday(task);
    }

    /**
     * Verifica se uma tarefa está próxima (próximos 7 dias)
     * @param {Object} task - Tarefa para verificar
     * @returns {boolean}
     */
    isTaskUpcoming(task) {
        // Usar a mesma lógica do DateUtils que cria as marcações visuais
        return DateUtils.isTaskUpcoming(task);
    }

    /**
     * Verifica se uma tarefa está vencida
     * @param {Object} task - Tarefa para verificar
     * @returns {boolean}
     */
    isTaskOverdue(task) {
        // Usar a mesma lógica do DateUtils que cria as marcações visuais
        return DateUtils.isTaskOverdue(task);
    }

    /**
     * Obtém o título da seção baseado nos filtros ativos
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {string} Título da seção
     */
    getSectionTitle(categories = [], tags = []) {
        let title = 'Todas as Tarefas';
        const filters = [];

        // Títulos dos filtros de status
        const statusTitles = {
            all: 'Todas as Tarefas',
            completed: 'Tarefas Concluídas',
            recurring: 'Tarefas Recorrentes',
            today: 'Tarefas de Hoje',
            upcoming: 'Tarefas em Breve',
            overdue: 'Tarefas Atrasadas',
            low: 'Tarefas de Baixa Prioridade',
            medium: 'Tarefas de Média Prioridade',
            high: 'Tarefas de Alta Prioridade'
        };

        // Se usando filtros de status, usar o título do status como base
        if (this.currentFilter !== 'all') {
            title = statusTitles[this.currentFilter] || 'Todas as Tarefas';
        }

        // Adicionar filtro de categoria ao título
        if (this.currentCategoryFilter) {
            const category = categories.find(cat => cat.id === this.currentCategoryFilter);
            if (category) {
                filters.push(category.name);
            }
        }

        // Adicionar filtro de tag ao título
        if (this.currentTagFilter) {
            const tag = tags.find(t => t.id === this.currentTagFilter);
            if (tag) {
                filters.push(tag.name);
            }
        }

        // Construir título combinado
        if (filters.length > 0) {
            if (this.currentFilter !== 'all') {
                title = `${title} - ${filters.join(' + ')}`;
            } else {
                title = `Tarefas - ${filters.join(' + ')}`;
            }
        }

        return title;
    }

    /**
     * Verifica se há filtros ativos
     * @returns {boolean}
     */
    hasActiveFilters() {
        return this.currentCategoryFilter !== null || this.currentTagFilter !== null;
    }

    /**
     * Obtém informações sobre os filtros ativos
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Object} Informações dos filtros
     */
    getActiveFiltersInfo(categories = [], tags = []) {
        const activeFilters = [];

        if (this.currentCategoryFilter) {
            const category = categories.find(cat => cat.id === this.currentCategoryFilter);
            if (category) {
                activeFilters.push({
                    type: 'category',
                    id: category.id,
                    name: category.name,
                    color: category.color
                });
            }
        }

        if (this.currentTagFilter) {
            const tag = tags.find(t => t.id === this.currentTagFilter);
            if (tag) {
                activeFilters.push({
                    type: 'tag',
                    id: tag.id,
                    name: tag.name,
                    color: tag.color
                });
            }
        }

        return {
            hasActive: activeFilters.length > 0,
            filters: activeFilters,
            count: activeFilters.length
        };
    }

    /**
     * Obtém estatísticas dos filtros
     * @param {Array} tasks - Lista de tarefas
     * @returns {Object} Estatísticas
     */
    getFilterStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = tasks.filter(task => !task.completed).length;
        const overdue = tasks.filter(task => this.isTaskOverdue(task)).length;
        const dueToday = tasks.filter(task => this.isTaskDueToday(task)).length;
        const upcoming = tasks.filter(task => this.isTaskUpcoming(task)).length;
        const recurring = tasks.filter(task => task.isRecurring).length;

        return {
            total,
            completed,
            pending,
            overdue,
            dueToday,
            upcoming,
            recurring
        };
    }

    /**
     * Obtém as opções de ordenação disponíveis
     * @returns {Array} Lista de opções de ordenação
     */
    getSortOptions() {
        return [
            { value: 'createdAt', label: 'Data de Criação' },
            { value: 'title', label: 'Título' },
            { value: 'priority', label: 'Prioridade' },
            { value: 'status', label: 'Status' },
            { value: 'category', label: 'Categoria' },
            { value: 'tags', label: 'Tags' },
            { value: 'dueDate', label: 'Data de Vencimento' }
        ];
    }

    /**
     * Obtém as opções de direção de ordenação
     * @returns {Array} Lista de direções
     */
    getSortDirections() {
        return [
            { value: 'asc', label: 'Crescente' },
            { value: 'desc', label: 'Decrescente' }
        ];
    }

    /**
     * Obtém o estado atual dos filtros
     * @returns {Object} Estado dos filtros
     */
    getState() {
        return {
            currentFilter: this.currentFilter,
            currentCategoryFilter: this.currentCategoryFilter,
            currentTagFilter: this.currentTagFilter,
            sortOptions: { ...this.sortOptions },
            completedTasksDays: this.completedTasksDays
        };
    }

    /**
     * Testa todos os tipos de filtros para identificar problemas
     * @param {Array} tasks - Lista de tarefas para testar
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Object} Resultado dos testes
     */
    testAllFilters(tasks, categories = [], tags = []) {
        const results = {
            totalTasks: tasks.length,
            tests: {}
        };

        // Teste 1: Sem filtros
        results.tests.noFilters = {
            description: 'Sem filtros',
            result: this.filterTasks(tasks, categories, tags, '').length
        };

        // Teste 2: Apenas busca
        results.tests.searchOnly = {
            description: 'Apenas busca por "tarefa"',
            result: this.filterTasks(tasks, categories, tags, 'tarefa').length
        };

        // Teste 3: Apenas categoria
        if (categories.length > 0) {
            const categoryId = categories[0].id;
            this.currentCategoryFilter = categoryId;
            results.tests.categoryOnly = {
                description: `Apenas categoria "${categories[0].name}"`,
                result: this.filterTasks(tasks, categories, tags, '').length
            };
            this.currentCategoryFilter = null;
        }

        // Teste 4: Apenas tag
        if (tags.length > 0) {
            const tagId = tags[0].id;
            this.currentTagFilter = tagId;
            results.tests.tagOnly = {
                description: `Apenas tag "${tags[0].name}"`,
                result: this.filterTasks(tasks, categories, tags, '').length
            };
            this.currentTagFilter = null;
        }

        // Teste 5: Categoria + Tag (AND logic)
        if (categories.length > 0 && tags.length > 0) {
            this.currentCategoryFilter = categories[0].id;
            this.currentTagFilter = tags[0].id;
            results.tests.categoryAndTag = {
                description: `Categoria "${categories[0].name}" AND Tag "${tags[0].name}" (ambos)`,
                result: this.filterTasks(tasks, categories, tags, '').length
            };
            this.currentCategoryFilter = null;
            this.currentTagFilter = null;
        }

        // Teste 6: Categoria + Busca (AND logic)
        if (categories.length > 0) {
            this.currentCategoryFilter = categories[0].id;
            results.tests.categoryAndSearch = {
                description: `Categoria "${categories[0].name}" AND Busca "tarefa" (ambos)`,
                result: this.filterTasks(tasks, categories, tags, 'tarefa').length
            };
            this.currentCategoryFilter = null;
        }

        // Teste 7: Tag + Busca (AND logic)
        if (tags.length > 0) {
            this.currentTagFilter = tags[0].id;
            results.tests.tagAndSearch = {
                description: `Tag "${tags[0].name}" AND Busca "tarefa" (ambos)`,
                result: this.filterTasks(tasks, categories, tags, 'tarefa').length
            };
            this.currentTagFilter = null;
        }

        // Teste 8: Todos os filtros (AND logic)
        if (categories.length > 0 && tags.length > 0) {
            this.currentCategoryFilter = categories[0].id;
            this.currentTagFilter = tags[0].id;
            results.tests.allFilters = {
                description: `Todos: Categoria "${categories[0].name}" AND Tag "${tags[0].name}" AND Busca "tarefa" (todos)`,
                result: this.filterTasks(tasks, categories, tags, 'tarefa').length
            };
            this.currentCategoryFilter = null;
            this.currentTagFilter = null;
        }

        return results;
    }

    /**
     * Testa especificamente filtros combinados para validar lógica AND
     * @param {Array} tasks - Lista de tarefas para testar
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Object} Resultado dos testes específicos
     */
    testCombinedFilters(tasks, categories = [], tags = []) {
        const results = {
            totalTasks: tasks.length,
            tests: {}
        };

        if (categories.length === 0 || tags.length === 0) {
            results.error = 'Necessário pelo menos 1 categoria e 1 tag para testar filtros combinados';
            return results;
        }

        const category = categories[0];
        const tag = tags[0];

        // Teste 1: Apenas categoria
        this.currentCategoryFilter = category.id;
        this.currentTagFilter = null;
        const categoryOnly = this.filterTasks(tasks, categories, tags, '');
        results.tests.categoryOnly = {
            description: `Apenas categoria "${category.name}"`,
            result: categoryOnly.length,
            tasks: categoryOnly.map(t => t.title)
        };

        // Teste 2: Apenas tag
        this.currentCategoryFilter = null;
        this.currentTagFilter = tag.id;
        const tagOnly = this.filterTasks(tasks, categories, tags, '');
        results.tests.tagOnly = {
            description: `Apenas tag "${tag.name}"`,
            result: tagOnly.length,
            tasks: tagOnly.map(t => t.title)
        };

        // Teste 3: Categoria + Tag (AND logic)
        this.currentCategoryFilter = category.id;
        this.currentTagFilter = tag.id;
        const categoryAndTag = this.filterTasks(tasks, categories, tags, '');
        results.tests.categoryAndTag = {
            description: `Categoria "${category.name}" AND Tag "${tag.name}"`,
            result: categoryAndTag.length,
            tasks: categoryAndTag.map(t => t.title),
            expected: 'Tarefas que são da categoria E têm a tag'
        };

        // Verificar se a lógica AND está correta
        const expectedTasks = tasks.filter(task => 
            task.category === category.id && 
            task.tags && task.tags.includes(tag.id)
        );
        
        results.validation = {
            expectedCount: expectedTasks.length,
            actualCount: categoryAndTag.length,
            isCorrect: expectedTasks.length === categoryAndTag.length,
            expectedTasks: expectedTasks.map(t => t.title),
            actualTasks: categoryAndTag.map(t => t.title)
        };

        // Limpar filtros
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;

        return results;
    }

    /**
     * Restaura o estado dos filtros
     * @param {Object} state - Estado para restaurar
     */
    setState(state) {
        this.currentFilter = state.currentFilter || 'all';
        this.currentCategoryFilter = state.currentCategoryFilter || null;
        this.currentTagFilter = state.currentTagFilter || null;
        this.sortOptions = { ...this.sortOptions, ...state.sortOptions };
        this.completedTasksDays = state.completedTasksDays || 30;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskFilter;
} else {
    window.TaskFilter = TaskFilter;
}
