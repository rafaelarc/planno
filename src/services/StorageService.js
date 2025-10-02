/**
 * StorageService - Abstração do localStorage
 * Responsável por todas as operações de persistência de dados
 * 
 * Funcionalidades:
 * - Gerenciamento de tarefas
 * - Gerenciamento de categorias
 * - Gerenciamento de tags
 * - Configurações do usuário
 * - Configurações de ordenação
 * - Configurações de notificações
 * - Configurações de exibição
 * - Estado da sidebar
 */
class StorageService {
    constructor() {
        this.keys = {
            tasks: 'todoTasks',
            categories: 'todoCategories',
            tags: 'todoTags',
            userName: 'userName',
            customColors: 'customColors',
            theme: 'theme',
            sortOptions: 'sortOptions',
            completedTasksDays: 'completedTasksDays',
            sidebarCollapsed: 'sidebarCollapsed'
        };
    }

    // ===== TASKS =====
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.keys.tasks, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Erro ao salvar tarefas:', error);
            return false;
        }
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem(this.keys.tasks);
            if (!savedTasks) return [];
            
            const tasksData = JSON.parse(savedTasks);
            // Converter objetos JSON para instâncias da classe Task
            return tasksData.map(taskData => new Task(taskData));
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return [];
        }
    }

    // ===== CATEGORIES =====
    saveCategories(categories) {
        try {
            localStorage.setItem(this.keys.categories, JSON.stringify(categories));
            return true;
        } catch (error) {
            console.error('Erro ao salvar categorias:', error);
            return false;
        }
    }

    loadCategories() {
        try {
            const savedCategories = localStorage.getItem(this.keys.categories);
            if (!savedCategories) return [];
            
            const categoriesData = JSON.parse(savedCategories);
            // Converter objetos JSON para instâncias da classe Category
            return categoriesData.map(categoryData => new Category(categoryData));
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            return [];
        }
    }

    // ===== TAGS =====
    saveTags(tags) {
        try {
            localStorage.setItem(this.keys.tags, JSON.stringify(tags));
            return true;
        } catch (error) {
            console.error('Erro ao salvar tags:', error);
            return false;
        }
    }

    loadTags() {
        try {
            const savedTags = localStorage.getItem(this.keys.tags);
            if (!savedTags) return [];
            
            const tagsData = JSON.parse(savedTags);
            // Converter objetos JSON para instâncias da classe Tag
            return tagsData.map(tagData => new Tag(tagData));
        } catch (error) {
            console.error('Erro ao carregar tags:', error);
            return [];
        }
    }

    // ===== USER SETTINGS =====
    saveUserName(userName) {
        try {
            localStorage.setItem(this.keys.userName, userName);
            return true;
        } catch (error) {
            console.error('Erro ao salvar nome do usuário:', error);
            return false;
        }
    }

    loadUserName() {
        try {
            return localStorage.getItem(this.keys.userName) || '';
        } catch (error) {
            console.error('Erro ao carregar nome do usuário:', error);
            return '';
        }
    }

    // ===== CUSTOM COLORS =====
    saveCustomColors(customColors) {
        try {
            localStorage.setItem(this.keys.customColors, JSON.stringify(customColors));
            return true;
        } catch (error) {
            console.error('Erro ao salvar cores personalizadas:', error);
            return false;
        }
    }

    loadCustomColors() {
        try {
            const savedColors = localStorage.getItem(this.keys.customColors);
            return savedColors ? JSON.parse(savedColors) : {};
        } catch (error) {
            console.error('Erro ao carregar cores personalizadas:', error);
            return {};
        }
    }

    // ===== THEME =====
    saveTheme(theme) {
        try {
            localStorage.setItem(this.keys.theme, theme);
            return true;
        } catch (error) {
            console.error('Erro ao salvar tema:', error);
            return false;
        }
    }

    loadTheme() {
        try {
            return localStorage.getItem(this.keys.theme) || 'light';
        } catch (error) {
            console.error('Erro ao carregar tema:', error);
            return 'light';
        }
    }

    // ===== SORT OPTIONS =====
    saveSortOptions(sortOptions) {
        try {
            localStorage.setItem(this.keys.sortOptions, JSON.stringify(sortOptions));
            return true;
        } catch (error) {
            console.error('Erro ao salvar opções de ordenação:', error);
            return false;
        }
    }

    loadSortOptions() {
        try {
            const savedSortOptions = localStorage.getItem(this.keys.sortOptions);
            return savedSortOptions ? JSON.parse(savedSortOptions) : {
                field: 'createdAt',
                direction: 'desc'
            };
        } catch (error) {
            console.error('Erro ao carregar opções de ordenação:', error);
            return {
                field: 'createdAt',
                direction: 'desc'
            };
        }
    }

    // ===== DISPLAY SETTINGS =====
    saveCompletedTasksDays(days) {
        try {
            localStorage.setItem(this.keys.completedTasksDays, days.toString());
            return true;
        } catch (error) {
            console.error('Erro ao salvar configuração de exibição:', error);
            return false;
        }
    }

    loadCompletedTasksDays() {
        try {
            return parseInt(localStorage.getItem(this.keys.completedTasksDays)) || 30;
        } catch (error) {
            console.error('Erro ao carregar configuração de exibição:', error);
            return 30;
        }
    }

    // ===== SIDEBAR STATE =====
    saveSidebarCollapsed(collapsed) {
        try {
            // Se collapsed for undefined, usar false como padrão
            const collapsedValue = collapsed !== undefined ? collapsed : false;
            localStorage.setItem(this.keys.sidebarCollapsed, collapsedValue.toString());
            return true;
        } catch (error) {
            console.error('Erro ao salvar estado da sidebar:', error);
            return false;
        }
    }

    loadSidebarCollapsed() {
        try {
            return localStorage.getItem(this.keys.sidebarCollapsed) === 'true';
        } catch (error) {
            console.error('Erro ao carregar estado da sidebar:', error);
            return false;
        }
    }

    // ===== UTILITY METHODS =====
    
    /**
     * Salva todas as configurações de uma vez
     * @param {Object} settings - Objeto com todas as configurações
     */
    saveAllSettings(settings) {
        const results = {
            userName: this.saveUserName(settings.userName),
            customColors: this.saveCustomColors(settings.customColors),
            theme: this.saveTheme(settings.theme),
            sortOptions: this.saveSortOptions(settings.sortOptions),
            completedTasksDays: this.saveCompletedTasksDays(settings.completedTasksDays),
            sidebarCollapsed: this.saveSidebarCollapsed(settings.sidebarCollapsed)
        };

        return {
            success: Object.values(results).every(result => result === true),
            results
        };
    }

    /**
     * Carrega todas as configurações de uma vez
     * @returns {Object} Objeto com todas as configurações
     */
    loadAllSettings() {
        return {
            userName: this.loadUserName(),
            customColors: this.loadCustomColors(),
            theme: this.loadTheme(),
            sortOptions: this.loadSortOptions(),
            completedTasksDays: this.loadCompletedTasksDays(),
            sidebarCollapsed: this.loadSidebarCollapsed()
        };
    }

    /**
     * Limpa todos os dados do localStorage
     */
    clearAllData() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    }

    /**
     * Obtém configurações padrão
     * @returns {Object} Configurações padrão
     */
    getDefaultSettings() {
        return {
            userName: '',
            customColors: {
                primary: '#007bff',
                success: '#28a745',
                warning: '#ffc107',
                danger: '#dc3545'
            },
            completedTasksDays: 30,
            sortOptions: {
                field: 'createdAt',
                direction: 'desc'
            }
        };
    }

    /**
     * Verifica se o localStorage está disponível
     * @returns {boolean}
     */
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtém o tamanho usado pelo localStorage
     * @returns {number} Tamanho em bytes
     */
    getStorageSize() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return total;
        } catch (error) {
            console.error('Erro ao calcular tamanho do storage:', error);
            return 0;
        }
    }

    /**
     * Carrega configurações salvas
     * @returns {Object} Configurações carregadas
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem('planno_settings');
            if (settings) {
                return JSON.parse(settings);
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
        
        // Retornar configurações padrão se não houver configurações salvas
        return this.getDefaultSettings();
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
} else {
    window.StorageService = StorageService;
}
