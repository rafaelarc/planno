/**
 * ExportService - Serviço de exportação e importação
 * Responsável por exportar e importar dados da aplicação
 * 
 * Funcionalidades:
 * - Exportar dados para JSON
 * - Importar dados de JSON
 * - Validação de dados de importação
 * - Backup e restauração
 * - Limpeza de dados
 */
class ExportService {
    constructor() {
        this.version = '1.0.0';
        this.appName = 'Planno - To-Do List & Planner';
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.supportedFormats = ['.json', '.csv'];
    }

    /**
     * Exporta todos os dados da aplicação
     * @param {Object} data - Dados para exportar
     * @param {string} format - Formato de exportação ('json' ou 'csv')
     * @returns {Promise<boolean>} Se a exportação foi bem-sucedida
     */
    async exportData(data, format = 'json') {
        try {
            if (format === 'csv') {
                return await this.exportToCSV(data);
            } else {
                return await this.exportToJSON(data);
            }
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            throw error;
        }
    }

    /**
     * Exporta dados em formato JSON
     * @param {Object} data - Dados para exportar
     * @returns {Promise<boolean>} Se a exportação foi bem-sucedida
     */
    async exportToJSON(data) {
        try {
            const exportData = this.prepareExportData(data);
            const jsonString = JSON.stringify(exportData, null, 2);
            
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const filename = this.generateFilename('json');
            await this.downloadFile(url, filename);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Erro ao exportar dados JSON:', error);
            throw error;
        }
    }

    /**
     * Exporta dados em formato CSV
     * @param {Object} data - Dados para exportar
     * @returns {Promise<boolean>} Se a exportação foi bem-sucedida
     */
    async exportToCSV(data) {
        try {
            const csvContent = this.convertToCSV(data);
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const filename = this.generateFilename('csv');
            await this.downloadFile(url, filename);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Erro ao exportar dados CSV:', error);
            throw error;
        }
    }

    /**
     * Prepara os dados para exportação
     * @param {Object} data - Dados da aplicação
     * @returns {Object} Dados preparados para exportação
     */
    prepareExportData(data) {
        return {
            // Dados principais
            tasks: data.tasks || [],
            categories: data.categories || [],
            tags: data.tags || [],
            
            // Preferências do usuário
            userName: data.userName || '',
            customColors: data.customColors || {},
            theme: data.theme || 'light',
            
            // Configurações
            sortOptions: data.sortOptions || { field: 'createdAt', direction: 'desc' },
            completedTasksDays: data.completedTasksDays || 30,
            sidebarCollapsed: data.sidebarCollapsed || false,
            
            // Metadados
            exportDate: new Date().toISOString(),
            version: this.version,
            appName: this.appName
        };
    }

    /**
     * Gera o nome do arquivo de exportação
     * @param {string} format - Formato do arquivo ('json' ou 'csv')
     * @returns {string} Nome do arquivo
     */
    generateFilename(format = 'json') {
        const date = new Date();
        const dateString = date.toISOString().split('T')[0];
        const timeString = date.toTimeString().split(' ')[0].replace(/:/g, '-');
        return `planno-backup-${dateString}-${timeString}.${format}`;
    }

