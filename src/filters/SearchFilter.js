/**
 * SearchFilter - Filtro de busca
 * Responsável por funcionalidades de busca e pesquisa
 * 
 * Funcionalidades:
 * - Busca por texto em tarefas
 * - Busca em múltiplos campos
 * - Filtros de busca avançados
 * - Histórico de buscas
 * - Sugestões de busca
 */
class SearchFilter {
    constructor() {
        this.searchTerm = '';
        this.searchHistory = this.loadSearchHistory();
        this.maxHistorySize = 10;
        this.minSearchLength = 2;
    }

    /**
     * Define o termo de busca
     * @param {string} term - Termo de busca
     */
    setSearchTerm(term) {
        this.searchTerm = term || '';
    }

    /**
     * Obtém o termo de busca atual
     * @returns {string} Termo de busca
     */
    getSearchTerm() {
        return this.searchTerm;
    }

    /**
     * Verifica se há um termo de busca ativo
     * @returns {boolean}
     */
    hasSearchTerm() {
        return this.searchTerm.length >= this.minSearchLength;
    }

    /**
     * Busca tarefas por termo
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Array} Lista de tarefas encontradas
     */
    searchTasks(tasks, categories = [], tags = []) {
        if (!this.hasSearchTerm()) {
            return tasks;
        }

        const term = this.searchTerm.toLowerCase();
        const results = [];

        tasks.forEach(task => {
            if (this.matchesTask(task, term, categories, tags)) {
                results.push({
                    task,
                    relevanceScore: this.calculateRelevanceScore(task, term, categories, tags)
                });
            }
        });

        // Ordenar por relevância
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Retornar apenas as tarefas
        return results.map(result => result.task);
    }

    /**
     * Verifica se uma tarefa corresponde ao termo de busca
     * @param {Object} task - Tarefa para verificar
     * @param {string} term - Termo de busca
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {boolean}
     */
    matchesTask(task, term, categories = [], tags = []) {
        // Buscar no título
        if (task.title.toLowerCase().includes(term)) {
            return true;
        }

        // Buscar na descrição
        if (task.description && task.description.toLowerCase().includes(term)) {
            return true;
        }

        // Buscar na categoria
        const category = categories.find(cat => cat.id === task.category);
        if (category && category.name.toLowerCase().includes(term)) {
            return true;
        }

        // Buscar nas tags
        if (task.tags && task.tags.length > 0) {
            const taskTags = task.tags.map(tagId => 
                tags.find(tag => tag.id === tagId)
            ).filter(tag => tag);
            
            if (taskTags.some(tag => tag.name.toLowerCase().includes(term))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calcula a pontuação de relevância de uma tarefa
     * @param {Object} task - Tarefa para calcular
     * @param {string} term - Termo de busca
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {number} Pontuação de relevância
     */
    calculateRelevanceScore(task, term, categories = [], tags = []) {
        let score = 0;
        const termLower = term.toLowerCase();

        // Título tem maior peso
        if (task.title.toLowerCase().includes(termLower)) {
            score += 10;
            
            // Bônus se começar com o termo
            if (task.title.toLowerCase().startsWith(termLower)) {
                score += 5;
            }
        }

        // Descrição tem peso médio
        if (task.description && task.description.toLowerCase().includes(termLower)) {
            score += 5;
        }

        // Categoria tem peso baixo
        const category = categories.find(cat => cat.id === task.category);
        if (category && category.name.toLowerCase().includes(termLower)) {
            score += 3;
        }

        // Tags têm peso baixo
        if (task.tags && task.tags.length > 0) {
            const taskTags = task.tags.map(tagId => 
                tags.find(tag => tag.id === tagId)
            ).filter(tag => tag);
            
            taskTags.forEach(tag => {
                if (tag.name.toLowerCase().includes(termLower)) {
                    score += 2;
                }
            });
        }

        // Bônus para tarefas não concluídas
        if (!task.completed) {
            score += 1;
        }

        // Bônus para tarefas de alta prioridade
        if (task.priority === 'high') {
            score += 1;
        }

        return score;
    }

    /**
     * Adiciona um termo ao histórico de busca
     * @param {string} term - Termo para adicionar
     */
    addToHistory(term) {
        if (!term || term.length < this.minSearchLength) {
            return;
        }

        // Remove o termo se já existir
        this.searchHistory = this.searchHistory.filter(item => item !== term);
        
        // Adiciona no início
        this.searchHistory.unshift(term);
        
        // Limita o tamanho do histórico
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
        }

        this.saveSearchHistory();
    }

    /**
     * Obtém o histórico de busca
     * @returns {Array} Lista de termos buscados
     */
    getSearchHistory() {
        return [...this.searchHistory];
    }

    /**
     * Limpa o histórico de busca
     */
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }

    /**
     * Obtém sugestões de busca baseadas no histórico
     * @param {string} partialTerm - Termo parcial
     * @returns {Array} Lista de sugestões
     */
    getSuggestions(partialTerm = '') {
        if (!partialTerm || partialTerm.length < 1) {
            return this.searchHistory.slice(0, 5);
        }

        const term = partialTerm.toLowerCase();
        return this.searchHistory
            .filter(item => item.toLowerCase().includes(term))
            .slice(0, 5);
    }

    /**
     * Obtém sugestões baseadas nas tarefas existentes
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @param {string} partialTerm - Termo parcial
     * @returns {Array} Lista de sugestões
     */
    getTaskSuggestions(tasks, categories = [], tags = [], partialTerm = '') {
        if (!partialTerm || partialTerm.length < 1) {
            return [];
        }

        const term = partialTerm.toLowerCase();
        const suggestions = new Set();

        // Sugestões de títulos
        tasks.forEach(task => {
            if (task.title.toLowerCase().includes(term)) {
                suggestions.add(task.title);
            }
        });

        // Sugestões de categorias
        categories.forEach(category => {
            if (category.name.toLowerCase().includes(term)) {
                suggestions.add(category.name);
            }
        });

        // Sugestões de tags
        tags.forEach(tag => {
            if (tag.name.toLowerCase().includes(term)) {
                suggestions.add(tag.name);
            }
        });

        return Array.from(suggestions).slice(0, 10);
    }

    /**
     * Realiza busca avançada com múltiplos critérios
     * @param {Array} tasks - Lista de tarefas
     * @param {Object} criteria - Critérios de busca
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Array} Lista de tarefas encontradas
     */
    advancedSearch(tasks, criteria, categories = [], tags = []) {
        let results = [...tasks];

        // Busca por texto
        if (criteria.text) {
            this.setSearchTerm(criteria.text);
            results = this.searchTasks(results, categories, tags);
        }

        // Filtro por prioridade
        if (criteria.priority) {
            results = results.filter(task => task.priority === criteria.priority);
        }

        // Filtro por categoria
        if (criteria.category) {
            results = results.filter(task => task.category === criteria.category);
        }

        // Filtro por tags
        if (criteria.tags && criteria.tags.length > 0) {
            results = results.filter(task => 
                task.tags && criteria.tags.some(tagId => task.tags.includes(tagId))
            );
        }

        // Filtro por status
        if (criteria.completed !== undefined) {
            results = results.filter(task => task.completed === criteria.completed);
        }

        // Filtro por data
        if (criteria.dateFrom) {
            const fromDate = new Date(criteria.dateFrom);
            results = results.filter(task => {
                if (!task.dueDate) return false;
                return new Date(task.dueDate) >= fromDate;
            });
        }

        if (criteria.dateTo) {
            const toDate = new Date(criteria.dateTo);
            results = results.filter(task => {
                if (!task.dueDate) return false;
                return new Date(task.dueDate) <= toDate;
            });
        }

        // Filtro por recorrência
        if (criteria.recurring !== undefined) {
            results = results.filter(task => task.isRecurring === criteria.recurring);
        }

        return results;
    }

    /**
     * Obtém estatísticas da busca
     * @param {Array} tasks - Lista de tarefas
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {Object} Estatísticas da busca
     */
    getSearchStats(tasks, categories = [], tags = []) {
        const totalTasks = tasks.length;
        const searchResults = this.hasSearchTerm() ? 
            this.searchTasks(tasks, categories, tags) : tasks;
        
        return {
            totalTasks,
            searchResults: searchResults.length,
            hasSearchTerm: this.hasSearchTerm(),
            searchTerm: this.searchTerm,
            historySize: this.searchHistory.length
        };
    }

    /**
     * Salva o histórico de busca no localStorage
     */
    saveSearchHistory() {
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Erro ao salvar histórico de busca:', error);
        }
    }

