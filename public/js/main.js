/**
 * GitHub Repository: https://github.com/razansa01/EX3SB.git
 * Authors: Razan Saad 322391103, Mayar Ganem 213380694
 * Date: 15/08/2025
 * Description: Main window tasks script (no inline JS).
 *              Loads user tasks, supports drag & drop between lists,
 *              persists changes to the server, and handles logout.
 */

/* Main window tasks script (no inline JS) */

document.addEventListener('DOMContentLoaded', () => {
  // Initial tasks load
  loadTasks();

  // Attach DnD listeners (instead of inline ondrop/ondragover)
  ['openTasks', 'completedTasks'].forEach(listId => {
    const list = document.getElementById(listId);
    list.addEventListener('dragover', allowDrop);
    list.addEventListener('drop', drop);
  });

  // Attach button listeners (instead of onclick in HTML)
  document.getElementById('removeCompletedBtn').addEventListener('click', removeCompletedTasks);
  document.getElementById('addTaskBtn').addEventListener('click', addTask);
  document.getElementById('logoutBtn').addEventListener('click', logout);
});

// Fetch tasks for the logged-in user
function loadTasks() {
  fetch('/tasks')
    .then(response => {
      if (!response.ok) {
        // 403 -> redirect to login page
        window.location.href = '/';
        throw new Error('Unauthorized');
      }
      return response.json();
    })
    .then(data => {
      const openTasksList = document.getElementById('openTasks');
      const completedTasksList = document.getElementById('completedTasks');

      openTasksList.innerHTML = '';
      completedTasksList.innerHTML = '';

      (data.openTasks || []).forEach(task => {
        openTasksList.appendChild(createTaskElement(task, 'openTasks'));
      });

      (data.completedTasks || []).forEach(task => {
        completedTasksList.appendChild(createTaskElement(task, 'completedTasks'));
      });
    })
    .catch(() => { /* already redirected if unauthorized */ });
}

// Make a safe HTML id from arbitrary text
function safeId(str) {
  return String(str).replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Create a draggable <li> for a task
function createTaskElement(task, listId) {
  const li = document.createElement('li');
  li.textContent = task;
  li.setAttribute('draggable', 'true');
  li.dataset.listId = listId;
  li.id = `${listId}-${safeId(task)}`;
  // Use JS event listener instead of inline ondragstart
  li.addEventListener('dragstart', drag);
  return li;
}

// Add a new task to "Open Tasks"
function addTask() {
  const input = document.getElementById('newTask');
  const newTask = (input.value || '').trim();
  if (!newTask) return;

  const openTasksList = document.getElementById('openTasks');
  openTasksList.appendChild(createTaskElement(newTask, 'openTasks'));
  saveTasks();
  input.value = '';
}

// Persist current lists to the server
function saveTasks() {
  const openTasks = [];
  document.querySelectorAll('#openTasks li').forEach(li => openTasks.push(li.textContent));

  const completedTasks = [];
  document.querySelectorAll('#completedTasks li').forEach(li => completedTasks.push(li.textContent));

  fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ openTasks, completedTasks })
  }).catch(() => {});
}

// Remove all completed tasks
function removeCompletedTasks() {
  const completedTasksList = document.getElementById('completedTasks');
  completedTasksList.innerHTML = '';
  saveTasks();
}

/* ---- Drag & Drop helpers ---- */
function allowDrop(event) { event.preventDefault(); }

function drag(event) {
  event.dataTransfer.setData('text/plain', event.target.id);
}

function drop(event) {
  event.preventDefault();
  const id = event.dataTransfer.getData('text/plain');
  const dragged = document.getElementById(id);
  const targetList = event.target.closest('ul');
  if (targetList && dragged) {
    targetList.appendChild(dragged);
    dragged.dataset.listId = targetList.id;
    saveTasks();
  }
}

/* ---- Logout (works with httpOnly cookie) ---- */
function logout() {
  // Server clears cookie; we redirect regardless
  fetch('/logout', { method: 'POST' })
    .finally(() => { window.location.href = '/'; });
}