    /**
     * Faz o download do arquivo
     * @param {string} url - URL do arquivo
     * @param {string} filename - Nome do arquivo
     * @returns {Promise<void>}
     */
    async downloadFile(url, filename) {
        return new Promise((resolve, reject) => {
            try {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Converte dados para formato CSV
     * @param {Object} data - Dados da aplicação
     * @returns {string} Conteúdo CSV
     */
    convertToCSV(data) {
        const csvLines = [];
        
        // Cabeçalho com informações do arquivo
        csvLines.push('# Planno - Exportação de Dados');
        csvLines.push(`# Data de Exportação: ${new Date().toLocaleString('pt-BR')}`);
        csvLines.push(`# Versão: ${this.version}`);
        csvLines.push('');
        
        // Seção de Tarefas
        if (data.tasks && data.tasks.length > 0) {
            csvLines.push('# TAREFAS');
            csvLines.push('ID,Título,Descrição,Categoria,Tags,Prioridade,Data Vencimento,Hora Vencimento,Concluída,Data Criação,Data Conclusão,Recorrente,Tipo Recorrência,Dados Recorrência,Pai Recorrente');
            
            data.tasks.forEach(task => {
                const row = [
                    this.escapeCSV(task.id),
                    this.escapeCSV(task.title),
                    this.escapeCSV(task.description),
                    this.escapeCSV(task.category),
                    this.escapeCSV(task.tags ? task.tags.join(';') : ''),
                    this.escapeCSV(task.priority),
                    this.escapeCSV(task.dueDate),
                    this.escapeCSV(task.dueTime),
                    task.completed ? 'Sim' : 'Não',
                    this.escapeCSV(task.createdAt),
                    this.escapeCSV(task.completedAt),
                    task.isRecurring ? 'Sim' : 'Não',
                    this.escapeCSV(task.recurrenceType),
                    this.escapeCSV(task.recurrenceData ? JSON.stringify(task.recurrenceData) : ''),
                    this.escapeCSV(task.parentRecurringId)
                ];
                csvLines.push(row.join(','));
            });
            csvLines.push('');
        }
        
        // Seção de Categorias
        if (data.categories && data.categories.length > 0) {
            csvLines.push('# CATEGORIAS');
            csvLines.push('ID,Nome,Cor,Data Criação');
            
            data.categories.forEach(category => {
                const row = [
                    this.escapeCSV(category.id),
                    this.escapeCSV(category.name),
                    this.escapeCSV(category.color),
                    this.escapeCSV(category.createdAt)
                ];
                csvLines.push(row.join(','));
            });
            csvLines.push('');
        }
        
        // Seção de Tags
        if (data.tags && data.tags.length > 0) {
            csvLines.push('# TAGS');
            csvLines.push('ID,Nome,Cor,Data Criação');
            
            data.tags.forEach(tag => {
                const row = [
                    this.escapeCSV(tag.id),
                    this.escapeCSV(tag.name),
                    this.escapeCSV(tag.color),
                    this.escapeCSV(tag.createdAt)
                ];
                csvLines.push(row.join(','));
            });
            csvLines.push('');
        }
        
        // Seção de Configurações
        csvLines.push('# CONFIGURAÇÕES');
        csvLines.push('Propriedade,Valor');
        csvLines.push(`Nome do Usuário,${this.escapeCSV(data.userName || '')}`);
        csvLines.push(`Tema,${this.escapeCSV(data.theme || 'light')}`);
        csvLines.push(`Dias para Tarefas Concluídas,${data.completedTasksDays || 30}`);
        csvLines.push(`Sidebar Recolhida,${data.sidebarCollapsed ? 'Sim' : 'Não'}`);
        
        if (data.sortOptions) {
            csvLines.push(`Campo de Ordenação,${this.escapeCSV(data.sortOptions.field || 'createdAt')}`);
            csvLines.push(`Direção de Ordenação,${this.escapeCSV(data.sortOptions.direction || 'desc')}`);
        }
        
        if (data.customColors && Object.keys(data.customColors).length > 0) {
            csvLines.push('');
            csvLines.push('# CORES PERSONALIZADAS');
            csvLines.push('Tipo,Cor');
            Object.entries(data.customColors).forEach(([type, color]) => {
                csvLines.push(`${this.escapeCSV(type)},${this.escapeCSV(color)}`);
            });
        }
        
        return csvLines.join('\n');
    }

    /**
     * Escapa valores para CSV
     * @param {string} value - Valor para escapar
     * @returns {string} Valor escapado
     */
    escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const stringValue = String(value);
        
        // Se contém vírgula, quebra de linha ou aspas, precisa ser envolvido em aspas
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            // Escapa aspas duplas duplicando-as
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
    }

    /**
     * Importa dados de um arquivo
     * @param {File} file - Arquivo para importar
     * @returns {Promise<Object>} Dados importados
     */
    async importData(file) {
        try {
            // Validar arquivo
            this.validateImportFile(file);
            
            // Ler arquivo
            const fileContent = await this.readFile(file);
            
            // Parsear JSON
            const data = JSON.parse(fileContent);
            
            // Validar dados
            this.validateImportData(data);
            
            return this.processImportData(data);
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            throw error;
        }
    }

    /**
     * Valida o arquivo de importação
     * @param {File} file - Arquivo para validar
     * @throws {Error} Se o arquivo for inválido
     */
    validateImportFile(file) {
        if (!file) {
            throw new Error('Nenhum arquivo selecionado');
        }

        if (file.type !== 'application/json') {
            throw new Error('Arquivo deve ser do tipo JSON');
        }

        if (file.size > this.maxFileSize) {
            throw new Error(`Arquivo muito grande. Máximo ${this.maxFileSize / 1024 / 1024}MB`);
        }

        const extension = file.name.split('.').pop().toLowerCase();
        if (!this.supportedFormats.includes(`.${extension}`)) {
            throw new Error(`Formato não suportado. Use: ${this.supportedFormats.join(', ')}`);
        }
    }

    /**
     * Lê o conteúdo de um arquivo
     * @param {File} file - Arquivo para ler
     * @returns {Promise<string>} Conteúdo do arquivo
     */
    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    }

    /**
     * Valida os dados de importação com schema detalhado
     * @param {Object} data - Dados para validar
     * @throws {Error} Se os dados forem inválidos
     */
    validateImportData(data) {
        const validationResult = this.validateSchema(data);
        
        if (!validationResult.isValid) {
            const errorMessage = `Dados inválidos:\n${validationResult.errors.join('\n')}`;
            throw new Error(errorMessage);
        }
        
        if (validationResult.warnings.length > 0) {
            console.warn('Avisos de validação:', validationResult.warnings);
        }
    }

    /**
     * Valida o schema completo dos dados
     * @param {Object} data - Dados para validar
     * @returns {Object} Resultado da validação
     */
    validateSchema(data) {
        const errors = [];
        const warnings = [];

        // Validação básica de estrutura
        if (!data || typeof data !== 'object') {
            errors.push('Dados devem ser um objeto válido');
            return { isValid: false, errors, warnings };
        }

        // Validar metadados
        this.validateMetadata(data, errors, warnings);

        // Validar tarefas
        this.validateTasks(data.tasks, errors, warnings);

        // Validar categorias
        this.validateCategories(data.categories, errors, warnings);

        // Validar tags
        this.validateTags(data.tags, errors, warnings);

        // Validar configurações
        this.validateSettings(data, errors, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Valida metadados do arquivo
     * @param {Object} data - Dados para validar
     * @param {Array} errors - Array de erros
     * @param {Array} warnings - Array de avisos
     */
    validateMetadata(data, errors, warnings) {
        // Verificar versão
        if (data.version && data.version !== this.version) {
            warnings.push(`Versão do arquivo (${data.version}) diferente da versão atual (${this.version})`);
        }

        // Verificar metadados
        if (!data.exportDate) {
            warnings.push('Arquivo não contém data de exportação');
        } else if (!this.isValidDate(data.exportDate)) {
            errors.push('Data de exportação inválida');
        }

        if (!data.appName || data.appName !== this.appName) {
            warnings.push('Arquivo pode não ser compatível com esta aplicação');
        }
    }

    /**
     * Valida array de tarefas
     * @param {Array} tasks - Array de tarefas
     * @param {Array} errors - Array de erros
     * @param {Array} warnings - Array de avisos
     */
    validateTasks(tasks, errors, warnings) {
        if (!Array.isArray(tasks)) {
            errors.push('Lista de tarefas deve ser um array');
            return;
        }

        const taskIds = new Set();
        const invalidTasks = [];

        tasks.forEach((task, index) => {
            const taskValidation = this.validateTaskSchema(task, index);
            
            if (!taskValidation.isValid) {
                invalidTasks.push(`Tarefa ${index + 1}: ${taskValidation.errors.join(', ')}`);
            }

            // Verificar IDs duplicados
            if (task.id) {
                if (taskIds.has(task.id)) {
                    errors.push(`ID de tarefa duplicado: ${task.id}`);
                } else {
                    taskIds.add(task.id);
                }
            }
        });

        if (invalidTasks.length > 0) {
            errors.push(...invalidTasks);
        }

        if (tasks.length === 0) {
            warnings.push('Nenhuma tarefa encontrada no arquivo');
        }
    }

    /**
     * Valida schema de uma tarefa individual
     * @param {Object} task - Tarefa para validar
     * @param {number} index - Índice da tarefa
     * @returns {Object} Resultado da validação
     */
    validateTaskSchema(task, index) {
        const errors = [];

        if (!task || typeof task !== 'object') {
            errors.push('Tarefa deve ser um objeto válido');
            return { isValid: false, errors };
        }

        // Campos obrigatórios
        if (!task.id || typeof task.id !== 'string') {
            errors.push('ID é obrigatório e deve ser uma string');
        }

        if (!task.title || typeof task.title !== 'string') {
            errors.push('Título é obrigatório e deve ser uma string');
        } else if (task.title.length > 100) {
            errors.push('Título deve ter no máximo 100 caracteres');
        }

        // Campos opcionais com validação
        if (task.description && typeof task.description !== 'string') {
            errors.push('Descrição deve ser uma string');
        } else if (task.description && task.description.length > 500) {
            errors.push('Descrição deve ter no máximo 500 caracteres');
        }

        if (task.category && typeof task.category !== 'string') {
            errors.push('Categoria deve ser uma string');
        }

        if (task.tags && !Array.isArray(task.tags)) {
            errors.push('Tags devem ser um array');
        } else if (task.tags && task.tags.length > 3) {
            errors.push('Máximo de 3 tags por tarefa');
        }

        if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
            errors.push('Prioridade deve ser: low, medium ou high');
        }

        // Validação mais permissiva para datas e horários
        if (task.dueDate !== undefined && task.dueDate !== null && task.dueDate !== '' && String(task.dueDate).trim() !== '') {
            if (!this.isValidDate(task.dueDate)) {
                errors.push('Data de vencimento inválida');
            }
        }

        if (task.dueTime !== undefined && task.dueTime !== null && task.dueTime !== '' && String(task.dueTime).trim() !== '') {
            if (!this.isValidTime(task.dueTime)) {
                errors.push('Horário de vencimento inválido');
            }
        }

        if (typeof task.completed !== 'boolean') {
            errors.push('Status de conclusão deve ser boolean');
        }

        if (task.createdAt !== undefined && task.createdAt !== null && task.createdAt !== '' && String(task.createdAt).trim() !== '') {
            if (!this.isValidDate(task.createdAt)) {
                errors.push('Data de criação inválida');
            }
        }

        if (task.completedAt !== undefined && task.completedAt !== null && task.completedAt !== '' && String(task.completedAt).trim() !== '') {
            if (!this.isValidDate(task.completedAt)) {
                errors.push('Data de conclusão inválida');
            }
        }

        if (typeof task.isRecurring !== 'boolean') {
            errors.push('Flag de recorrência deve ser boolean');
        }

        if (task.isRecurring && task.recurrenceType && !['daily', 'weekly', 'monthly', 'yearly'].includes(task.recurrenceType)) {
            errors.push('Tipo de recorrência inválido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida array de categorias
     * @param {Array} categories - Array de categorias
     * @param {Array} errors - Array de erros
     * @param {Array} warnings - Array de avisos
     */
    validateCategories(categories, errors, warnings) {
        if (!Array.isArray(categories)) {
            errors.push('Lista de categorias deve ser um array');
            return;
        }

        const categoryIds = new Set();
        const invalidCategories = [];

        categories.forEach((category, index) => {
            const categoryValidation = this.validateCategorySchema(category, index);
            
            if (!categoryValidation.isValid) {
                invalidCategories.push(`Categoria ${index + 1}: ${categoryValidation.errors.join(', ')}`);
            }

            // Verificar IDs duplicados
            if (category.id) {
                if (categoryIds.has(category.id)) {
                    errors.push(`ID de categoria duplicado: ${category.id}`);
                } else {
                    categoryIds.add(category.id);
                }
            }
        });

        if (invalidCategories.length > 0) {
            errors.push(...invalidCategories);
        }
    }

    /**
     * Valida schema de uma categoria individual
     * @param {Object} category - Categoria para validar
     * @param {number} index - Índice da categoria
     * @returns {Object} Resultado da validação
     */
    validateCategorySchema(category, index) {
        const errors = [];

        if (!category || typeof category !== 'object') {
            errors.push('Categoria deve ser um objeto válido');
            return { isValid: false, errors };
        }

        if (!category.id || typeof category.id !== 'string') {
            errors.push('ID é obrigatório e deve ser uma string');
        }

        if (!category.name || typeof category.name !== 'string') {
            errors.push('Nome é obrigatório e deve ser uma string');
        } else if (category.name.length > 50) {
            errors.push('Nome deve ter no máximo 50 caracteres');
        }

        if (!category.color || typeof category.color !== 'string') {
            errors.push('Cor é obrigatória e deve ser uma string');
        } else if (!this.isValidHexColor(category.color)) {
            errors.push('Cor deve estar no formato hexadecimal válido (#RRGGBB)');
        }

        if (category.createdAt !== undefined && category.createdAt !== null && category.createdAt !== '' && !this.isValidDate(category.createdAt)) {
            errors.push('Data de criação inválida');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida array de tags
     * @param {Array} tags - Array de tags
     * @param {Array} errors - Array de erros
     * @param {Array} warnings - Array de avisos
     */
    validateTags(tags, errors, warnings) {
        if (!Array.isArray(tags)) {
            errors.push('Lista de tags deve ser um array');
            return;
        }

        const tagIds = new Set();
        const invalidTags = [];

        tags.forEach((tag, index) => {
            const tagValidation = this.validateTagSchema(tag, index);
            
            if (!tagValidation.isValid) {
                invalidTags.push(`Tag ${index + 1}: ${tagValidation.errors.join(', ')}`);
            }

            // Verificar IDs duplicados
            if (tag.id) {
                if (tagIds.has(tag.id)) {
                    errors.push(`ID de tag duplicado: ${tag.id}`);
                } else {
                    tagIds.add(tag.id);
                }
            }
        });

        if (invalidTags.length > 0) {
            errors.push(...invalidTags);
        }
    }

    /**
     * Valida schema de uma tag individual
     * @param {Object} tag - Tag para validar
     * @param {number} index - Índice da tag
     * @returns {Object} Resultado da validação
     */
    validateTagSchema(tag, index) {
        const errors = [];

        if (!tag || typeof tag !== 'object') {
            errors.push('Tag deve ser um objeto válido');
            return { isValid: false, errors };
        }

        if (!tag.id || typeof tag.id !== 'string') {
            errors.push('ID é obrigatório e deve ser uma string');
        }

        if (!tag.name || typeof tag.name !== 'string') {
            errors.push('Nome é obrigatório e deve ser uma string');
        } else if (tag.name.length > 30) {
            errors.push('Nome deve ter no máximo 30 caracteres');
        }

        if (!tag.color || typeof tag.color !== 'string') {
            errors.push('Cor é obrigatória e deve ser uma string');
        } else if (!this.isValidHexColor(tag.color)) {
            errors.push('Cor deve estar no formato hexadecimal válido (#RRGGBB)');
        }

        if (tag.createdAt !== undefined && tag.createdAt !== null && tag.createdAt !== '' && !this.isValidDate(tag.createdAt)) {
            errors.push('Data de criação inválida');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida configurações do usuário
     * @param {Object} data - Dados para validar
     * @param {Array} errors - Array de erros
     * @param {Array} warnings - Array de avisos
     */
    validateSettings(data, errors, warnings) {
        // Validar nome do usuário
        if (data.userName && typeof data.userName !== 'string') {
            errors.push('Nome do usuário deve ser uma string');
        }

        // Validar tema
        if (data.theme && !['light', 'dark'].includes(data.theme)) {
            errors.push('Tema deve ser: light ou dark');
        }


        if (data.completedTasksDays && typeof data.completedTasksDays !== 'number') {
            errors.push('Dias para tarefas concluídas deve ser um número');
        }

        if (data.sidebarCollapsed && typeof data.sidebarCollapsed !== 'boolean') {
            errors.push('Estado da sidebar deve ser boolean');
        }

        // Validar opções de ordenação
        if (data.sortOptions) {
            if (!data.sortOptions.field || typeof data.sortOptions.field !== 'string') {
                errors.push('Campo de ordenação deve ser uma string');
            }

            if (!data.sortOptions.direction || !['asc', 'desc'].includes(data.sortOptions.direction)) {
                errors.push('Direção de ordenação deve ser: asc ou desc');
            }
        }

        // Validar cores personalizadas
        if (data.customColors && typeof data.customColors !== 'object') {
            errors.push('Cores personalizadas devem ser um objeto');
        } else if (data.customColors) {
            Object.entries(data.customColors).forEach(([key, value]) => {
                if (typeof value !== 'string' || !this.isValidHexColor(value)) {
                    errors.push(`Cor personalizada '${key}' deve ser um hexadecimal válido`);
                }
            });
        }
    }

    /**
     * Valida se uma string é uma data válida
     * @param {string} dateString - String da data
     * @returns {boolean}
     */
    isValidDate(dateString) {
        // Aceitar valores nulos, undefined ou strings vazias como válidos (datas opcionais)
        if (dateString === null || dateString === undefined || dateString === '') return true;
        
        // Verificar se é string
        if (typeof dateString !== 'string') return false;
        
        // Aceitar strings vazias após trim
        if (dateString.trim() === '') return true;
        
        const date = new Date(dateString);
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) return false;
        
        // Aceitar diferentes formatos de data válidos
        // Formato ISO: 2023-12-25T00:00:00.000Z
        // Formato de data simples: 2023-12-25
        // Formato brasileiro: 25/12/2023
        const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
        const simpleDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const brDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        
        return isoRegex.test(dateString) || simpleDateRegex.test(dateString) || brDateRegex.test(dateString);
    }

    /**
     * Valida se uma string é um horário válido
     * @param {string} timeString - String do horário
     * @returns {boolean}
     */
    isValidTime(timeString) {
        // Aceitar valores nulos, undefined ou strings vazias como válidos (horários opcionais)
        if (timeString === null || timeString === undefined || timeString === '') return true;
        
        // Verificar se é string
        if (typeof timeString !== 'string') return false;
        
        // Aceitar strings vazias após trim
        if (timeString.trim() === '') return true;
        
        // Validar formato de horário HH:MM
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString.trim());
    }

    /**
     * Valida se uma string é uma cor hexadecimal válida
     * @param {string} color - String da cor
     * @returns {boolean}
     */
    isValidHexColor(color) {
        if (!color || typeof color !== 'string') return false;
        const hexColorRegex = /^#[0-9A-F]{6}$/i;
        return hexColorRegex.test(color);
    }

    /**
     * Processa os dados importados
     * @param {Object} data - Dados importados
     * @returns {Object} Dados processados
     */
    processImportData(data) {
        return {
            // Dados principais
            tasks: data.tasks || [],
            categories: data.categories || [],
            tags: data.tags || [],
            
            // Preferências do usuário
            userName: data.userName || '',
            customColors: data.customColors || {},
            theme: data.theme || 'light',
            
            // Configurações
            sortOptions: data.sortOptions || { field: 'createdAt', direction: 'desc' },
            completedTasksDays: data.completedTasksDays || 30,
            sidebarCollapsed: data.sidebarCollapsed || false,
            
            // Metadados de importação
            importDate: new Date().toISOString(),
            originalExportDate: data.exportDate,
            originalVersion: data.version
        };
    }

    /**
     * Limpa todos os dados da aplicação
     * @returns {Promise<boolean>} Se a limpeza foi bem-sucedida
     */
    async clearAllData() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            throw error;
        }
    }

    /**
     * Obtém informações sobre o arquivo de exportação
     * @param {Object} data - Dados para exportar
     * @param {string} format - Formato de exportação ('json' ou 'csv')
     * @returns {Object} Informações do arquivo
     */
    getExportInfo(data, format = 'json') {
        const exportData = this.prepareExportData(data);
        
        let content, size;
        if (format === 'csv') {
            content = this.convertToCSV(data);
            size = content.length;
        } else {
            content = JSON.stringify(exportData, null, 2);
            size = content.length;
        }
        
        return {
            filename: this.generateFilename(format),
            format: format,
            size: size,
            sizeFormatted: this.formatFileSize(size),
            tasks: exportData.tasks.length,
            categories: exportData.categories.length,
            tags: exportData.tags.length,
            exportDate: exportData.exportDate,
            version: exportData.version
        };
    }

    /**
     * Formata o tamanho do arquivo
     * @param {number} bytes - Tamanho em bytes
     * @returns {string} Tamanho formatado
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Obtém estatísticas dos dados
     * @param {Object} data - Dados da aplicação
     * @returns {Object} Estatísticas
     */
    getDataStats(data) {
        const tasks = data.tasks || [];
        const categories = data.categories || [];
        const tags = data.tags || [];
        
        return {
            tasks: {
                total: tasks.length,
                completed: tasks.filter(task => task.completed).length,
                pending: tasks.filter(task => !task.completed).length,
                recurring: tasks.filter(task => task.isRecurring).length
            },
            categories: {
                total: categories.length,
                default: categories.filter(cat => ['work', 'personal', 'study'].includes(cat.id)).length,
                custom: categories.filter(cat => !['work', 'personal', 'study'].includes(cat.id)).length
            },
            tags: {
                total: tags.length,
                default: tags.filter(tag => ['urgent', 'important', 'meeting', 'project'].includes(tag.id)).length,
                custom: tags.filter(tag => !['urgent', 'important', 'meeting', 'project'].includes(tag.id)).length
            },
            settings: {
                userName: data.userName || '',
                theme: data.theme || 'light',
                customColors: Object.keys(data.customColors || {}).length
            }
        };
    }

    /**
     * Verifica se os dados são compatíveis
     * @param {Object} data - Dados para verificar
     * @returns {Object} Resultado da verificação
     */
    checkCompatibility(data) {
        const issues = [];
        const warnings = [];
        
        // Verificar versão
        if (data.version && data.version !== this.version) {
            warnings.push(`Versão do arquivo (${data.version}) diferente da versão atual (${this.version})`);
        }
        
        // Verificar estrutura
        if (!Array.isArray(data.tasks)) {
            issues.push('Lista de tarefas não encontrada');
        }
        
        if (!Array.isArray(data.categories)) {
            issues.push('Lista de categorias não encontrada');
        }
        
        if (!Array.isArray(data.tags)) {
            issues.push('Lista de tags não encontrada');
        }
        
        // Verificar metadados
        if (!data.appName || data.appName !== this.appName) {
            warnings.push('Arquivo pode não ser compatível com esta aplicação');
        }
        
        return {
            compatible: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Obtém o estado atual do serviço
     * @returns {Object} Estado do serviço
     */
    getState() {
        return {
            version: this.version,
            appName: this.appName,
            maxFileSize: this.maxFileSize,
            supportedFormats: [...this.supportedFormats]
        };
    }

}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportService;
} else {
    window.ExportService = ExportService;
}
