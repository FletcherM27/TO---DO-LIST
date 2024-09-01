let promises = [];
let record = [];

function addPromise() {
    const input = document.getElementById('promiseInput');
    const promise = input.value.trim();
    if (promise) {
        promises.push({ text: promise, completed: false, status: 'pending' });
        input.value = '';
        renderPromises();
        savePromises();
    }
}

function renderPromises() {
    const list = document.getElementById('promiseList');
    list.innerHTML = '';
    promises.forEach((promise, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="promise-content">
                <span class="promise-text" contenteditable="true" onblur="updatePromise(${index}, this.textContent)">${promise.text}</span>
            </div>
            <div class="promise-actions">
                <button onclick="promiseKept(${index})" class="promise-kept">Promise Kept</button>
                <button onclick="promiseFailed(${index})" class="promise-failed">Failure</button>
                <button onclick="movePromise(${index}, 'up')">▲</button>
                <button onclick="movePromise(${index}, 'down')">▼</button>
                <button onclick="deletePromise(${index})">✕</button>
            </div>
        `;
        li.classList.add(promise.status);
        list.appendChild(li);
    });
}

function updatePromise(index, newText) {
    if (newText.trim() !== "") {
        promises[index].text = newText.trim();
        savePromises();
    } else {
        renderPromises(); // Revert changes if the new text is empty
    }
}

function movePromise(index, direction) {
    if (direction === 'up' && index > 0) {
        [promises[index], promises[index - 1]] = [promises[index - 1], promises[index]];
    } else if (direction === 'down' && index < promises.length - 1) {
        [promises[index], promises[index + 1]] = [promises[index + 1], promises[index]];
    }
    renderPromises();
    savePromises();
}

function promiseKept(index) {
    const promise = promises[index];
    promise.status = 'kept';
    record.push({ ...promise, completedDate: new Date() });
    promises.splice(index, 1);
    renderPromises();
    renderRecord();
    savePromises();
    saveRecord();
}

function promiseFailed(index) {
    const promise = promises[index];
    promise.status = 'failed';
    record.push({ ...promise, completedDate: new Date() });
    promises.splice(index, 1);
    renderPromises();
    renderRecord();
    savePromises();
    saveRecord();
}

function deletePromise(index) {
    promises.splice(index, 1);
    renderPromises();
    savePromises();
}

function savePromises() {
    localStorage.setItem('promises', JSON.stringify(promises));
}

function loadPromises() {
    const savedPromises = localStorage.getItem('promises');
    promises = savedPromises ? JSON.parse(savedPromises) : [];
    renderPromises();
}

function saveRecord() {
    localStorage.setItem('record', JSON.stringify(record));
}

function loadRecord() {
    const savedRecord = localStorage.getItem('record');
    record = savedRecord ? JSON.parse(savedRecord) : [];
}

function renderRecord() {
    const list = document.getElementById('recordList');
    list.innerHTML = '';

    if (record.length === 0) {
        list.innerHTML = '<p>No records yet.</p>';
        return;
    }

    // Group records by week
    const recordsByWeek = {};
    record.forEach((item, index) => {
        const completedDate = new Date(item.completedDate);
        const weekNumber = getWeekNumber(completedDate);
        const yearWeek = `${completedDate.getFullYear()}-W${weekNumber}`;
        if (!recordsByWeek[yearWeek]) {
            recordsByWeek[yearWeek] = { kept: [], failed: [] };
        }
        recordsByWeek[yearWeek][item.status].push({...item, index});
    });

    // Render records grouped by week
    Object.keys(recordsByWeek).sort().reverse().forEach((yearWeek) => {
        const [year, week] = yearWeek.split('-W');
        const weekStart = getDateOfISOWeek(week, year);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekHeader = document.createElement('h3');
        weekHeader.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
        list.appendChild(weekHeader);

        const weekDiv = document.createElement('div');
        weekDiv.className = 'week-record';

        // Promises Kept
        if (recordsByWeek[yearWeek].kept.length > 0) {
            const keptHeader = document.createElement('h4');
            keptHeader.textContent = 'Promises Kept';
            weekDiv.appendChild(keptHeader);
            const keptList = document.createElement('ul');
            recordsByWeek[yearWeek].kept.forEach((item) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="record-content">
                        <span class="record-text">${item.text} (${formatDate(new Date(item.completedDate))})</span>
                    </div>
                    <div class="record-actions">
                        <button onclick="deleteRecordItem(${item.index})" class="delete-btn">✕</button>
                    </div>
                `;
                keptList.appendChild(li);
            });
            weekDiv.appendChild(keptList);
        }

        // Failures
        if (recordsByWeek[yearWeek].failed.length > 0) {
            const failedHeader = document.createElement('h4');
            failedHeader.textContent = 'Failures';
            weekDiv.appendChild(failedHeader);
            const failedList = document.createElement('ul');
            recordsByWeek[yearWeek].failed.forEach((item) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="record-content">
                        <span class="record-text">${item.text} (${formatDate(new Date(item.completedDate))})</span>
                    </div>
                    <div class="record-actions">
                        <button onclick="deleteRecordItem(${item.index})" class="delete-btn">✕</button>
                    </div>
                `;
                failedList.appendChild(li);
            });
            weekDiv.appendChild(failedList);
        }

        list.appendChild(weekDiv);
    });
}

function deleteRecordItem(index) {
    record.splice(index, 1);
    renderRecord();
    saveRecord();
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getDateOfISOWeek(w, y) {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function toggleRecordVisibility() {
    const container = document.getElementById('recordContainer');
    const button = document.getElementById('toggleRecord');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        button.textContent = 'Hide Record';
        renderRecord();
    } else {
        container.style.display = 'none';
        button.textContent = 'Show Record';
    }
}

function initialRender() {
    loadPromises();
    loadRecord();
    renderPromises();
    renderRecord();
}

document.getElementById('backButton').addEventListener('click', function() {
    window.location.href = 'https://fletcherm27.github.io/TO---DO-LIST/quest.html';
});

document.getElementById('toggleRecord').addEventListener('click', toggleRecordVisibility);

initialRender();
