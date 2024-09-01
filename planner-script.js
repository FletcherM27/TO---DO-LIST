let weeklyGoals = [];
let monthlyGoals = [];
let quarterlyGoals = [];
let completedGoals = [];

function addGoal(type) {
    const input = document.getElementById(`${type}GoalInput`);
    const goal = input.value.trim();
    if (goal) {
        const goalList = getGoalList(type);
        goalList.push({ text: goal, completed: false });
        input.value = '';
        renderGoals(type);
        saveGoals();
    }
}

function getGoalList(type) {
    switch (type) {
        case 'weekly':
            return weeklyGoals;
        case 'monthly':
            return monthlyGoals;
        case 'quarterly':
            return quarterlyGoals;
    }
}

function renderGoals(type) {
    const list = document.getElementById(`${type}GoalList`);
    const goals = getGoalList(type);
    list.innerHTML = '';
    goals.forEach((goal, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" onchange="toggleGoal('${type}', ${index})" ${goal.completed ? 'checked' : ''}>
            <span class="goal-text" contenteditable="true" onblur="updateGoal('${type}', ${index}, this.textContent)">${goal.text}</span>
            <button onclick="moveGoal('${type}', ${index}, 'up')">▲</button>
            <button onclick="moveGoal('${type}', ${index}, 'down')">▼</button>
            <button onclick="deleteGoal('${type}', ${index})">✕</button>
        `;
        list.appendChild(li);
    });
}

function toggleGoal(type, index) {
    const goals = getGoalList(type);
    const goal = goals[index];
    goals.splice(index, 1);
    completedGoals.push({...goal, completedDate: new Date(), type: type});
    renderGoals(type);
    renderCompletedGoals();
    saveGoals();
}

function updateGoal(type, index, newText) {
    const goals = getGoalList(type);
    if (newText.trim() !== "") {
        goals[index].text = newText.trim();
        saveGoals();
    } else {
        renderGoals(type);
    }
}

function moveGoal(type, index, direction) {
    const goals = getGoalList(type);
    if (direction === 'up' && index > 0) {
        [goals[index], goals[index - 1]] = [goals[index - 1], goals[index]];
    } else if (direction === 'down' && index < goals.length - 1) {
        [goals[index], goals[index + 1]] = [goals[index + 1], goals[index]];
    }
    renderGoals(type);
    saveGoals();
}

function deleteGoal(type, index) {
    const goals = getGoalList(type);
    goals.splice(index, 1);
    renderGoals(type);
    saveGoals();
}

function renderCompletedGoals() {
    const list = document.getElementById('completedGoalList');
    list.innerHTML = '';

    if (completedGoals.length === 0) {
        list.innerHTML = '<p>No completed goals yet.</p>';
        return;
    }

    // Group goals by type and period
    const goalsByType = {weekly: {}, monthly: {}, quarterly: {}};
    completedGoals.forEach((goal, index) => {
        const date = new Date(goal.completedDate);
        const periodKey = getPeriodKey(goal.type, date);
        if (!goalsByType[goal.type][periodKey]) {
            goalsByType[goal.type][periodKey] = [];
        }
        goalsByType[goal.type][periodKey].push({...goal, index});
    });

    // Render goals grouped by type and period
    ['weekly', 'monthly', 'quarterly'].forEach((type) => {
        const typeHeader = document.createElement('h3');
        typeHeader.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Goals`;
        list.appendChild(typeHeader);

        Object.keys(goalsByType[type]).sort().reverse().forEach((periodKey) => {
            const periodLabel = getPeriodLabel(type, periodKey);
            const periodHeader = document.createElement('h4');
            periodHeader.textContent = periodLabel;
            list.appendChild(periodHeader);

            const periodList = document.createElement('ul');
            goalsByType[type][periodKey].forEach((goal) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${goal.text} (Completed: ${formatDate(new Date(goal.completedDate))})
                    <button onclick="deleteCompletedGoal(${goal.index})" class="delete-btn">✕</button>
                `;
                periodList.appendChild(li);
            });
            list.appendChild(periodList);
        });
    });
}

function getPeriodKey(type, date) {
    switch (type) {
        case 'weekly':
            return `${date.getFullYear()}-W${getWeekNumber(date)}`;
        case 'monthly':
            return `${date.getFullYear()}-${date.getMonth() + 1}`;
        case 'quarterly':
            const month = date.getMonth();
            let quarter;
            if (month >= 8) quarter = 1;
            else if (month >= 5) quarter = 4;
            else if (month >= 2) quarter = 3;
            else quarter = 2;
            return `${date.getFullYear()}-Q${quarter}`;
    }
}

function getPeriodLabel(type, periodKey) {
    switch (type) {
        case 'weekly':
            return getWeekLabel(periodKey);
        case 'monthly':
            return getMonthLabel(periodKey);
        case 'quarterly':
            return getQuarterLabel(periodKey);
    }
}

function getWeekLabel(weekKey) {
    const [year, week] = weekKey.split('-W');
    const firstDay = getFirstDayOfWeek(parseInt(year), parseInt(week));
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
}

function getMonthLabel(monthKey) {
    const [year, month] = monthKey.split('-');
    return new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getQuarterLabel(quarterKey) {
    const [year, quarter] = quarterKey.split('-Q');
    let startDate, endDate;
    
    switch (quarter) {
        case '1': // Sep 1 - Nov 30
            startDate = new Date(parseInt(year) - 1, 8, 1);
            endDate = new Date(parseInt(year) - 1, 11, 30);
            break;
        case '2': // Dec 1 - Feb 28/29
            startDate = new Date(parseInt(year) - 1, 11, 1);
            endDate = new Date(parseInt(year), 1, 29);
            endDate.setDate(endDate.getMonth() === 1 ? (endDate.getFullYear() % 4 === 0 ? 29 : 28) : 30);
            break;
        case '3': // Mar 1 - May 31
            startDate = new Date(year, 2, 1);
            endDate = new Date(year, 4, 31);
            break;
        case '4': // Jun 1 - Aug 31
            startDate = new Date(year, 5, 1);
            endDate = new Date(year, 7, 31);
            break;
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getFirstDayOfWeek(year, week) {
    // January 4th is always in week 1 (ISO 8601)
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const firstMonday = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
    firstMonday.setDate(firstMonday.getDate() + (week - 1) * 7);
    return firstMonday;
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

function deleteCompletedGoal(index) {
    completedGoals.splice(index, 1);
    renderCompletedGoals();
    saveGoals();
}

function toggleCompletedGoalsVisibility() {
    const container = document.getElementById('completedGoalsContainer');
    const button = document.getElementById('toggleCompletedGoals');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        button.textContent = 'Hide Completed Goals';
        renderCompletedGoals();
    } else {
        container.style.display = 'none';
        button.textContent = 'Show Completed Goals';
    }
}

function saveGoals() {
    localStorage.setItem('weeklyGoals', JSON.stringify(weeklyGoals));
    localStorage.setItem('monthlyGoals', JSON.stringify(monthlyGoals));
    localStorage.setItem('quarterlyGoals', JSON.stringify(quarterlyGoals));
    localStorage.setItem('completedGoals', JSON.stringify(completedGoals));
}

function loadGoals() {
    weeklyGoals = JSON.parse(localStorage.getItem('weeklyGoals')) || [];
    monthlyGoals = JSON.parse(localStorage.getItem('monthlyGoals')) || [];
    quarterlyGoals = JSON.parse(localStorage.getItem('quarterlyGoals')) || [];
    completedGoals = JSON.parse(localStorage.getItem('completedGoals')) || [];
}

function initialRender() {
    loadGoals();
    renderGoals('weekly');
    renderGoals('monthly');
    renderGoals('quarterly');
    renderCompletedGoals();
}

document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'quest.html';
});

document.getElementById('toggleCompletedGoals').addEventListener('click', toggleCompletedGoalsVisibility);

initialRender();