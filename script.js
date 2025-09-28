// To-Do List & Planner Application
class TodoApp {
    constructor() {
        this.tasks = [];
        this.categories = [];
        this.tags = [];
        this.currentFilter = 'all';
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
        this.editingTaskId = null;
        this.editingCategoryId = null;
        this.editingTagId = null;
        this.sortOptions = JSON.parse(localStorage.getItem('sortOptions')) || {
            field: 'createdAt',
            direction: 'desc'
        };
        this.theme = localStorage.getItem('theme') || 'light';
        this.userName = localStorage.getItem('userName') || '';
        this.customColors = JSON.parse(localStorage.getItem('customColors')) || {};
        this.notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
        this.notificationTime = parseInt(localStorage.getItem('notificationTime')) || 0;
        this.notificationCheckInterval = null;
        this.completedTasksDays = parseInt(localStorage.getItem('completedTasksDays')) || 30;
        this.recurrenceTypes = [
            { value: 'daily', label: 'Diária' },
            { value: 'weekly', label: 'Semanal' },
            { value: 'monthly', label: 'Mensal' },
            { value: 'yearly', label: 'Anual' }
        ];
        
        this.init();
    }

    init() {
        this.loadTasks();
        this.loadCategories();
        this.loadTags();
        this.checkAndGenerateRecurringTasks();
        this.setupEventListeners();
        this.applyTheme();
        this.applyCustomColors();
        this.updateUserGreeting();
        this.setupNotifications();
        this.renderTasks();
        this.renderCategories();
        this.renderTags();
        this.updateSortUI();
        this.updateStats();
    }

    // Theme Management
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    // Settings Management
    updateUserGreeting() {
        const greeting = document.getElementById('userGreeting');
        if (this.userName) {
            const now = new Date();
            const hour = now.getHours();
            let timeGreeting = '';
            
            if (hour < 12) timeGreeting = 'Bom dia';
            else if (hour < 18) timeGreeting = 'Boa tarde';
            else timeGreeting = 'Boa noite';
            
            greeting.textContent = `${timeGreeting}, ${this.userName}!`;
        } else {
            greeting.textContent = 'Bem-vindo!';
        }
    }

    applyCustomColors() {
        const root = document.documentElement;
        
        if (this.customColors.primary) {
            root.style.setProperty('--accent-primary', this.customColors.primary);
        }
        if (this.customColors.success) {
            root.style.setProperty('--success', this.customColors.success);
        }
        if (this.customColors.warning) {
            root.style.setProperty('--warning', this.customColors.warning);
        }
        if (this.customColors.danger) {
            root.style.setProperty('--danger', this.customColors.danger);
        }
    }

    saveCustomColors() {
        localStorage.setItem('customColors', JSON.stringify(this.customColors));
    }

    resetCustomColors() {
        this.customColors = {};
        this.saveCustomColors();
        this.applyCustomColors();
        this.loadSettingsForm();
    }

