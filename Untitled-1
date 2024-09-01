let dailyTodos = [];
let masterTodos = [];

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
    }
}

function renderTodos() {
    renderList('dailyTodoList', dailyTodos);
    renderList('masterTodoList', masterTodos);
}

function renderList(listId, todos) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo('${listId}', ${index})">
            <span>${index + 1}. ${todo.text}</span>
            <button onclick="moveTodo('${listId}', ${index}, 'up')">↑</button>
            <button onclick="moveTodo('${listId}', ${index}, 'down')">↓</button>
        `;
        list.appendChild(li);
    });
}

function toggleTodo(listId, index) {
    const list = listId === 'dailyTodoList' ? dailyTodos : masterTodos;
    list[index].completed = !list[index].completed;
    
    if (listId === 'masterTodoList' && list[index].completed) {
        const [todo] = list.splice(index, 1);
        todo.completed = false;
        dailyTodos.push(todo);
    } else if (listId === 'dailyTodoList' && list[index].completed) {
        list.splice(index, 1);
    }
    
    renderTodos();
}

function moveTodo(listId, index, direction) {
    const list = listId === 'dailyTodoList' ? dailyTodos : masterTodos;
    if (direction === 'up' && index > 0) {
        [list[index], list[index - 1]] = [list[index - 1], list[index]];
    } else if (direction === 'down' && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
    }
    renderTodos();
}

// Set current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString();

// Initial render
renderTodos();
