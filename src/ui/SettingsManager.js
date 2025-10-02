/**
 * SettingsManager - Gerenciamento de configurações
 * Responsável por gerenciar a página de configurações
 * 
 * Funcionalidades:
 * - Abertura e fechamento da página de configurações
 * - Carregamento e salvamento de configurações
 * - Validação de dados
 * - Sincronização de inputs de cor
 * - Gerenciamento de formulários
 */
class SettingsManager {
    constructor() {
        this.settingsPage = null;
        this.isOpen = false;
    }

    /**
     * Inicializa o gerenciador de configurações
     */
    init() {
        this.settingsPage = DOMUtils.getById('settingsPage');
        
        if (!this.settingsPage) {
            console.error('Página de configurações não encontrada');
            return;
        }

        this.setupEventListeners();
    }

    /**
     * Abre a página de configurações
     */
    openSettings() {
        if (!this.settingsPage) return;
        
        DOMUtils.addClass(this.settingsPage, 'show');
        this.isOpen = true;
        
        // Chamar callback para carregar configurações atuais
        this.onSettingsOpen();
    }

    /**
     * Fecha a página de configurações
     */
    closeSettings() {
        if (!this.settingsPage) return;
        
        DOMUtils.removeClass(this.settingsPage, 'show');
        this.isOpen = false;
    }

    /**
     * Carrega dados no formulário de configurações
     * @param {Object} settings - Configurações para carregar
     */
    loadSettingsForm(settings = {}) {
        // Carregar nome do usuário
        DOMUtils.setValue(DOMUtils.getById('userName'), settings.userName || '');
        
        // Carregar cores
        const defaultColors = {
            primary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545'
        };
        
        Object.keys(defaultColors).forEach(colorType => {
            const color = settings.customColors?.[colorType] || defaultColors[colorType];
            DOMUtils.setValue(DOMUtils.getById(`${colorType}Color`), color);
            DOMUtils.setValue(DOMUtils.getById(`${colorType}ColorText`), color);
        });
        
        
        // Carregar configurações de exibição
        DOMUtils.setValue(DOMUtils.getById('completedTasksDays'), settings.completedTasksDays || 30);
        
        // Carregar configurações de ordenação
        DOMUtils.setValue(DOMUtils.getById('sortField'), settings.sortOptions?.field || 'createdAt');
        DOMUtils.setValue(DOMUtils.getById('sortDirection'), settings.sortOptions?.direction || 'desc');
        
        // Mostrar/ocultar configurações de notificação
        const notificationSettings = DOMUtils.getById('notificationSettings');
        if (notificationSettings) {
            notificationSettings.style.display = settings.notificationsEnabled ? 'block' : 'none';
        }
        
        // Carregar última atualização
        DOMUtils.setText(DOMUtils.getById('lastUpdate'), new Date().toLocaleDateString('pt-BR'));
    }

    /**
     * Salva configurações do formulário
     * @returns {Object} Configurações salvas
     */
    saveSettings() {
        const settings = {
            // Nome do usuário
            userName: DOMUtils.getValue(DOMUtils.getById('userName')).trim(),
            
            // Cores personalizadas
            customColors: {
                primary: DOMUtils.getValue(DOMUtils.getById('primaryColor')),
                success: DOMUtils.getValue(DOMUtils.getById('successColor')),
                warning: DOMUtils.getValue(DOMUtils.getById('warningColor')),
                danger: DOMUtils.getValue(DOMUtils.getById('dangerColor'))
            },
            
            
            // Configurações de exibição
            completedTasksDays: parseInt(DOMUtils.getValue(DOMUtils.getById('completedTasksDays'))) || 30,
            
            // Configurações de ordenação
            sortOptions: {
                field: DOMUtils.getValue(DOMUtils.getById('sortField')),
                direction: DOMUtils.getValue(DOMUtils.getById('sortDirection'))
            }
        };

        return settings;
    }

