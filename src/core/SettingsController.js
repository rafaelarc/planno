/**
 * SettingsController - Gerencia configurações da aplicação
 * Responsável por toda lógica de configurações e preferências
 */
class SettingsController {
    constructor(storageService, taskFilter, settingsManager, toastManager) {
        this.storageService = storageService;
        this.taskFilter = taskFilter;
        this.settingsManager = settingsManager;
        this.toastManager = toastManager;
        
        // Configurações padrão
        this.defaultSettings = {
            theme: 'light',
            userName: '',
            customColors: {
                primary: '#007bff',
                secondary: '#6c757d',
                success: '#28a745',
                danger: '#dc3545',
                warning: '#ffc107',
                info: '#17a2b8'
            },
            sortOptions: {
                field: 'createdAt',
                direction: 'desc'
            },
            completedTasksDays: 30,
            sidebarCollapsed: false
        };
        
        // Configurações atuais
        this.settings = { ...this.defaultSettings };
    }

    /**
     * Inicializa o controlador
     * @param {Object} settings - Configurações iniciais
     */
    initialize(settings = null) {
        if (settings) {
            this.settings = { ...this.defaultSettings, ...settings };
        } else {
            this.settings = this.storageService.loadAllSettings() || { ...this.defaultSettings };
        }
        
        this.applySettings();
    }

    /**
     * Obtém todas as configurações
     * @returns {Object} Configurações atuais
     */
    getAllSettings() {
        return { ...this.settings };
    }

    /**
     * Obtém uma configuração específica
     * @param {string} key - Chave da configuração
     * @returns {any} Valor da configuração
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * Define uma configuração
     * @param {string} key - Chave da configuração
     * @param {any} value - Valor da configuração
     */
    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    /**
     * Atualiza múltiplas configurações
     * @param {Object} newSettings - Novas configurações
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.applySettings();
        
        // Exibir toast de confirmação
        this.toastManager.settingsSaved();
    }

    /**
     * Salva configurações no storage
     */
    saveSettings() {
        this.storageService.saveAllSettings(this.settings);
    }

    /**
     * Aplica as configurações carregadas
     */
    applySettings() {
        // Aplicar configurações do filtro
        this.taskFilter.setSortOptions(this.settings.sortOptions);
        this.taskFilter.setCompletedTasksDays(this.settings.completedTasksDays);
        
        // Aplicar cores personalizadas
        this.applyCustomColors(this.settings.customColors);
        
        // Aplicar tema
        this.applyTheme();
        
    }