    // Notifications
    async setupNotifications() {
        if (this.notificationsEnabled && 'Notification' in window) {
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }
            
            if (Notification.permission === 'granted') {
                this.startNotificationCheck();
            }
        }
    }

    startNotificationCheck() {
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
        }
        
        this.notificationCheckInterval = setInterval(() => {
            this.checkUpcomingTasks();
        }, 60000); // Check every minute
    }

    checkUpcomingTasks() {
        if (!this.notificationsEnabled) return;
        
        if (Notification.permission !== 'granted') return;
        
        const now = new Date();
        const notificationTimeMs = this.notificationTime * 60000; // Convert to milliseconds
        
        this.tasks.forEach(task => {
            if (task.completed || !task.dueDate || !task.dueTime) return;
            
            // Create task date/time properly
            const taskDate = this.createLocalDate(task.dueDate);
            const [hours, minutes] = task.dueTime.split(':');
            const taskDateTime = new Date(taskDate);
            taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            const timeUntilTask = taskDateTime.getTime() - now.getTime();
            
            // Check if task is due within the notification time window
            // Only notify if we're within the notification window and haven't notified yet
            if (timeUntilTask > 0 && timeUntilTask <= notificationTimeMs) {
                // Check if we already notified for this task recently (within 5 minutes)
                const notificationKey = `notified_${task.id}`;
                const lastNotification = localStorage.getItem(notificationKey);
                const nowTime = now.getTime();
                
                if (!lastNotification || (nowTime - parseInt(lastNotification)) > 300000) { // 5 minutes
                    this.showNotification(task);
                    localStorage.setItem(notificationKey, nowTime.toString());
                }
            }
        });
    }

    showNotification(task) {
        if (Notification.permission === 'granted') {
            new Notification(`Tarefa vencendo: ${task.title}`, {
                body: `Vence em ${task.dueTime}`,
                icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007bff"%3E%3Cpath d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/%3E%3Cpath d="M9 12.17L4.83 8l-1.42 1.41L9 15 21 3l-1.41-1.41z"/%3E%3Ccircle cx="12" cy="20" r="2"/%3E%3C/svg%3E',
                tag: `task-${task.id}`
            });
        }
    }

    testNotification() {
        if (Notification.permission === 'granted') {
            new Notification('Teste de Notificação', {
                body: 'As notificações estão funcionando corretamente!',
                icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007bff"%3E%3Cpath d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/%3E%3Cpath d="M9 12.17L4.83 8l-1.42 1.41L9 15 21 3l-1.41-1.41z"/%3E%3Ccircle cx="12" cy="20" r="2"/%3E%3C/svg%3E'
            });
        } else {
            alert('Permissão para notificações não foi concedida.');
        }
    }

    // Debug function to test notification logic
    debugNotificationLogic() {
        console.log('=== DEBUG NOTIFICAÇÕES ===');
        console.log('Notificações habilitadas:', this.notificationsEnabled);
        console.log('Tempo de notificação:', this.notificationTime, 'minutos');
        console.log('Permissão:', Notification.permission);
        
        const now = new Date();
        console.log('Hora atual:', now.toLocaleString());
        
        this.tasks.forEach((task, index) => {
            if (task.completed || !task.dueDate || !task.dueTime) return;
            
            const taskDate = this.createLocalDate(task.dueDate);
            const [hours, minutes] = task.dueTime.split(':');
            const taskDateTime = new Date(taskDate);
            taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            const timeUntilTask = taskDateTime.getTime() - now.getTime();
            const minutesUntilTask = Math.round(timeUntilTask / 60000);
            
            console.log(`Tarefa ${index + 1}:`, {
                title: task.title,
                dueDate: task.dueDate,
                dueTime: task.dueTime,
                taskDateTime: taskDateTime.toLocaleString(),
                minutesUntilTask: minutesUntilTask,
                shouldNotify: timeUntilTask > 0 && timeUntilTask <= (this.notificationTime * 60000)
            });
        });
        console.log('=== FIM DEBUG ===');
    }

    // Data Export/Import
    exportData() {
        const data = {
            // Core data
            tasks: this.tasks,
            categories: this.categories,
            tags: this.tags,
            
            // User preferences
            userName: this.userName,
            customColors: this.customColors,
            theme: this.theme,
            
            // Settings
            sortOptions: this.sortOptions,
            notificationsEnabled: this.notificationsEnabled,
            notificationTime: this.notificationTime,
            completedTasksDays: this.completedTasksDays,
            
            // Metadata
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            appName: 'Planno - To-Do List & Planner',
            developer: 'Rafaela Carvalho (@rafaelarc)'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `planno-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        this.showExportSuccessMessage();
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('Isso irá substituir todos os seus dados atuais. Continuar?')) {
                    // Import core data
                    this.tasks = data.tasks || [];
                    this.categories = data.categories || [];
                    this.tags = data.tags || [];
                    
                    // Import user preferences
                    this.userName = data.userName || '';
                    this.customColors = data.customColors || {};
                    this.theme = data.theme || 'light';
                    
                    // Import settings
                    this.sortOptions = data.sortOptions || { field: 'createdAt', direction: 'desc' };
                    this.notificationsEnabled = data.notificationsEnabled || false;
                    this.notificationTime = data.notificationTime || 0;
                    this.completedTasksDays = data.completedTasksDays || 30;
                    
                    // Save to localStorage
                    this.saveTasks();
                    this.saveCategories();
                    this.saveTags();
                    localStorage.setItem('userName', this.userName);
                    this.saveCustomColors();
                    localStorage.setItem('theme', this.theme);
                    this.saveSortOptions();
                    localStorage.setItem('notificationsEnabled', this.notificationsEnabled);
                    localStorage.setItem('notificationTime', this.notificationTime);
                    localStorage.setItem('completedTasksDays', this.completedTasksDays);
                    
                    // Update UI
                    this.applyTheme();
                    this.applyCustomColors();
                    this.updateUserGreeting();
                    this.renderTasks();
                    this.renderCategories();
                    this.renderTags();
                    this.updateSortUI();
                    this.updateStats();
                    this.loadSettingsForm();
                    this.setupNotifications();
                    
                    alert('Dados importados com sucesso!');
                }
            } catch (error) {
                alert('Erro ao importar arquivo. Verifique se é um arquivo válido.');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os seus dados permanentemente. Esta ação não pode ser desfeita!\n\nTem certeza que deseja continuar?')) {
            localStorage.clear();
            location.reload();
        }
    }

    // Settings Page Management
    openSettings() {
        document.getElementById('settingsPage').classList.add('show');
        this.loadSettingsForm();
    }

    closeSettings() {
        document.getElementById('settingsPage').classList.remove('show');
    }

    loadSettingsForm() {
        // Load user name
        document.getElementById('userName').value = this.userName;
        
        // Load colors
        const defaultColors = {
            primary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545'
        };
        
        Object.keys(defaultColors).forEach(colorType => {
            const color = this.customColors[colorType] || defaultColors[colorType];
            document.getElementById(`${colorType}Color`).value = color;
            document.getElementById(`${colorType}ColorText`).value = color;
        });
        
        // Load notifications
        document.getElementById('enableNotifications').checked = this.notificationsEnabled;
        document.getElementById('notificationTime').value = this.notificationTime;
        
        // Load display settings
        document.getElementById('completedTasksDays').value = this.completedTasksDays;
        
        // Load sort settings
        document.getElementById('sortField').value = this.sortOptions.field;
        document.getElementById('sortDirection').value = this.sortOptions.direction;
        
        // Show/hide notification settings
        const notificationSettings = document.getElementById('notificationSettings');
        notificationSettings.style.display = this.notificationsEnabled ? 'block' : 'none';
        
        // Load last update
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('pt-BR');
    }

    saveSettings() {
        // Save user name
        this.userName = document.getElementById('userName').value.trim();
        localStorage.setItem('userName', this.userName);
        this.updateUserGreeting();
        
        // Save colors
        const colorTypes = ['primary', 'success', 'warning', 'danger'];
        colorTypes.forEach(colorType => {
            const color = document.getElementById(`${colorType}Color`).value;
            this.customColors[colorType] = color;
        });
        this.saveCustomColors();
        this.applyCustomColors();
        
        // Save notifications
        this.notificationsEnabled = document.getElementById('enableNotifications').checked;
        this.notificationTime = parseInt(document.getElementById('notificationTime').value);
        localStorage.setItem('notificationsEnabled', this.notificationsEnabled);
        localStorage.setItem('notificationTime', this.notificationTime);
        
        // Setup notifications
        this.setupNotifications();
        
        alert('Configurações salvas com sucesso!');
    }

    // Color input synchronization
    syncColorInputs(colorType) {
        const colorInput = document.getElementById(`${colorType}Color`);
        const textInput = document.getElementById(`${colorType}ColorText`);
        
        colorInput.addEventListener('input', () => {
            textInput.value = colorInput.value.toUpperCase();
        });
        
        textInput.addEventListener('input', () => {
            const value = textInput.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                colorInput.value = value;
            }
        });
    }

    // Category Management
    addCategory(categoryData) {
        const category = {
            id: this.generateId(),
            name: categoryData.name.trim(),
            color: categoryData.color,
            createdAt: new Date().toISOString()
        };
        
        this.categories.push(category);
        this.saveCategories();
        this.renderCategories();
        this.updateCategorySelects();
    }

    updateCategory(categoryId, categoryData) {
        const categoryIndex = this.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex !== -1) {
            this.categories[categoryIndex] = { ...this.categories[categoryIndex], ...categoryData };
            this.saveCategories();
            this.renderCategories();
            this.updateCategorySelects();
            this.renderTasks(); // Re-render tasks to update category colors
        }
    }

    deleteCategory(categoryId) {
        // Check if category is in use
        const tasksUsingCategory = this.tasks.filter(task => task.category === categoryId);
        if (tasksUsingCategory.length > 0) {
            alert(`Esta categoria está sendo usada por ${tasksUsingCategory.length} tarefa(s). Não é possível excluí-la.`);
            return false;
        }

        this.categories = this.categories.filter(cat => cat.id !== categoryId);
        this.saveCategories();
        this.renderCategories();
        this.updateCategorySelects();
        return true;
    }

    getCategoryById(categoryId) {
        return this.categories.find(cat => cat.id === categoryId);
    }

    getCategoryUsageCount(categoryId) {
        return this.tasks.filter(task => task.category === categoryId && !task.completed).length;
    }

    // Tag Management
    addTag(tagData) {
        const tag = {
            id: this.generateId(),
            name: tagData.name.trim(),
            color: tagData.color,
            createdAt: new Date().toISOString()
        };
        
        this.tags.push(tag);
        this.saveTags();
        this.renderTags();
        this.updateTagSelects();
    }

    updateTag(tagId, tagData) {
        const tagIndex = this.tags.findIndex(tag => tag.id === tagId);
        if (tagIndex !== -1) {
            this.tags[tagIndex] = { ...this.tags[tagIndex], ...tagData };
            this.saveTags();
            this.renderTags();
            this.updateTagSelects();
            this.renderTasks(); // Re-render tasks to update tag colors
        }
    }

    deleteTag(tagId) {
        // Check if tag is in use
        const tasksUsingTag = this.tasks.filter(task => task.tags && task.tags.includes(tagId));
        if (tasksUsingTag.length > 0) {
            alert(`Esta tag está sendo usada por ${tasksUsingTag.length} tarefa(s). Não é possível excluí-la.`);
            return false;
        }

        this.tags = this.tags.filter(tag => tag.id !== tagId);
        this.saveTags();
        this.renderTags();
        this.updateTagSelects();
        return true;
    }

    getTagById(tagId) {
        return this.tags.find(tag => tag.id === tagId);
    }

    getTagUsageCount(tagId) {
        return this.tasks.filter(task => task.tags && task.tags.includes(tagId) && !task.completed).length;
    }

    saveTags() {
        localStorage.setItem('todoTags', JSON.stringify(this.tags));
    }

    loadTags() {
        const savedTags = localStorage.getItem('todoTags');
        if (savedTags) {
            this.tags = JSON.parse(savedTags);
        } else {
            // Initialize with default tags
            this.tags = [
                { id: 'urgent', name: 'Urgente', color: '#dc3545', createdAt: new Date().toISOString() },
                { id: 'important', name: 'Importante', color: '#ffc107', createdAt: new Date().toISOString() },
                { id: 'meeting', name: 'Reunião', color: '#17a2b8', createdAt: new Date().toISOString() },
                { id: 'project', name: 'Projeto', color: '#28a745', createdAt: new Date().toISOString() }
            ];
            this.saveTags();
        }
    }

    // Task Management
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            category: taskData.category || 'personal',
            tags: taskData.tags || [],
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || '',
            dueTime: taskData.dueTime || '',
            completed: false,
            createdAt: new Date().toISOString(),
            isRecurring: taskData.isRecurring || false,
            recurrenceType: taskData.recurrenceType || null,
            recurrenceData: taskData.recurrenceData || null,
            parentRecurringId: taskData.parentRecurringId || null
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.renderCategories();
        this.renderTags();
        this.updateStats();
    }

    generateNextRecurringTask(parentTask) {
        const nextDate = this.calculateNextRecurrenceDate(parentTask);
        if (!nextDate) return;

        // Formatar data para YYYY-MM-DD no horário local
        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, '0');
        const day = String(nextDate.getDate()).padStart(2, '0');
        const localDateString = `${year}-${month}-${day}`;

        const nextTask = {
            ...parentTask,
            id: this.generateId(),
            dueDate: localDateString,
            completed: false,
            createdAt: new Date().toISOString(),
            parentRecurringId: parentTask.id
        };

        this.tasks.push(nextTask);
        this.saveTasks();
        this.renderTasks();
        this.renderCategories();
        this.renderTags();
        this.updateStats();
    }

    calculateNextRecurrenceDate(task) {
        // Criar data local para evitar problemas de fuso horário
        const currentDate = this.createLocalDate(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (task.recurrenceType) {
            case 'daily':
                return this.addDays(currentDate, 1);
            
            case 'weekly':
                const weekdays = task.recurrenceData?.weekdays || [];
                if (weekdays.length === 0) return this.addDays(currentDate, 7);
                
                // Find next weekday from the selected list
                const currentWeekday = currentDate.getDay();
                const selectedWeekdays = weekdays.map(Number).sort((a, b) => a - b);
                
                // Look for next weekday in the same week
                for (const weekday of selectedWeekdays) {
                    if (weekday > currentWeekday) {
                        const daysToAdd = weekday - currentWeekday;
                        return this.addDays(currentDate, daysToAdd);
                    }
                }
                
                // If no weekday found in current week, find first weekday of next week
                const firstWeekday = selectedWeekdays[0];
                const daysToNextWeek = 7 - currentWeekday + firstWeekday;
                return this.addDays(currentDate, daysToNextWeek);
            
            case 'monthly':
                return this.addMonths(currentDate, 1);
            
            case 'yearly':
                return this.addYears(currentDate, 1);
            
            default:
                return null;
        }
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    addYears(date, years) {
        const result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }

    checkAndGenerateRecurringTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.tasks.forEach(task => {
            if (task.isRecurring && !task.parentRecurringId) {
                const taskDate = this.createLocalDate(task.dueDate);
                
                // Only generate next occurrence if:
                // 1. Task is completed AND due today or past due
                // 2. OR task is past due (overdue) and not completed
                if ((task.completed && taskDate <= today) || (!task.completed && taskDate < today)) {
                    const hasNextOccurrence = this.tasks.some(t => 
                        t.parentRecurringId === task.id && 
                        this.createLocalDate(t.dueDate) > today
                    );
                    
                    if (!hasNextOccurrence) {
                        this.generateNextRecurringTask(task);
                    }
                }
            }
        });
    }

    updateTask(taskId, taskData) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
            this.saveTasks();
            this.renderTasks();
            this.renderCategories();
            this.renderTags();
            this.updateStats();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.renderCategories();
        this.renderTags();
        this.updateStats();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            const wasCompleted = task.completed;
            task.completed = !task.completed;
            
            // If completing a recurring task, generate next occurrence
            if (!wasCompleted && task.completed && task.isRecurring) {
                this.generateNextRecurringTask(task);
            }
            
            this.saveTasks();
            this.renderTasks();
            this.renderCategories();
            this.renderTags();
            this.updateStats();
        }
    }

    // Recurring Task Management
    deleteRecurringSeries(parentTaskId) {
        if (confirm('Isso irá excluir toda a série de tarefas recorrentes. Continuar?')) {
            // Delete parent task and all its occurrences
            this.tasks = this.tasks.filter(task => 
                task.id !== parentTaskId && task.parentRecurringId !== parentTaskId
            );
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    pauseRecurringSeries(parentTaskId) {
        const parentTask = this.tasks.find(task => task.id === parentTaskId);
        if (parentTask) {
            parentTask.isRecurring = false;
            this.saveTasks();
            this.renderTasks();
            alert('Série recorrente pausada. As tarefas futuras não serão geradas automaticamente.');
        }
    }

    resumeRecurringSeries(parentTaskId) {
        const parentTask = this.tasks.find(task => task.id === parentTaskId);
        if (parentTask) {
            parentTask.isRecurring = true;
            this.saveTasks();
            this.renderTasks();
            alert('Série recorrente reativada. As tarefas futuras serão geradas automaticamente.');
        }
    }

    getRecurringSeries(parentTaskId) {
        return this.tasks.filter(task => 
            task.id === parentTaskId || task.parentRecurringId === parentTaskId
        );
    }

    manageRecurringSeries(parentTaskId) {
        const parentTask = this.tasks.find(task => task.id === parentTaskId);
        if (!parentTask) return;

        const series = this.getRecurringSeries(parentTaskId);
        const futureTasks = series.filter(task => 
            this.createLocalDate(task.dueDate) > new Date() && !task.completed
        );

        const options = [
            `📊 Ver série (${series.length} tarefas)`,
            `⏸️ Pausar série`,
            `▶️ Reativar série`,
            `🗑️ Excluir série completa`,
            `❌ Cancelar`
        ];

        const choice = prompt(`Gerenciar série: "${parentTask.title}"\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nDigite o número da opção:`);

        switch (choice) {
            case '1':
                this.showRecurringSeriesInfo(parentTaskId, series);
                break;
            case '2':
                this.pauseRecurringSeries(parentTaskId);
                break;
            case '3':
                this.resumeRecurringSeries(parentTaskId);
                break;
            case '4':
                this.deleteRecurringSeries(parentTaskId);
                break;
            default:
                break;
        }
    }

    showRecurringSeriesInfo(parentTaskId, series) {
        const parentTask = series.find(task => task.id === parentTaskId);
        const completedTasks = series.filter(task => task.completed);
        const pendingTasks = series.filter(task => !task.completed);
        const futureTasks = pendingTasks.filter(task => this.createLocalDate(task.dueDate) > new Date());

        let info = `📊 Série: "${parentTask.title}"\n\n`;
        info += `🔄 Tipo: ${this.getRecurrenceLabel(parentTask.recurrenceType)}\n`;
        info += `📅 Total de tarefas: ${series.length}\n`;
        info += `✅ Concluídas: ${completedTasks.length}\n`;
        info += `⏳ Pendentes: ${pendingTasks.length}\n`;
        info += `🔮 Futuras: ${futureTasks.length}\n\n`;

        if (futureTasks.length > 0) {
            info += `Próximas tarefas:\n`;
            futureTasks.slice(0, 5).forEach(task => {
                const date = this.createLocalDate(task.dueDate).toLocaleDateString('pt-BR');
                info += `• ${date}${task.dueTime ? ` às ${task.dueTime}` : ''}\n`;
            });
            if (futureTasks.length > 5) {
                info += `• ... e mais ${futureTasks.length - 5} tarefas\n`;
            }
        }

        alert(info);
    }

    // Data Persistence
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('todoTasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
    }

    saveCategories() {
        localStorage.setItem('todoCategories', JSON.stringify(this.categories));
    }

    loadCategories() {
        const savedCategories = localStorage.getItem('todoCategories');
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        } else {
            // Initialize with default categories
            this.categories = [
                { id: 'work', name: 'Trabalho', color: '#ff6b6b', createdAt: new Date().toISOString() },
                { id: 'personal', name: 'Pessoal', color: '#4ecdc4', createdAt: new Date().toISOString() },
                { id: 'study', name: 'Estudos', color: '#45b7d1', createdAt: new Date().toISOString() }
            ];
            this.saveCategories();
        }
    }

    // Filtering and Search
    getFilteredTasks() {
        let filtered = this.tasks;

        // Apply status filter
        switch (this.currentFilter) {
            case 'pending':
                filtered = filtered.filter(task => !task.completed);
                break;
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                // Apply completed tasks days filter
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
            case 'low':
                filtered = filtered.filter(task => task.priority === 'low');
                break;
            case 'medium':
                filtered = filtered.filter(task => task.priority === 'medium');
                break;
            case 'high':
                filtered = filtered.filter(task => task.priority === 'high');
                break;
        }

        // Hide completed tasks from all filters except 'completed'
        if (this.currentFilter !== 'completed') {
            filtered = filtered.filter(task => !task.completed);
        }

        // Apply category filter
        if (this.currentCategoryFilter) {
            filtered = filtered.filter(task => task.category === this.currentCategoryFilter);
        }

        // Apply tag filter
        if (this.currentTagFilter) {
            filtered = filtered.filter(task => task.tags && task.tags.includes(this.currentTagFilter));
        }

        // Apply search filter
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(task => {
                const titleMatch = task.title.toLowerCase().includes(searchTerm);
                const descriptionMatch = task.description.toLowerCase().includes(searchTerm);
                
                // Search in tags
                let tagMatch = false;
                if (task.tags && task.tags.length > 0) {
                    const taskTags = task.tags.map(tagId => this.getTagById(tagId)).filter(tag => tag);
                    tagMatch = taskTags.some(tag => tag.name.toLowerCase().includes(searchTerm));
                }
                
                return titleMatch || descriptionMatch || tagMatch;
            });
        }

        return this.sortTasks(filtered);
    }

    // Dynamic Sorting
    sortTasks(tasks) {
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
                    const categoryA = this.getCategoryById(a.category);
                    const categoryB = this.getCategoryById(b.category);
                    aValue = categoryA ? categoryA.name.toLowerCase() : '';
                    bValue = categoryB ? categoryB.name.toLowerCase() : '';
                    break;
                    
                case 'tags':
                    const tagsA = a.tags ? a.tags.map(tagId => {
                        const tag = this.getTagById(tagId);
                        return tag ? tag.name.toLowerCase() : '';
                    }).sort().join(',') : '';
                    const tagsB = b.tags ? b.tags.map(tagId => {
                        const tag = this.getTagById(tagId);
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


    saveSortOptions() {
        localStorage.setItem('sortOptions', JSON.stringify(this.sortOptions));
    }


    saveAllSettings() {
        // Save user name
        this.userName = document.getElementById('userName').value.trim();
        localStorage.setItem('userName', this.userName);
        this.updateUserGreeting();
        
        // Save colors
        const colorTypes = ['primary', 'success', 'warning', 'danger'];
        colorTypes.forEach(colorType => {
            const color = document.getElementById(`${colorType}Color`).value;
            this.customColors[colorType] = color;
        });
        this.saveCustomColors();
        this.applyCustomColors();
        
        // Save notifications
        this.notificationsEnabled = document.getElementById('enableNotifications').checked;
        this.notificationTime = parseInt(document.getElementById('notificationTime').value);
        localStorage.setItem('notificationsEnabled', this.notificationsEnabled);
        localStorage.setItem('notificationTime', this.notificationTime);
        
        // Save display settings
        this.completedTasksDays = parseInt(document.getElementById('completedTasksDays').value);
        localStorage.setItem('completedTasksDays', this.completedTasksDays);
        
        // Save sort settings
        this.sortOptions.field = document.getElementById('sortField').value;
        this.sortOptions.direction = document.getElementById('sortDirection').value;
        this.saveSortOptions();
        
        // Setup notifications
        this.setupNotifications();
        
        // Update UI with all new settings
        this.renderTasks();
        this.updateSortUI();
        
        // Show success message
        this.showSaveSuccessMessage();
    }

    resetAllSettings() {
        if (confirm('⚠️ ATENÇÃO: Isso irá resetar TODAS as configurações para os valores padrão. Esta ação não pode ser desfeita!\n\nTem certeza que deseja continuar?')) {
            // Reset user name
            this.userName = '';
            localStorage.removeItem('userName');
            
            // Reset colors
            this.customColors = {};
            this.saveCustomColors();
            this.applyCustomColors();
            
            // Reset notifications
            this.notificationsEnabled = false;
            this.notificationTime = 0;
            localStorage.setItem('notificationsEnabled', 'false');
            localStorage.setItem('notificationTime', '0');
            
            // Reset display settings
            this.completedTasksDays = 30;
            localStorage.setItem('completedTasksDays', '30');
            
            // Reset sort settings
            this.sortOptions = { field: 'createdAt', direction: 'desc' };
            this.saveSortOptions();
            
            // Setup notifications
            this.setupNotifications();
            
            // Reload settings form
            this.loadSettingsForm();
            
            // Update UI
            this.renderTasks();
            this.updateSortUI();
            this.updateUserGreeting();
            
            alert('Todas as configurações foram resetadas para os valores padrão!');
        }
    }

    showSaveSuccessMessage() {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'save-success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <span>Todas as configurações foram salvas com sucesso!</span>
            </div>
        `;
        
        // Add styles
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, 3000);
    }

    showExportSuccessMessage() {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'export-success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-download"></i>
                <span>Backup exportado com sucesso!</span>
            </div>
        `;
        
        // Add styles
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, 3000);
    }

    // User Guide Methods
    openGuide() {
        const guideModal = document.getElementById('guideModal');
        guideModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Show first section by default
        this.showGuideSection('getting-started');
    }

    closeGuide() {
        const guideModal = document.getElementById('guideModal');
        guideModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showGuideSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.guide-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.guide-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Activate corresponding nav link
        const targetLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Scroll to top of content
        const guideContent = document.querySelector('.guide-content');
        if (guideContent) {
            guideContent.scrollTop = 0;
        }
    }

    updateSortUI() {
        const fieldSelect = document.getElementById('sortField');
        const directionSelect = document.getElementById('sortDirection');
        const sortText = document.getElementById('sortText');
        
        if (fieldSelect) fieldSelect.value = this.sortOptions.field;
        if (directionSelect) directionSelect.value = this.sortOptions.direction;
        
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
            
            const fieldLabel = fieldLabels[this.sortOptions.field] || 'Data de Criação';
            const directionLabel = directionLabels[this.sortOptions.direction] || 'Decrescente';
            
            sortText.textContent = `Ordenado por ${fieldLabel} (${directionLabel})`;
        }
    }

    // Date filtering helper methods
    createLocalDate(dateString) {
        // Criar data local sem problemas de fuso horário
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    isTaskDueToday(task) {
        if (!task.dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = this.createLocalDate(task.dueDate);
        
        return today.toDateString() === taskDate.toDateString();
    }

    isTaskUpcoming(task) {
        if (!task.dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = this.createLocalDate(task.dueDate);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        return taskDate > today && taskDate <= nextWeek;
    }

    isTaskOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = this.createLocalDate(task.dueDate);
        
        return taskDate < today;
    }

    // Rendering
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
    }

    renderCategories() {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = this.categories.map(category => this.createCategoryHTML(category)).join('');
    }

    renderTags() {
        const tagList = document.getElementById('tagList');
        if (tagList) {
            tagList.innerHTML = this.tags.map(tag => this.createTagHTML(tag)).join('');
        }
    }

    createCategoryHTML(category) {
        const usageCount = this.getCategoryUsageCount(category.id);
        const isActive = this.currentCategoryFilter === category.id;
        return `
            <div class="category-item ${isActive ? 'active' : ''}" 
                 data-category-id="${category.id}" 
                 onclick="app.filterByCategory('${category.id}')">
                <span class="category-color" style="background-color: ${category.color};"></span>
                <span>${this.escapeHtml(category.name)}</span>
                ${usageCount > 0 ? `<span class="category-usage">(${usageCount})</span>` : ''}
            </div>
        `;
    }

    createTagHTML(tag) {
        const usageCount = this.getTagUsageCount(tag.id);
        const isActive = this.currentTagFilter === tag.id;
        return `
            <div class="tag-item ${isActive ? 'active' : ''}" 
                 data-tag-id="${tag.id}" 
                 onclick="app.filterByTag('${tag.id}')">
                <span class="tag-color" style="background-color: ${tag.color};"></span>
                <span>${this.escapeHtml(tag.name)}</span>
                ${usageCount > 0 ? `<span class="tag-usage">(${usageCount})</span>` : ''}
            </div>
        `;
    }

    renderCategoryManagement() {
        const categoryManagementList = document.getElementById('categoriesManagementList');
        categoryManagementList.innerHTML = this.categories.map(category => this.createCategoryManagementHTML(category)).join('');
    }

    renderTagManagement() {
        const tagManagementList = document.getElementById('tagsManagementList');
        tagManagementList.innerHTML = this.tags.map(tag => this.createTagManagementHTML(tag)).join('');
    }

    createCategoryManagementHTML(category) {
        const usageCount = this.getCategoryUsageCount(category.id);
        const isEditing = this.editingCategoryId === category.id;
        
        if (isEditing) {
            return `
                <div class="category-management-item" data-category-id="${category.id}">
                    <div class="edit-category-form">
                        <input type="text" id="editCategoryName_${category.id}" value="${this.escapeHtml(category.name)}" placeholder="Nome da categoria">
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
                    <span class="category-management-name">${this.escapeHtml(category.name)}</span>
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

    createTagManagementHTML(tag) {
        const usageCount = this.getTagUsageCount(tag.id);
        const isEditing = this.editingTagId === tag.id;
        
        if (isEditing) {
            return `
                <div class="tag-management-item" data-tag-id="${tag.id}">
                    <div class="edit-tag-form">
                        <input type="text" id="editTagName_${tag.id}" value="${this.escapeHtml(tag.name)}" placeholder="Nome da tag">
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
                    <span class="tag-management-name">${this.escapeHtml(tag.name)}</span>
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

    createTaskHTML(task) {
        const category = this.getCategoryById(task.category);
        const categoryColor = category ? category.color : '#6c757d';
        const categoryName = category ? category.name : 'Sem categoria';
        
        // Get task tags
        const taskTags = task.tags ? task.tags.map(tagId => this.getTagById(tagId)).filter(tag => tag) : [];

        const priorityClasses = {
            high: 'priority-high',
            medium: 'priority-medium',
            low: 'priority-low'
        };

        const priorityNames = {
            high: 'Alta',
            medium: 'Média',
            low: 'Baixa'
        };

        const dueDate = task.dueDate ? this.createLocalDate(task.dueDate).toLocaleDateString('pt-BR') : '';
        const dueTime = task.dueTime || '';

        // Determine urgency indicators
        const isOverdue = this.isTaskOverdue(task);
        const isDueToday = this.isTaskDueToday(task);
        const isUpcoming = this.isTaskUpcoming(task);

        let urgencyClass = '';
        let urgencyIcon = '';
        let urgencyText = '';

        if (isOverdue) {
            urgencyClass = 'overdue';
            urgencyIcon = 'fas fa-exclamation-triangle';
            urgencyText = 'Atrasada';
        } else if (isDueToday) {
            urgencyClass = 'due-today';
            urgencyIcon = 'fas fa-clock';
            urgencyText = 'Hoje';
        } else if (isUpcoming) {
            urgencyClass = 'upcoming';
            urgencyIcon = 'fas fa-calendar-check';
            urgencyText = 'Em breve';
        }

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${urgencyClass} ${task.isRecurring ? 'recurring' : ''}" data-task-id="${task.id}">
                <div class="task-header-content">
                    <div class="task-main">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                               onchange="app.toggleTaskComplete('${task.id}')">
                        <div class="task-content">
                            <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn edit" onclick="app.editTask('${task.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${task.isRecurring && !task.parentRecurringId ? `
                            <button class="task-action-btn recurring-manage" onclick="app.manageRecurringSeries('${task.id}')" title="Gerenciar Série">
                                <i class="fas fa-cog"></i>
                            </button>
                        ` : ''}
                        <button class="task-action-btn delete" onclick="app.deleteTaskConfirm('${task.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="task-meta">
                    <div class="task-category">
                        <span class="category-color" style="background-color: ${categoryColor};"></span>
                        <span>${categoryName}</span>
                    </div>
                    <div class="task-priority ${priorityClasses[task.priority]}">
                        ${priorityNames[task.priority]}
                    </div>
                    ${dueDate ? `
                        <div class="task-date">
                            <i class="fas fa-calendar"></i>
                            <span>${dueDate}${dueTime ? ` às ${dueTime}` : ''}</span>
                        </div>
                    ` : ''}
                    ${urgencyClass ? `
                        <div class="task-urgency ${urgencyClass}">
                            <i class="${urgencyIcon}"></i>
                            <span>${urgencyText}</span>
                        </div>
                    ` : ''}
                    ${task.isRecurring ? `
                        <div class="task-recurrence">
                            <i class="fas fa-sync-alt"></i>
                            <span>${this.getRecurrenceLabel(task.recurrenceType)}</span>
                        </div>
                    ` : ''}
                    ${taskTags.length > 0 ? `
                        <div class="task-tags">
                            ${taskTags.map(tag => `
                                <span class="task-tag" style="background-color: ${tag.color};">
                                    ${this.escapeHtml(tag.name)}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getRecurrenceLabel(recurrenceType) {
        const labels = {
            daily: 'Diária',
            weekly: 'Semanal',
            monthly: 'Mensal',
            yearly: 'Anual'
        };
        return labels[recurrenceType] || 'Recorrente';
    }

    getEmptyStateHTML() {
        const messages = {
            all: 'Nenhuma tarefa encontrada',
            pending: 'Nenhuma tarefa pendente',
            completed: 'Nenhuma tarefa concluída',
            recurring: 'Nenhuma tarefa recorrente',
            today: 'Nenhuma tarefa para hoje',
            upcoming: 'Nenhuma tarefa em breve',
            overdue: 'Nenhuma tarefa atrasada',
            low: 'Nenhuma tarefa de baixa prioridade',
            medium: 'Nenhuma tarefa de média prioridade',
            high: 'Nenhuma tarefa de alta prioridade'
        };

        const descriptions = {
            all: 'Comece adicionando uma nova tarefa!',
            pending: 'Todas as suas tarefas estão concluídas!',
            completed: 'Nenhuma tarefa foi concluída ainda.',
            recurring: 'Crie tarefas recorrentes para automatizar sua rotina!',
            today: 'Não há tarefas com vencimento para hoje.',
            upcoming: 'Não há tarefas com vencimento nos próximos 7 dias.',
            overdue: 'Ótimo! Não há tarefas atrasadas.',
            low: 'Nenhuma tarefa tem prioridade baixa.',
            medium: 'Nenhuma tarefa tem prioridade média.',
            high: 'Nenhuma tarefa tem prioridade alta.'
        };

        return `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>${messages[this.currentFilter] || 'Nenhuma tarefa encontrada'}</h3>
                <p>${descriptions[this.currentFilter] || 'Comece adicionando uma nova tarefa!'}</p>
            </div>
        `;
    }

    // Modal Management
    openModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const title = document.getElementById('modalTitle');
        
        this.editingTaskId = taskId;
        
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                title.textContent = 'Editar Tarefa';
                this.populateForm(task);
            }
        } else {
            title.textContent = 'Nova Tarefa';
            form.reset();
        }
        
        // Update tag selection
        this.updateTagSelects();
        
        modal.classList.add('show');
        document.getElementById('taskTitle').focus();
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('show');
        this.editingTaskId = null;
        
        // Reset form
        document.getElementById('taskForm').reset();
        document.getElementById('recurrenceOptions').style.display = 'none';
        document.getElementById('weeklyOptions').style.display = 'none';
        
        // Reset weekday checkboxes visual state
        document.querySelectorAll('.weekday-label').forEach(label => {
            label.classList.remove('checked');
        });
        
        // Reset tag checkboxes
        document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    // Category Modal Management
    openCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.add('show');
        this.renderCategoryManagement();
        document.getElementById('categoryName').focus();
    }

    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.remove('show');
        this.editingCategoryId = null;
    }

    // Tag Modal Management
    openTagModal() {
        const modal = document.getElementById('tagModal');
        modal.classList.add('show');
        this.renderTagManagement();
        document.getElementById('tagName').focus();
    }

    closeTagModal() {
        const modal = document.getElementById('tagModal');
        modal.classList.remove('show');
        this.editingTagId = null;
    }

    updateCategorySelects() {
        const categorySelect = document.getElementById('taskCategory');
        if (categorySelect) {
            categorySelect.innerHTML = this.categories.map(category => 
                `<option value="${category.id}">${this.escapeHtml(category.name)}</option>`
            ).join('');
        }
    }

    updateTagSelects() {
        const tagContainer = document.getElementById('tagSelection');
        if (tagContainer) {
            tagContainer.innerHTML = this.tags.map(tag => `
                <label class="tag-checkbox-label">
                    <input type="checkbox" class="tag-checkbox" value="${tag.id}">
                    <span class="tag-checkbox-text" style="background-color: ${tag.color};">
                        ${this.escapeHtml(tag.name)}
                    </span>
                </label>
            `).join('');
        }
    }

    populateForm(task) {
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDate').value = task.dueDate;
        document.getElementById('taskTime').value = task.dueTime;
        
        // Populate tags
        if (task.tags && task.tags.length > 0) {
            task.tags.forEach(tagId => {
                const tagCheckbox = document.querySelector(`input[type="checkbox"][value="${tagId}"]`);
                if (tagCheckbox) {
                    tagCheckbox.checked = true;
                }
            });
        }
    }

    // Statistics
    updateStats() {
        let tasksToCount = this.tasks;
        
        // If filtering by category, only count tasks in that category
        if (this.currentCategoryFilter) {
            tasksToCount = this.tasks.filter(task => task.category === this.currentCategoryFilter);
        }
        
        // If filtering by tag, only count tasks with that tag
        if (this.currentTagFilter) {
            tasksToCount = tasksToCount.filter(task => task.tags && task.tags.includes(this.currentTagFilter));
        }
        
        // Count all tasks (including completed)
        const totalTasks = tasksToCount.length;
        const completedTasks = tasksToCount.filter(task => task.completed).length;
        const pendingTasks = tasksToCount.filter(task => !task.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event Handlers
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelTask').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on backdrop click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal();
            }
        });

        // Category modal controls
        document.getElementById('manageCategoriesBtn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        document.getElementById('closeCategoryModal').addEventListener('click', () => {
            this.closeCategoryModal();
        });

        // Close category modal on backdrop click
        document.getElementById('categoryModal').addEventListener('click', (e) => {
            if (e.target.id === 'categoryModal') {
                this.closeCategoryModal();
            }
        });

        // Category form submission
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            this.handleCategoryFormSubmit(e);
        });

        // Tag modal controls
        document.getElementById('manageTagsBtn').addEventListener('click', () => {
            this.openTagModal();
        });

        document.getElementById('closeTagModal').addEventListener('click', () => {
            this.closeTagModal();
        });

        // Close tag modal on backdrop click
        document.getElementById('tagModal').addEventListener('click', (e) => {
            if (e.target.id === 'tagModal') {
                this.closeTagModal();
            }
        });

        // Tag form submission
        document.getElementById('tagForm').addEventListener('submit', (e) => {
            this.handleTagFormSubmit(e);
        });

        // Settings page controls
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.closeSettings();
        });

        // User name - removed auto-save, now handled by main save button

        // Color synchronization
        ['primary', 'success', 'warning', 'danger'].forEach(colorType => {
            this.syncColorInputs(colorType);
        });

        // Color actions
        document.getElementById('resetColorsBtn').addEventListener('click', () => {
            this.resetCustomColors();
        });

        document.getElementById('applyColorsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Sort settings - removed applySortBtn, now handled by main save button

        // Main save button
        document.getElementById('saveAllSettingsBtn').addEventListener('click', () => {
            this.saveAllSettings();
        });

        // Reset all settings
        document.getElementById('resetAllSettingsBtn').addEventListener('click', () => {
            this.resetAllSettings();
        });

        // User Guide
        document.getElementById('guideBtn').addEventListener('click', () => {
            this.openGuide();
        });

        document.getElementById('closeGuideBtn').addEventListener('click', () => {
            this.closeGuide();
        });

        // Guide navigation
        document.querySelectorAll('.guide-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.guide-nav-link').dataset.section;
                this.showGuideSection(section);
            });
        });

        // Guide modal backdrop click
        document.getElementById('guideModal').addEventListener('click', (e) => {
            if (e.target.id === 'guideModal') {
                this.closeGuide();
            }
        });

        // Clear filters button
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Notifications
        document.getElementById('enableNotifications').addEventListener('change', (e) => {
            this.notificationsEnabled = e.target.checked;
            localStorage.setItem('notificationsEnabled', this.notificationsEnabled);
            
            const notificationSettings = document.getElementById('notificationSettings');
            notificationSettings.style.display = e.target.checked ? 'block' : 'none';
            
            // Reconfigure notifications
            this.setupNotifications();
        });

        document.getElementById('notificationTime').addEventListener('change', (e) => {
            this.notificationTime = parseInt(e.target.value);
            localStorage.setItem('notificationTime', this.notificationTime);
            
            // Reconfigure notifications
            this.setupNotifications();
        });

        document.getElementById('testNotificationBtn').addEventListener('click', () => {
            this.testNotification();
            this.debugNotificationLogic();
        });

        // Display settings
        document.getElementById('completedTasksDays').addEventListener('change', (e) => {
            this.completedTasksDays = parseInt(e.target.value);
            localStorage.setItem('completedTasksDays', this.completedTasksDays);
            this.renderTasks();
        });

        // Data management
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('selectImportFileBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('importFileName').textContent = `Arquivo selecionado: ${file.name}`;
                document.getElementById('importDataBtn').disabled = false;
            }
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            const file = document.getElementById('importFile').files[0];
            if (file) {
                this.importData(file);
            }
        });

        document.getElementById('clearAllDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', () => {
            this.renderTasks();
        });


        // Clear category and tag filters when search is used
        document.getElementById('searchInput').addEventListener('focus', () => {
            if (this.currentCategoryFilter || this.currentTagFilter) {
                this.currentCategoryFilter = null;
                this.currentTagFilter = null;
                this.renderCategories();
                this.renderTags();
                document.getElementById('taskSectionTitle').textContent = 'Todas as Tarefas';
                this.updateStats();
            }
        });

        // Recurring task options
        document.getElementById('isRecurring').addEventListener('change', (e) => {
            const recurrenceOptions = document.getElementById('recurrenceOptions');
            recurrenceOptions.style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('recurrenceType').addEventListener('change', (e) => {
            const weeklyOptions = document.getElementById('weeklyOptions');
            weeklyOptions.style.display = e.target.value === 'weekly' ? 'block' : 'none';
        });

        // Weekday checkbox management
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('weekday-checkbox')) {
                const label = e.target.closest('.weekday-label');
                if (e.target.checked) {
                    label.classList.add('checked');
                } else {
                    label.classList.remove('checked');
                }
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
                        document.getElementById('searchInput').focus();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeCategoryModal();
                this.closeSettings();
            }
        });
    }

    handleFormSubmit() {
        const isRecurring = document.getElementById('isRecurring').checked;
        const recurrenceType = document.getElementById('recurrenceType').value;
        
        // Get selected weekdays for weekly recurrence
        const weekdays = [];
        if (recurrenceType === 'weekly') {
            document.querySelectorAll('.weekday-checkbox:checked').forEach(checkbox => {
                weekdays.push(checkbox.value);
            });
        }

        // Get selected tags
        const selectedTags = [];
        document.querySelectorAll('.tag-checkbox:checked').forEach(checkbox => {
            selectedTags.push(checkbox.value);
        });

        // Validate maximum 3 tags
        if (selectedTags.length > 3) {
            alert('Você pode selecionar no máximo 3 tags por tarefa.');
            return;
        }

        const formData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            category: document.getElementById('taskCategory').value,
            tags: selectedTags,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDate').value,
            dueTime: document.getElementById('taskTime').value,
            isRecurring: isRecurring,
            recurrenceType: isRecurring ? recurrenceType : null,
            recurrenceData: isRecurring && weekdays.length > 0 ? { weekdays } : null
        };

        if (!formData.title) {
            alert('Por favor, insira um título para a tarefa.');
            return;
        }

        if (isRecurring && !formData.dueDate) {
            alert('Tarefas recorrentes precisam de uma data de vencimento.');
            return;
        }

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, formData);
        } else {
            this.addTask(formData);
        }

        this.closeModal();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        // Clear category and tag filters when using status filters
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Update section title
        this.updateSectionTitle();

        this.renderTasks();
        this.renderCategories(); // Re-render to update active states
        this.renderTags(); // Re-render to update active states
        this.updateStats(); // Update statistics
    }

    filterByCategory(categoryId) {
        // Toggle category filter - if same category clicked, clear filter
        if (this.currentCategoryFilter === categoryId) {
            this.currentCategoryFilter = null;
        } else {
            this.currentCategoryFilter = categoryId;
        }

        // Clear status filters when filtering by category
        this.currentFilter = 'all';
        // Keep tag filter active - allow combination
        
        // Update active filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="all"]').classList.add('active');

        // Update section title
        this.updateSectionTitle();

        this.renderTasks();
        this.renderCategories(); // Re-render to update active states
        this.renderTags(); // Re-render to update active states
        this.updateStats(); // Update statistics for filtered category
    }

    filterByTag(tagId) {
        // Toggle tag filter - if same tag clicked, clear filter
        if (this.currentTagFilter === tagId) {
            this.currentTagFilter = null;
        } else {
            this.currentTagFilter = tagId;
        }

        // Clear status filters when filtering by tag
        this.currentFilter = 'all';
        // Keep category filter active - allow combination
        
        // Update active filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="all"]').classList.add('active');

        // Update section title
        this.updateSectionTitle();

        this.renderTasks();
        this.renderTags(); // Re-render to update active states
        this.updateStats(); // Update statistics for filtered tag
    }

    updateSectionTitle() {
        let title = 'Todas as Tarefas';
        const filters = [];

        // Add status filter to title
        const statusTitles = {
            all: 'Todas as Tarefas',
            pending: 'Tarefas Pendentes',
            completed: 'Tarefas Concluídas',
            recurring: 'Tarefas Recorrentes',
            today: 'Tarefas de Hoje',
            upcoming: 'Tarefas em Breve',
            overdue: 'Tarefas Atrasadas',
            low: 'Tarefas de Baixa Prioridade',
            medium: 'Tarefas de Média Prioridade',
            high: 'Tarefas de Alta Prioridade'
        };

        // If using status filters, use the status title as base
        if (this.currentFilter !== 'all') {
            title = statusTitles[this.currentFilter] || 'Todas as Tarefas';
        }

        // Add category filter to title
        if (this.currentCategoryFilter) {
            const category = this.getCategoryById(this.currentCategoryFilter);
            if (category) {
                filters.push(category.name);
            }
        }

        // Add tag filter to title
        if (this.currentTagFilter) {
            const tag = this.getTagById(this.currentTagFilter);
            if (tag) {
                filters.push(tag.name);
            }
        }

        // Build combined title
        if (filters.length > 0) {
            if (this.currentFilter !== 'all') {
                title = `${title} - ${filters.join(' + ')}`;
            } else {
                title = `Tarefas - ${filters.join(' + ')}`;
            }
        }

        document.getElementById('taskSectionTitle').textContent = title;
        
        // Show/hide clear filters button
        const activeFiltersDiv = document.getElementById('activeFilters');
        if (this.currentCategoryFilter || this.currentTagFilter) {
            activeFiltersDiv.style.display = 'flex';
        } else {
            activeFiltersDiv.style.display = 'none';
        }
    }

    clearAllFilters() {
        // Clear all filters
        this.currentFilter = 'all';
        this.currentCategoryFilter = null;
        this.currentTagFilter = null;
        
        // Update active filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="all"]').classList.add('active');
        
        // Update section title
        this.updateSectionTitle();
        
        // Re-render everything
        this.renderTasks();
        this.renderCategories();
        this.renderTags();
        this.updateStats();
    }

    // Category Management Methods
    editCategory(categoryId) {
        this.editingCategoryId = categoryId;
        this.renderCategoryManagement();
        
        // Focus on the name input
        setTimeout(() => {
            const nameInput = document.getElementById(`editCategoryName_${categoryId}`);
            if (nameInput) {
                nameInput.focus();
                nameInput.select();
            }
        }, 100);
    }

    saveCategoryEdit(categoryId) {
        const nameInput = document.getElementById(`editCategoryName_${categoryId}`);
        const colorInput = document.getElementById(`editCategoryColor_${categoryId}`);
        
        if (!nameInput || !colorInput) return;
        
        const newName = nameInput.value.trim();
        const newColor = colorInput.value;
        
        if (!newName) {
            alert('Por favor, insira um nome para a categoria.');
            return;
        }
        
        // Check if name already exists (excluding current category)
        const existingCategory = this.categories.find(cat => 
            cat.name.toLowerCase() === newName.toLowerCase() && cat.id !== categoryId
        );
        
        if (existingCategory) {
            alert('Já existe uma categoria com este nome.');
            return;
        }
        
        this.updateCategory(categoryId, {
            name: newName,
            color: newColor
        });
        
        this.editingCategoryId = null;
        this.renderCategoryManagement();
    }

    cancelCategoryEdit() {
        this.editingCategoryId = null;
        this.renderCategoryManagement();
    }

    // Tag Management Methods
    editTag(tagId) {
        this.editingTagId = tagId;
        this.renderTagManagement();
        
        // Focus on the name input
        setTimeout(() => {
            const nameInput = document.getElementById(`editTagName_${tagId}`);
            if (nameInput) {
                nameInput.focus();
                nameInput.select();
            }
        }, 100);
    }

    saveTagEdit(tagId) {
        const nameInput = document.getElementById(`editTagName_${tagId}`);
        const colorInput = document.getElementById(`editTagColor_${tagId}`);
        
        if (!nameInput || !colorInput) return;
        
        const newName = nameInput.value.trim();
        const newColor = colorInput.value;
        
        if (!newName) {
            alert('Por favor, insira um nome para a tag.');
            return;
        }
        
        // Check if name already exists (excluding current tag)
        const existingTag = this.tags.find(tag => 
            tag.name.toLowerCase() === newName.toLowerCase() && tag.id !== tagId
        );
        
        if (existingTag) {
            alert('Já existe uma tag com este nome.');
            return;
        }
        
        this.updateTag(tagId, {
            name: newName,
            color: newColor
        });
        
        this.editingTagId = null;
        this.renderTagManagement();
    }

    cancelTagEdit() {
        this.editingTagId = null;
        this.renderTagManagement();
    }

    handleCategoryFormSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('categoryName').value.trim();
        const color = document.getElementById('categoryColor').value;
        
        if (!name) {
            alert('Por favor, insira um nome para a categoria.');
            return;
        }
        
        // Check if name already exists
        const existingCategory = this.categories.find(cat => 
            cat.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingCategory) {
            alert('Já existe uma categoria com este nome.');
            return;
        }
        
        this.addCategory({ name, color });
        
        // Reset form
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryColor').value = '#007bff';
    }

    handleTagFormSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('tagName').value.trim();
        const color = document.getElementById('tagColor').value;
        
        if (!name) {
            alert('Por favor, insira um nome para a tag.');
            return;
        }
        
        // Check if name already exists
        const existingTag = this.tags.find(tag => 
            tag.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingTag) {
            alert('Já existe uma tag com este nome.');
            return;
        }
        
        this.addTag({ name, color });
        
        // Reset form
        document.getElementById('tagForm').reset();
        document.getElementById('tagColor').value = '#dc3545';
    }

    // Public methods for HTML onclick handlers
    editTask(taskId) {
        this.openModal(taskId);
    }

    deleteTaskConfirm(taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.deleteTask(taskId);
        }
    }
}

// Initialize the application
const app = new TodoApp();

// Add some sample data if no tasks exist
if (app.tasks.length === 0) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 5);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 3);

    app.addTask({
        title: 'Bem-vindo ao To-Do Planner!',
        description: 'Esta é uma tarefa de exemplo. Você pode editá-la ou excluí-la.',
        category: 'personal',
        tags: ['important'],
        priority: 'medium',
        dueDate: tomorrow.toISOString().split('T')[0]
    });
    
    app.addTask({
        title: 'Configurar tema escuro',
        description: 'Experimente alternar entre tema claro e escuro usando o botão no canto superior direito.',
        category: 'personal',
        priority: 'low'
    });
    
    app.addTask({
        title: 'Reunião importante - Hoje',
        description: 'Reunião com a equipe para discutir o projeto. Use os filtros de data para ver tarefas de hoje!',
        category: 'work',
        tags: ['urgent', 'meeting'],
        priority: 'high',
        dueDate: today.toISOString().split('T')[0],
        dueTime: '14:00'
    });
    
    app.addTask({
        title: 'Criar categorias personalizadas',
        description: 'Experimente criar suas próprias categorias com cores personalizadas!',
        category: 'study',
        priority: 'medium'
    });

    app.addTask({
        title: 'Preparar apresentação',
        description: 'Tarefa para os próximos dias - use o filtro "Em Breve" para vê-la.',
        category: 'work',
        tags: ['project'],
        priority: 'medium',
        dueDate: nextWeek.toISOString().split('T')[0]
    });

    app.addTask({
        title: 'Tarefa atrasada',
        description: 'Esta tarefa está atrasada - use o filtro "Atrasadas" para vê-la.',
        category: 'personal',
        tags: ['urgent'],
        priority: 'high',
        dueDate: lastWeek.toISOString().split('T')[0]
    });
}