    /**
     * Carrega o histórico de busca do localStorage
     * @returns {Array} Histórico de busca
     */
    loadSearchHistory() {
        try {
            const saved = localStorage.getItem('searchHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erro ao carregar histórico de busca:', error);
            return [];
        }
    }

    /**
     * Obtém o estado atual do filtro de busca
     * @returns {Object} Estado do filtro
     */
    getState() {
        return {
            searchTerm: this.searchTerm,
            searchHistory: [...this.searchHistory]
        };
    }

    /**
     * Restaura o estado do filtro de busca
     * @param {Object} state - Estado para restaurar
     */
    setState(state) {
        this.searchTerm = state.searchTerm || '';
        this.searchHistory = state.searchHistory || [];
    }

    /**
     * Limpa o termo de busca atual
     */
    clearSearch() {
        this.searchTerm = '';
    }

    /**
     * Verifica se uma tarefa corresponde a todos os critérios de busca
     * @param {Object} task - Tarefa para verificar
     * @param {Object} criteria - Critérios de busca
     * @param {Array} categories - Lista de categorias
     * @param {Array} tags - Lista de tags
     * @returns {boolean}
     */
    matchesAllCriteria(task, criteria, categories = [], tags = []) {
        // Verificar texto
        if (criteria.text && !this.matchesTask(task, criteria.text, categories, tags)) {
            return false;
        }

        // Verificar prioridade
        if (criteria.priority && task.priority !== criteria.priority) {
            return false;
        }

        // Verificar categoria
        if (criteria.category && task.category !== criteria.category) {
            return false;
        }

        // Verificar tags
        if (criteria.tags && criteria.tags.length > 0) {
            if (!task.tags || !criteria.tags.some(tagId => task.tags.includes(tagId))) {
                return false;
            }
        }

        // Verificar status
        if (criteria.completed !== undefined && task.completed !== criteria.completed) {
            return false;
        }

        // Verificar data
        if (criteria.dateFrom && task.dueDate) {
            if (new Date(task.dueDate) < new Date(criteria.dateFrom)) {
                return false;
            }
        }

        if (criteria.dateTo && task.dueDate) {
            if (new Date(task.dueDate) > new Date(criteria.dateTo)) {
                return false;
            }
        }

        // Verificar recorrência
        if (criteria.recurring !== undefined && task.isRecurring !== criteria.recurring) {
            return false;
        }

        return true;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchFilter;
} else {
    window.SearchFilter = SearchFilter;
}
