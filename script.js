let dailyTodos = [];
let masterTodos = [];
let completedTodos = [];

function saveTasks() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        localStorage.setItem(`${currentUser}_dailyTodos`, JSON.stringify(dailyTodos));
        localStorage.setItem(`${currentUser}_masterTodos`, JSON.stringify(masterTodos));
        localStorage.setItem(`${currentUser}_completedTodos`, JSON.stringify(completedTodos));
    }
}

function loadTasks() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        dailyTodos = JSON.parse(localStorage.getItem(`${currentUser}_dailyTodos`)) || [];
        masterTodos = JSON.parse(localStorage.getItem(`${currentUser}_masterTodos`)) || [];
        completedTodos = JSON.parse(localStorage.getItem(`${currentUser}_completedTodos`)) || [];
    }
}

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
        adjustCompletedTasksPosition();
        saveTasks();
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
                <div class="todo-content">
                    <span class="todo-text" contenteditable="true" onblur="updateTodo('${listId}', ${index}, this.textContent)">${todo.text}</span>
                </div>
                <div class="todo-actions">
                    <button onclick="toggleTodo('${listId}', ${index})">Move to Today</button>
                    <button onclick="addToWill('${listId}', ${index})" class="will-btn">W</button>
                    <button onclick="moveTodo('${listId}', ${index}, 'up')">▲</button>
                    <button onclick="moveTodo('${listId}', ${index}, 'down')">▼</button>
                </div>
            `;
        } else {
            li.innerHTML = `
                <input type="checkbox" onchange="toggleTodo('${listId}', ${index})" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <span class="todo-text" contenteditable="true" onblur="updateTodo('${listId}', ${index}, this.textContent)">${todo.text}</span>
                </div>
                <div class="todo-actions">
                    <button onclick="addToWill('${listId}', ${index})" class="will-btn">W</button>
                    <button onclick="moveTodo('${listId}', ${index}, 'up')">▲</button>
                    <button onclick="moveTodo('${listId}', ${index}, 'down')">▼</button>
                </div>
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
        renderCompletedTodos();
    }
    
    renderTodos();
    adjustCompletedTasksPosition();
    saveTasks();
}

function moveTodo(listId, index, direction) {
    const list = listId === 'dailyTodoList' ? dailyTodos : masterTodos;
    if (direction === 'up' && index > 0) {
        [list[index], list[index - 1]] = [list[index - 1], list[index]];
    } else if (direction === 'down' && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
    }
    renderTodos();
    adjustCompletedTasksPosition();
    saveTasks();
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
    loadTasks();
    setCurrentDate();
    renderTodos();
    renderCompletedTodos();
    adjustCompletedTasksPosition();
}

initialRender();

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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
    completedTodos.forEach((todo, index) => {
        const completedDate = new Date(todo.completedDate);
        const weekNumber = getWeekNumber(completedDate);
        const yearWeek = `${completedDate.getFullYear()}-W${weekNumber}`;
        if (!tasksByWeek[yearWeek]) {
            tasksByWeek[yearWeek] = [];
        }
        tasksByWeek[yearWeek].push({...todo, index});
    });

    // Render tasks grouped by week
    Object.keys(tasksByWeek).sort().reverse().forEach((yearWeek) => {
        const [year, week] = yearWeek.split('-W');
        const firstDayOfYear = new Date(parseInt(year), 0, 1);
        const weekStart = new Date(firstDayOfYear.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Adjust to Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

        const weekHeader = document.createElement('h3');
        weekHeader.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
        list.appendChild(weekHeader);

        const weekList = document.createElement('ul');
        tasksByWeek[yearWeek].forEach((todo) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${todo.text} (${formatDate(new Date(todo.completedDate))})
                <button onclick="deleteCompletedTodo(${todo.index})" class="delete-btn">✕</button>
            `;
            weekList.appendChild(li);
        });
        list.appendChild(weekList);
    });
}

function deleteCompletedTodo(index) {
    completedTodos.splice(index, 1);
    renderCompletedTodos();
    saveTasks();
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function adjustCompletedTasksPosition() {
    const container = document.querySelector('.container');
    const completedTasksContainer = document.getElementById('completedTasksContainer');
    const toggleButton = document.getElementById('toggleCompletedTasks');
    
    const containerRect = container.getBoundingClientRect();
    const containerBottom = containerRect.bottom + window.pageYOffset;
    
    toggleButton.style.top = `${containerBottom + 20}px`;
    
    const toggleButtonRect = toggleButton.getBoundingClientRect();
    const toggleButtonBottom = toggleButtonRect.bottom + window.pageYOffset;
    
    completedTasksContainer.style.top = `${toggleButtonBottom + 20}px`;
}

window.addEventListener('resize', adjustCompletedTasksPosition);

renderTodos();
adjustCompletedTasksPosition();

document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'https://fletcherm27.github.io/TO---DO-LIST/';
});

function updateTodo(listId, index, newText) {
    const list = listId === 'dailyTodoList' ? dailyTodos : masterTodos;
    if (newText.trim() !== "") {
        list[index].text = newText.trim();
        saveTasks();
    } else {
        renderTodos(); // Revert changes if the new text is empty
    }
}

document.getElementById('theWillButton').addEventListener('click', function() {
    window.location.href = 'https://fletcherm27.github.io/TO---DO-LIST/the-will.html';
});

function addToWill(listId, index) {
    const list = listId === 'dailyTodoList' ? dailyTodos : masterTodos;
    const task = list[index];
    let willPromises = JSON.parse(localStorage.getItem('promises')) || [];
    willPromises.push({ text: task.text, completed: false, status: 'pending' });
    localStorage.setItem('promises', JSON.stringify(willPromises));
    alert('Task added to Promises Made in The Will');
}

document.getElementById('plannerButton').addEventListener('click', function() {
    window.location.href = 'https://fletcherm27.github.io/TO---DO-LIST/planner.html';
});

<button id="plannerButton">Planner</button>
<button id="theWillButton">The Will</button>
