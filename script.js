let dailyTodos = [];
let masterTodos = [];
let completedTodos = [];

function addTodo(listType) {
    const input = document.getElementById(`${listType}TodoInput`);
    const todo = input.value.trim();
    if (todo) {
        if (listType === 'daily') {
            dailyTodos.push({ text: todo, completed: false });
        } else {
            masterTodos.push({ text: todo, completed: false });
        }
        input.value = '';
        renderTodos();
        adjustCompletedTasksPosition(); // Add this line
    }
}

function renderTodos() {
    renderList('dailyTodoList', dailyTodos);
    renderList('masterTodoList', masterTodos);
    adjustCompletedTasksPosition();
}

function renderList(listId, todos) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        if (listId === 'masterTodoList') {
            li.innerHTML = `
                <span>${todo.text}</span>
                <button onclick="toggleTodo('${listId}', ${index})">Move to Today</button>
                <button onclick="moveTodo('${listId}', ${index}, 'up')">▲</button>
                <button onclick="moveTodo('${listId}', ${index}, 'down')">▼</button>
            `;
        } else {
            li.innerHTML = `
                <input type="checkbox" onchange="toggleTodo('${listId}', ${index})">
                <span>${todo.text}</span>
                <button onclick="moveTodo('${listId}', ${index}, 'up')">▲</button>
                <button onclick="moveTodo('${listId}', ${index}, 'down')">▼</button>
            `;
        }
        list.appendChild(li);
    });
}

function toggleTodo(listId, index) {
    const list = listId === 'dailyTodoList' ? dailyTodos : masterTodos;
    const todo = list[index];
    
    if (listId === 'masterTodoList') {
        // Move task from master list to daily list
        list.splice(index, 1);
        dailyTodos.push(todo);
    } else if (listId === 'dailyTodoList') {
        // Move completed task from daily list to completed list
        list.splice(index, 1);
        completedTodos.push({...todo, completedDate: new Date()});
        renderCompletedTodos(); // Add this line
    }
    
    renderTodos();
    adjustCompletedTasksPosition(); // Add this line
}

function renderCompletedTodos() {
    const list = document.getElementById('completedTodoList');
    list.innerHTML = '';

    if (completedTodos.length === 0) {
        list.innerHTML = '<p>No completed tasks yet.</p>';
        return;
    }

    // Group tasks by week
    const tasksByWeek = {};
    completedTodos.forEach((todo) => {
        const weekNumber = getWeekNumber(todo.completedDate);
        const yearWeek = `${todo.completedDate.getFullYear()}-W${weekNumber}`;
        if (!tasksByWeek[yearWeek]) {
            tasksByWeek[yearWeek] = [];
        }
        tasksByWeek[yearWeek].push(todo);
    });

    // Render tasks grouped by week
    Object.keys(tasksByWeek).sort().reverse().forEach((yearWeek) => {
        const [year, week] = yearWeek.split('-W');
        const weekStart = new Date(year, 0, (week - 1) * 7 + 1);
        const weekEnd = new Date(year, 0, week * 7);

        const weekHeader = document.createElement('h3');
        weekHeader.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
        list.appendChild(weekHeader);

        const weekList = document.createElement('ul');
        tasksByWeek[yearWeek].forEach((todo) => {
            const li = document.createElement('li');
            li.textContent = `${todo.text} (${formatDate(todo.completedDate)})`;
            weekList.appendChild(li);
        });
        list.appendChild(weekList);
    });
}

// Helper function to format date as "MMM D"
function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function moveTodo(listId, index, direction) {
    const list = listId === 'dailyTodoList' ? dailyTodos : masterTodos;
    if (direction === 'up' && index > 0) {
        [list[index], list[index - 1]] = [list[index - 1], list[index]];
    } else if (direction === 'down' && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
    }
    renderTodos();
    adjustCompletedTasksPosition(); // Add this line
}

function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDate = new Date().toLocaleDateString(undefined, options);
    document.getElementById('currentDate').textContent = currentDate;
}

function toggleCompletedTasksVisibility() {
    const container = document.getElementById('completedTasksContainer');
    const button = document.getElementById('toggleCompletedTasks');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        button.textContent = 'Hide Completed Tasks';
        renderCompletedTodos();
        adjustCompletedTasksPosition();
    } else {
        container.style.display = 'none';
        button.textContent = 'Show Completed Tasks';
    }
    adjustCompletedTasksPosition();
}

document.getElementById('toggleCompletedTasks').addEventListener('click', toggleCompletedTasksVisibility);

function initialRender() {
    setCurrentDate();
    renderTodos();
    renderCompletedTodos();
    adjustCompletedTasksPosition(); // Add this line
}

initialRender();

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function adjustCompletedTasksPosition() {
    const container = document.querySelector('.container');
    const completedTasksContainer = document.getElementById('completedTasksContainer');
    const toggleButton = document.getElementById('toggleCompletedTasks');
    
    const containerRect = container.getBoundingClientRect();
    const containerBottom = containerRect.bottom + window.pageYOffset;
    
    // Position the button first
    toggleButton.style.top = `${containerBottom + 20}px`;
    
    // Then position the completed tasks container below the button
    const toggleButtonRect = toggleButton.getBoundingClientRect();
    const toggleButtonBottom = toggleButtonRect.bottom + window.pageYOffset;
    
    completedTasksContainer.style.top = `${toggleButtonBottom + 20}px`;
}

window.addEventListener('resize', adjustCompletedTasksPosition);

// Call this at the end of functions that modify the lists
renderTodos();
adjustCompletedTasksPosition();

document.getElementById('logoutButton').addEventListener('click', function() {
    // Here you would typically clear any user session data
    // For now, we'll just redirect to the login page
    window.location.href = 'login.html';
});
