// To-Do List & Planner Application - Modularized Version

// Initialize the application
const app = new TodoApp();

// Add sample data if no tasks exist (aguardar um pouco para inicialização completa)
setTimeout(() => {
    if (app.taskController.getAllTasks().length === 0) {
        app.addSampleData();
    }
}, 100);