    /**
     * Aplica o tema atual
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        const themeIcon = DOMUtils.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    /**
     * Alterna o tema
     */
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings();
        this.applyTheme();
    }

    /**
     * Aplica cores personalizadas
     * @param {Object} colors - Cores personalizadas
     */
    applyCustomColors(colors) {
        if (!colors || typeof colors !== 'object') {
            console.warn('Cores personalizadas inválidas:', colors);
            return;
        }
        
        const root = document.documentElement;
        
        Object.keys(colors).forEach(colorType => {
            if (colors[colorType]) {
                // Mapear os nomes das cores para as variáveis CSS corretas
                const cssVarName = colorType === 'primary' ? 'accent-primary' : colorType;
                root.style.setProperty(`--${cssVarName}`, colors[colorType]);
            }
        });
    }



    /**
     * Atualiza dias de tarefas completadas
     * @param {number} days - Número de dias
     */
    updateCompletedTasksDays(days) {
        this.settings.completedTasksDays = days;
        this.storageService.saveCompletedTasksDays(days);
        this.taskFilter.setCompletedTasksDays(days);
    }

    /**
     * Atualiza opções de ordenação
     * @param {Object} sortOptions - Opções de ordenação
     */
    updateSortOptions(sortOptions) {
        this.settings.sortOptions = sortOptions;
        this.storageService.saveSortOptions(sortOptions);
        this.taskFilter.setSortOptions(sortOptions);
    }

    /**
     * Atualiza nome do usuário
     * @param {string} userName - Nome do usuário
     */
    updateUserName(userName) {
        this.settings.userName = userName;
        this.storageService.saveUserName(userName);
    }

    /**
     * Atualiza estado da sidebar
     * @param {boolean} collapsed - Se a sidebar está colapsada
     */
    updateSidebarState(collapsed) {
        this.settings.sidebarCollapsed = collapsed;
        this.storageService.saveSidebarState(collapsed);
    }

    /**
     * Atualiza estado das notificações
     * @param {boolean} enabled - Se as notificações estão habilitadas
     */

    /**
     * Atualiza cores personalizadas
     * @param {Object} colors - Cores personalizadas
     */
    updateCustomColors(colors) {
        this.settings.customColors = { ...this.settings.customColors, ...colors };
        this.storageService.saveCustomColors(this.settings.customColors);
        this.applyCustomColors(this.settings.customColors);
    }

    /**
     * Reseta configurações para padrão
     */
    resetSettings() {
        this.settings = { ...this.defaultSettings };
        this.storageService.saveAllSettings(this.settings);
        this.applySettings();
    }

    /**
     * Obtém configurações padrão
     * @returns {Object} Configurações padrão
     */
    getDefaultSettings() {
        return { ...this.defaultSettings };
    }

    /**
     * Valida configurações
     * @param {Object} settings - Configurações para validar
     * @returns {Object} Resultado da validação
     */
    validateSettings(settings) {
        const errors = [];

        // Validar tema
        if (settings.theme && !['light', 'dark'].includes(settings.theme)) {
            errors.push('Tema deve ser "light" ou "dark"');
        }

        // Validar nome do usuário
        if (settings.userName && settings.userName.length > 50) {
            errors.push('Nome do usuário deve ter no máximo 50 caracteres');
        }


        // Validar dias de tarefas completadas
        if (settings.completedTasksDays && (settings.completedTasksDays < 1 || settings.completedTasksDays > 30)) {
            errors.push('Dias de tarefas completadas deve estar entre 1 e 30');
        }

        // Validar opções de ordenação
        if (settings.sortOptions) {
            const validFields = ['createdAt', 'title', 'dueDate', 'priority', 'completed'];
            const validOrders = ['asc', 'desc'];
            
            if (settings.sortOptions.field && !validFields.includes(settings.sortOptions.field)) {
                errors.push('Campo de ordenação inválido');
            }
            
            if (settings.sortOptions.order && !validOrders.includes(settings.sortOptions.order)) {
                errors.push('Ordem de ordenação inválida');
            }
        }

        // Validar cores personalizadas
        if (settings.customColors) {
            const validColorTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
            const colorRegex = /^#[0-9A-F]{6}$/i;
            
            Object.keys(settings.customColors).forEach(colorType => {
                if (!validColorTypes.includes(colorType)) {
                    errors.push(`Tipo de cor inválido: ${colorType}`);
                }
                
                if (settings.customColors[colorType] && !colorRegex.test(settings.customColors[colorType])) {
                    errors.push(`Cor inválida para ${colorType}: ${settings.customColors[colorType]}`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Exporta configurações
     * @returns {Object} Configurações para exportação
     */
    exportSettings() {
        return {
            userName: this.settings.userName,
            customColors: this.settings.customColors,
            theme: this.settings.theme,
            sortOptions: this.settings.sortOptions,
            completedTasksDays: this.settings.completedTasksDays,
            sidebarCollapsed: this.settings.sidebarCollapsed
        };
    }

    /**
     * Importa configurações
     * @param {Object} settings - Configurações para importar
     * @returns {boolean} Se as configurações foram importadas com sucesso
     */
    importSettings(settings) {
        const validation = this.validateSettings(settings);
        if (!validation.isValid) {
            console.error('Configurações inválidas:', validation.errors);
            return false;
        }

        this.settings = { ...this.settings, ...settings };
        this.saveSettings();
        this.applySettings();
        return true;
    }

    /**
     * Obtém saudação do usuário
     * @returns {string} Saudação personalizada
     */
    getUserGreeting() {
        if (this.settings.userName) {
            const timeGreeting = DateUtils.getTimeGreeting();
            return `${timeGreeting}, ${this.settings.userName}!`;
        }
        return 'Bem-vindo!';
    }

    /**
     * Atualiza campo de nome do usuário nas configurações
     */
    updateUserNameField() {
        const userNameField = document.getElementById('userName');
        if (userNameField && this.settings.userName) {
            userNameField.value = this.settings.userName;
        }
    }


    /**
     * Obtém estatísticas das configurações
     * @returns {Object} Estatísticas das configurações
     */
    getSettingsStats() {
        return {
            hasCustomColors: Object.values(this.settings.customColors).some(color => 
                color !== this.defaultSettings.customColors[Object.keys(this.settings.customColors).find(key => 
                    this.settings.customColors[key] === color
                )]
            ),
            hasUserName: !!this.settings.userName,
            theme: this.settings.theme,
            sidebarCollapsed: this.settings.sidebarCollapsed
        };
    }
}

// Exportar para uso global
window.SettingsController = SettingsController;
