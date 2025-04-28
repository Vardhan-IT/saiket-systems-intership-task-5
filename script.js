// DOM Elements
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const errorMessage = document.getElementById('error-message');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editInput = document.getElementById('edit-input');
const saveEditBtn = document.getElementById('save-edit');
const closeModalBtn = document.querySelector('.close');

// App State
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// Load tasks from local storage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Generate unique ID for tasks
function generateId() {
    return Date.now().toString();
}

// Add new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        errorMessage.style.display = 'block';
        return;
    }
    
    errorMessage.style.display = 'none';
    
    const newTask = {
        id: generateId(),
        text: taskText,
        completed: false,
        createdAt: new Date()
    };
    
    tasks.unshift(newTask); // Add to beginning of array
    taskInput.value = '';
    
    saveTasks();
    renderTasks();
}

// Delete task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

// Toggle task completion status
function toggleTaskStatus(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

// Edit task
function openEditModal(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        editingTaskId = taskId;
        editInput.value = task.text;
        editModal.style.display = 'flex';
        editInput.focus();
    }
}

function saveEdit() {
    const newText = editInput.value.trim();
    
    if (newText === '') {
        return;
    }
    
    tasks = tasks.map(task => {
        if (task.id === editingTaskId) {
            return { ...task, text: newText };
        }
        return task;
    });
    
    closeModal();
    saveTasks();
    renderTasks();
}

function closeModal() {
    editModal.style.display = 'none';
    editingTaskId = null;
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTasks();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Render tasks based on current filter
function renderTasks() {
    // Clear the task list
    taskList.innerHTML = '';
    
    // Filter tasks based on current filter
    let filteredTasks = [];
    
    if (currentFilter === 'all') {
        filteredTasks = tasks;
    } else if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Create task elements
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', () => openEditModal(task.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(taskActions);
        
        taskList.appendChild(taskItem);
    });
    
    // Update tasks counter
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

// Event Listeners
addButton.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

taskInput.addEventListener('input', () => {
    errorMessage.style.display = 'none';
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterTasks(btn.dataset.filter);
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);
saveEditBtn.addEventListener('click', saveEdit);
closeModalBtn.addEventListener('click', closeModal);

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal();
    }
});

// Edit input enter key support
editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveEdit();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});