/**
 * DateUtils - Utilitários para manipulação de datas
 * Responsável por operações relacionadas a datas e horários
 * 
 * Funcionalidades:
 * - Criação de datas locais
 * - Verificação de vencimento de tarefas
 * - Cálculos de recorrência
 * - Formatação de datas
 */
class DateUtils {
    /**
     * Cria uma data local sem problemas de fuso horário
     * @param {string} dateString - String da data no formato YYYY-MM-DD
     * @returns {Date} Data local
     */
    static createLocalDate(dateString) {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    /**
     * Verifica se uma tarefa vence hoje
     * @param {Object} task - Objeto da tarefa
     * @returns {boolean}
     */
    static isTaskDueToday(task) {
        if (!task.dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = this.createLocalDate(task.dueDate);
        
        return today.toDateString() === taskDate.toDateString();
    }

    /**
     * Verifica se uma tarefa está vencida
     * @param {Object} task - Objeto da tarefa
     * @returns {boolean}
     */
    static isTaskOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = this.createLocalDate(task.dueDate);
        
        return taskDate < today;
    }

    /**
     * Verifica se uma tarefa está próxima (próximos 7 dias)
     * @param {Object} task - Objeto da tarefa
     * @returns {boolean}
     */
    static isTaskUpcoming(task) {
        if (!task.dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = this.createLocalDate(task.dueDate);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        return taskDate > today && taskDate <= nextWeek;
    }

    /**
     * Adiciona dias a uma data
     * @param {Date} date - Data base
     * @param {number} days - Número de dias para adicionar
     * @returns {Date} Nova data
     */
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Adiciona meses a uma data
     * @param {Date} date - Data base
     * @param {number} months - Número de meses para adicionar
     * @returns {Date} Nova data
     */
    static addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    /**
     * Adiciona anos a uma data
     * @param {Date} date - Data base
     * @param {number} years - Número de anos para adicionar
     * @returns {Date} Nova data
     */
    static addYears(date, years) {
        const result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }

    /**
     * Calcula a próxima data de recorrência
     * @param {Object} task - Tarefa com configuração de recorrência
     * @returns {Date|null} Próxima data de recorrência ou null
     */
    static calculateNextRecurrenceDate(task) {
        if (!task.dueDate || !task.recurrenceType) return null;
        
        const currentDate = this.createLocalDate(task.dueDate);
        
        // Para recorrências, sempre usar a data original da tarefa como base
        // A próxima recorrência deve seguir o padrão original, não a data atual
        const baseDate = currentDate;
        
        switch (task.recurrenceType) {
            case 'daily':
                return this.addDays(baseDate, 1);
            
            case 'weekly':
                const weekdays = task.recurrenceData?.weekdays || [];
                if (weekdays.length === 0) return this.addDays(baseDate, 7);
                
                // Find next weekday from the selected list
                const currentWeekday = baseDate.getDay();
                const selectedWeekdays = weekdays.map(Number).sort((a, b) => a - b);
                
                // Look for next weekday in the same week
                for (const weekday of selectedWeekdays) {
                    if (weekday > currentWeekday) {
                        const daysToAdd = weekday - currentWeekday;
                        return this.addDays(baseDate, daysToAdd);
                    }
                }
                
                // If no weekday found in current week, find first weekday of next week
                const firstWeekday = selectedWeekdays[0];
                const daysToNextWeek = 7 - currentWeekday + firstWeekday;
                return this.addDays(baseDate, daysToNextWeek);
            
            case 'monthly':
                return this.addMonths(baseDate, 1);
            
            case 'yearly':
                return this.addYears(baseDate, 1);
            
            default:
                return null;
        }
    }

    /**
     * Formata uma data para exibição em português brasileiro
     * @param {Date} date - Data para formatar
     * @returns {string} Data formatada
     */
    static formatDateBR(date) {
        if (!date) return '';
        return date.toLocaleDateString('pt-BR');
    }

    /**
     * Formata uma data para o formato YYYY-MM-DD
     * @param {Date} date - Data para formatar
     * @returns {string} Data no formato YYYY-MM-DD
     */
    static formatDateISO(date) {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Obtém a saudação baseada na hora atual
     * @returns {string} Saudação (Bom dia, Boa tarde, Boa noite)
     */
    static getTimeGreeting() {
        const now = new Date();
        const hour = now.getHours();
        
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    }

    /**
     * Verifica se duas datas são do mesmo dia
     * @param {Date} date1 - Primeira data
     * @param {Date} date2 - Segunda data
     * @returns {boolean}
     */
    static isSameDay(date1, date2) {
        if (!date1 || !date2) return false;
        return date1.toDateString() === date2.toDateString();
    }

    /**
     * Obtém o número de dias entre duas datas
     * @param {Date} startDate - Data inicial
     * @param {Date} endDate - Data final
     * @returns {number} Número de dias
     */
    static getDaysBetween(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    /**
     * Verifica se uma data está dentro de um período
     * @param {Date} date - Data para verificar
     * @param {Date} startDate - Data inicial do período
     * @param {Date} endDate - Data final do período
     * @returns {boolean}
     */
    static isDateInRange(date, startDate, endDate) {
        if (!date || !startDate || !endDate) return false;
        return date >= startDate && date <= endDate;
    }

    /**
     * Obtém o início do dia (00:00:00)
     * @param {Date} date - Data base
     * @returns {Date} Data com horário zerado
     */
    static getStartOfDay(date) {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    /**
     * Obtém o fim do dia (23:59:59)
     * @param {Date} date - Data base
     * @returns {Date} Data com horário no final do dia
     */
    static getEndOfDay(date) {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    }
}

// Exportar para uso em módulos ES6 ou como global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DateUtils;
} else {
    window.DateUtils = DateUtils;
}