    /**
     * Sincroniza inputs de cor
     * @param {string} colorType - Tipo de cor (primary, success, warning, danger)
     */
    syncColorInputs(colorType) {
        const colorInput = DOMUtils.getById(`${colorType}Color`);
        const textInput = DOMUtils.getById(`${colorType}ColorText`);
        
        if (!colorInput || !textInput) return;
        
        DOMUtils.addEventListener(colorInput, 'input', () => {
            DOMUtils.setValue(textInput, colorInput.value.toUpperCase());
        });
        
        DOMUtils.addEventListener(textInput, 'input', () => {
            const value = textInput.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                DOMUtils.setValue(colorInput, value);
            }
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão de abrir configurações
        DOMUtils.addEventListener(DOMUtils.getById('settingsBtn'), 'click', () => {
            this.openSettings();
        });

        // Botão de fechar configurações
        DOMUtils.addEventListener(DOMUtils.getById('closeSettingsBtn'), 'click', () => {
            this.closeSettings();
        });

        // Sincronização de cores
        ['primary', 'success', 'warning', 'danger'].forEach(colorType => {
            this.syncColorInputs(colorType);
        });

        // Botão de resetar cores
        DOMUtils.addEventListener(DOMUtils.getById('resetColorsBtn'), 'click', () => {
            this.resetCustomColors();
        });

        // Botão de aplicar cores
        DOMUtils.addEventListener(DOMUtils.getById('applyColorsBtn'), 'click', () => {
            this.applyColors();
        });

        // Botão de salvar todas as configurações
        const saveAllBtn = DOMUtils.getById('saveAllSettingsBtn');
        if (saveAllBtn) {
            saveAllBtn.addEventListener('click', () => {
                this.saveAllSettings();
            });
        }

        // Botão de resetar todas as configurações
        DOMUtils.addEventListener(DOMUtils.getById('resetAllSettingsBtn'), 'click', () => {
            this.resetAllSettings();
        });


        // Configurações de exibição
        DOMUtils.addEventListener(DOMUtils.getById('completedTasksDays'), 'change', (e) => {
            this.onCompletedTasksDaysChange(parseInt(e.target.value));
        });

        // Configurações de ordenação
        DOMUtils.addEventListener(DOMUtils.getById('sortField'), 'change', (e) => {
            this.onSortChange();
        });

        DOMUtils.addEventListener(DOMUtils.getById('sortDirection'), 'change', (e) => {
            this.onSortChange();
        });

        // Gerenciamento de dados
        DOMUtils.addEventListener(DOMUtils.getById('exportDataBtn'), 'click', () => {
            this.exportData('json');
        });

        DOMUtils.addEventListener(DOMUtils.getById('exportCsvBtn'), 'click', () => {
            this.exportData('csv');
        });

        DOMUtils.addEventListener(DOMUtils.getById('selectImportFileBtn'), 'click', () => {
            DOMUtils.getById('importFile').click();
        });

        DOMUtils.addEventListener(DOMUtils.getById('importFile'), 'change', (e) => {
            this.onImportFileSelect(e.target.files[0]);
        });

        DOMUtils.addEventListener(DOMUtils.getById('importDataBtn'), 'click', () => {
            this.importData();
        });

        DOMUtils.addEventListener(DOMUtils.getById('clearAllDataBtn'), 'click', () => {
            this.clearAllData();
        });

        // Fechar com Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSettings();
            }
        });
    }


    /**
     * Reseta cores personalizadas
     */
    resetCustomColors() {
        const defaultColors = {
            primary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545'
        };
        
        Object.keys(defaultColors).forEach(colorType => {
            DOMUtils.setValue(DOMUtils.getById(`${colorType}Color`), defaultColors[colorType]);
            DOMUtils.setValue(DOMUtils.getById(`${colorType}ColorText`), defaultColors[colorType]);
        });
    }

    /**
     * Aplica cores personalizadas
     */
    applyColors() {
        const settings = this.saveSettings();
        this.onCustomColorsChange(settings.customColors);
        this.onSettingsSave(settings);
    }

    /**
     * Salva todas as configurações
     */
    saveAllSettings() {
        const settings = this.saveSettings();
        this.onSettingsSave(settings);
    }

    /**
     * Reseta todas as configurações
     */
    resetAllSettings() {
        if (confirm('⚠️ ATENÇÃO: Isso irá resetar TODAS as configurações para os valores padrão. Esta ação não pode ser desfeita!\n\nTem certeza que deseja continuar?')) {
            this.onSettingsReset();
            this.loadSettingsForm();
            // Toast será exibido pelo TodoApp através do callback
        }
    }


    /**
     * Exporta dados
     * @param {string} format - Formato de exportação ('json' ou 'csv')
     */
    exportData(format = 'json') {
        this.onExportData(format);
    }

    /**
     * Lida com seleção de arquivo de importação
     * @param {File} file - Arquivo selecionado
     */
    onImportFileSelect(file) {
        if (file) {
            DOMUtils.setText(DOMUtils.getById('importFileName'), `Arquivo selecionado: ${file.name}`);
            
            // Validar arquivo antes de habilitar importação
            this.validateImportFile(file);
        }
    }

    /**
     * Valida arquivo de importação
     * @param {File} file - Arquivo para validar
     */
    async validateImportFile(file) {
        const validationInfo = DOMUtils.getById('importValidationInfo');
        const importBtn = DOMUtils.getById('importDataBtn');
        
        try {
            // Mostrar indicador de carregamento
            this.showValidationStatus('loading', 'Validando arquivo...');
            
            // Simular validação (em uma implementação real, você chamaria o ExportService)
            const isValid = await this.onValidateImportFile(file);
            
            if (isValid) {
                this.showValidationStatus('success', 'Arquivo válido - pronto para importação');
                importBtn.disabled = false;
            } else {
                this.showValidationStatus('error', 'Arquivo inválido - não é possível importar');
                importBtn.disabled = true;
            }
        } catch (error) {
            this.showValidationStatus('error', `Erro na validação: ${error.message}`);
            importBtn.disabled = true;
        }
    }

    /**
     * Mostra status de validação
     * @param {string} status - Status da validação ('loading', 'success', 'error', 'warning')
     * @param {string} message - Mensagem a ser exibida
     * @param {Array} details - Detalhes adicionais (opcional)
     */
    showValidationStatus(status, message, details = []) {
        const validationInfo = DOMUtils.getById('importValidationInfo');
        if (!validationInfo) return;

        let iconClass, statusClass;
        switch (status) {
            case 'loading':
                iconClass = 'fas fa-spinner fa-spin';
                statusClass = 'validation-warning';
                break;
            case 'success':
                iconClass = 'fas fa-check-circle';
                statusClass = 'validation-success';
                break;
            case 'error':
                iconClass = 'fas fa-exclamation-circle';
                statusClass = 'validation-error';
                break;
            case 'warning':
                iconClass = 'fas fa-exclamation-triangle';
                statusClass = 'validation-warning';
                break;
            default:
                iconClass = 'fas fa-info-circle';
                statusClass = 'validation-warning';
        }

        let detailsHtml = '';
        if (details.length > 0) {
            detailsHtml = `
                <div class="validation-details">
                    <ul>
                        ${details.map(detail => `<li class="${detail.type === 'error' ? 'error-item' : 'warning-item'}">${detail.message}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        validationInfo.innerHTML = `
            <div class="validation-status">
                <i class="${iconClass} ${statusClass}"></i>
                <span class="validation-text">${message}</span>
            </div>
            ${detailsHtml}
        `;
        
        validationInfo.style.display = 'block';
    }

    /**
     * Importa dados
     */
    importData() {
        const file = DOMUtils.getById('importFile').files[0];
        if (file) {
            this.onImportData(file);
        }
    }

    /**
     * Limpa todos os dados
     */
    clearAllData() {
        if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os seus dados permanentemente. Esta ação não pode ser desfeita!\n\nTem certeza que deseja continuar?')) {
            this.onClearAllData();
        }
    }


    /**
     * Atualiza UI de ordenação
     * @param {Object} sortOptions - Opções de ordenação
     */
    updateSortUI(sortOptions) {
        const fieldSelect = DOMUtils.getById('sortField');
        const directionSelect = DOMUtils.getById('sortDirection');
        const sortText = DOMUtils.getById('sortText');
        
        if (fieldSelect) DOMUtils.setValue(fieldSelect, sortOptions.field);
        if (directionSelect) DOMUtils.setValue(directionSelect, sortOptions.direction);
        
        if (sortText) {
            const fieldLabels = {
                createdAt: 'Data de Criação',
                title: 'Título',
                priority: 'Prioridade',
                status: 'Status',
                category: 'Categoria',
                tags: 'Tags',
                dueDate: 'Data de Vencimento'
            };
            
            const directionLabels = {
                asc: 'Crescente',
                desc: 'Decrescente'
            };
            
            const fieldLabel = fieldLabels[sortOptions.field] || 'Data de Criação';
            const directionLabel = directionLabels[sortOptions.direction] || 'Decrescente';
            
            DOMUtils.setText(sortText, `Ordenado por ${fieldLabel} (${directionLabel})`);
        }
    }

    /**
     * Verifica se a página de configurações está aberta
     * @returns {boolean}
     */
    isSettingsOpen() {
        return this.isOpen;
    }

    /**
     * Callbacks (serão implementados pela aplicação principal)
     */
    onSettingsSave(settings) { /* Implementar na aplicação principal */ }
    onSettingsReset() { /* Implementar na aplicação principal */ }
    onSettingsOpen() { /* Implementar na aplicação principal */ }
    onCustomColorsChange(colors) { /* Implementar na aplicação principal */ }
    onCompletedTasksDaysChange(days) { /* Implementar na aplicação principal */ }
    onSortChange() {
        const sortOptions = {
            field: DOMUtils.getValue(DOMUtils.getById('sortField')),
            direction: DOMUtils.getValue(DOMUtils.getById('sortDirection'))
        };
        this.onSortOptionsChange(sortOptions);
    }
    onSortOptionsChange(sortOptions) { /* Implementar na aplicação principal */ }
    onExportData(format) { /* Implementar na aplicação principal */ }
    onValidateImportFile(file) { /* Implementar na aplicação principal */ }
    onImportData(file) { /* Implementar na aplicação principal */ }
    onClearAllData() { /* Implementar na aplicação principal */ }

    /**
     * Testa as configurações de visualização
     * @returns {Object} Resultado do teste
     */
    testDisplaySettings() {
        const completedTasksDays = DOMUtils.getById('completedTasksDays');
        const sortField = DOMUtils.getById('sortField');
        const sortDirection = DOMUtils.getById('sortDirection');

        return {
            completedTasksDays: {
                element: !!completedTasksDays,
                value: completedTasksDays ? completedTasksDays.value : null,
                hasListener: completedTasksDays ? completedTasksDays.onchange !== null : false
            },
            sortField: {
                element: !!sortField,
                value: sortField ? sortField.value : null,
                hasListener: sortField ? sortField.onchange !== null : false
            },
            sortDirection: {
                element: !!sortDirection,
                value: sortDirection ? sortDirection.value : null,
                hasListener: sortDirection ? sortDirection.onchange !== null : false
            }
        };
    }

    /**
     * Destrói o gerenciador de configurações
     */
    destroy() {
        this.settingsPage = null;
        this.isOpen = false;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
} else {
    window.SettingsManager = SettingsManager;
}
