const listContainer = document.querySelector('.tasks'); // ul
const newTodoForm = document.querySelector('.addTodo'); // form
const newTodoInput = document.querySelector('.addNew'); // input
const listCountElement = document.querySelector('.counter'); //counter
const taskTemplate = document.querySelector('#task-template'); // html template
const alert = document.querySelector('.alert'); // alert
const clearCompletedTaskBtn = document.querySelector('.clear'); // clear completed
const API = 'http://localhost:3002';
const API_ENDPOINT_GET = 'http://localhost:3001';

// filtering
const filterOptions = document.querySelector('.filter-todos');
const allTaskBtn = document.querySelector('.all');
const showActiveTodos = document.querySelector('.activeBtn');
const showCompletedTodos = document.querySelector('.completed');

new Sortable(listContainer, {
  animation: 150,
  ghostClass: 'blue-background-class',
});

const LOCAL_STORAGE_LIST = 'task.todos';



const createTask = name => {
  let id = todos.length + 1;
  return { id: id.toString(), name: name, completed: false };
};

//************************************* */

const addTaskToDOM = task => {
  const taskElement = document.importNode(taskTemplate.content, true);
  const checkbox = taskElement.querySelector('input');
  checkbox.id = task.id;
  checkbox.checked = task.completed;
  const label = taskElement.querySelector('label');
  label.htmlFor = task.id;
  label.append(task.task); // Asegúrate de que estás usando 'todo.task' y no otra propiedad
  const deleteBtn = taskElement.querySelector('img');
  deleteBtn.id = task.id;
  listContainer.appendChild(taskElement);
};

//************************ */

const isCompleted = e => {
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedTask = todos.find(task => task.id === e.target.id);
    selectedTask.completed = e.target.checked;
  }

  renderTaskCount();
  saveToLocalstorage();
};

const deleteTodo = e => {
  if (e.target.tagName.toLowerCase() === 'img') {
    const deleteTask = todos.filter(task => task.id !== e.target.id);
    todos = deleteTask;
    focusInput();
    saveAndRender();
  }
  renderTaskCount();
  saveToLocalstorage();
};

const filterTodos = e => {
  if (
    e.target.classList.contains('all') ||
    e.target.classList.contains('activeBtn') ||
    e.target.classList.contains('completed')
  ) {
    listContainer.innerHTML = '';
  }

  todos.map(todo => {
    if (e.target === allTaskBtn) {
      listContainer.innerHTML = '';
      showActiveTodos.classList.remove('active');
      allTaskBtn.classList.add('active');
      showCompletedTodos.classList.remove('active');
      console.log('All');
      saveAndRender();
      focusInput();
    }

    if (e.target === showActiveTodos) {
      showActiveTodos.classList.add('active');
      allTaskBtn.classList.remove('active');
      showCompletedTodos.classList.remove('active');
      if (!todo.completed) {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector('input');
        checkbox.id = todo.id;
        checkbox.checked = todo.completed;
        const label = taskElement.querySelector('label');
        label.htmlFor = todo.id;
        label.append(todo.name);
        const deleteBtn = taskElement.querySelector('img');
        deleteBtn.id = todo.id;
        listContainer.appendChild(taskElement);
      }
    }

    if (e.target === showCompletedTodos) {
      showActiveTodos.classList.remove('active');
      allTaskBtn.classList.remove('active');
      showCompletedTodos.classList.add('active');
      if (todo.completed) {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector('input');
        checkbox.id = todo.id;
        checkbox.checked = todo.completed;
        const label = taskElement.querySelector('label');
        label.htmlFor = todo.id;
        label.append(todo.name);
        const deleteBtn = taskElement.querySelector('img');
        deleteBtn.id = todo.id;
        listContainer.appendChild(taskElement);
      }
    }
  });
};

const renderTaskCount = () => {
  const incompleteTaskCount = todos.filter(task => !task.completed).length;
  const taskString = incompleteTaskCount === 1 || incompleteTaskCount === 0 ? 'item' : 'items';
  listCountElement.innerHTML = `${incompleteTaskCount} ${taskString} left`;
};

const clearCompletedTodos = () => {
  const clearCompleted = todos.filter(task => !task.completed);
  allTaskBtn.classList.add('active');
  showCompletedTodos.classList.remove('active');
  if (clearCompleted.length === todos.length) {
    alert.style.display = 'block';
    alert.textContent = 'Tick one or more items first';
    setTimeout(() => {
      alert.style.display = 'none';
    }, 1500);
  }

  if (clearCompleted.length !== todos.length) {
    alert.style.display = 'block';
    alert.textContent = `Deleted`;
    setTimeout(() => {
      alert.style.display = 'none';
    }, 1500);
  }

  if (clearCompleted.length === 0 && todos.length === 0) {
    alert.style.display = 'block';
    alert.textContent = `No item left`;
    setTimeout(() => {
      alert.style.display = 'none';
    }, 1500);
  }
  todos = clearCompleted;
  saveAndRender();
};

const renderTasks = () => {
  clearElement(listContainer);
  todos.forEach(addTaskToDOM);
  renderTaskCount();
};

const clearElement = element => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

const saveAndRender = () => {
  
  saveToLocalstorage();
  //renderTasks();
};

const saveToLocalstorage = () => {
  console.log("saveToLocalstorage")
  localStorage.setItem(LOCAL_STORAGE_LIST, JSON.stringify(todos));
};

new Sortable(listContainer, {
  animation: 150,
  ghostClass: 'blue-background-class',
});

let todos = []; // Array para guardar las tareas

const focusInput = () => {
  newTodoInput.focus();
};

const submitTodo = async e => {
  e.preventDefault();
  const listName = newTodoInput.value;
  console.log(listName);

  if (listName === null || listName === '') {
      alert.textContent = 'Write a task first';
      alert.style.display = 'block';
      setTimeout(() => {
          alert.style.display = 'none';
      }, 2000);
      focusInput();
      return;
  }

  try {
      const response = await fetch(`${API}/save-user-todo`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ task: listName }),
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
      }

      const task = await response.json();
      todos.push(task); // Actualiza tu array local de tareas
      addTaskToDOM(task); // Solo añade la nueva tarea al DOM
      renderTaskCount(); // Actualiza el contador de tareas
      
  } catch (error) {
      console.error('Error al enviar la tarea:', error);
      // Manejar el error en el UI
  }

  newTodoInput.value = null;
  focusInput();
};

const render = () => {
  clearElement(listContainer);
  fetchTodos();
  saveToLocalstorage();
  focusInput();
};

const fetchTodos = async () => {
  try {
      const response = await fetch(`${API_ENDPOINT_GET}/get-user-todo`);
      if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
      }
      const todosData = await response.json();
      console.log(todosData);
      todos = todosData; // Actualiza tu array local de tareas
      renderTasks(); // Vuelve a renderizar la lista de tareas en el frontend
  } catch (error) {
      console.error('Error al obtener las tareas:', error);
      // Manejar el error en el UI
  }
};

listContainer.addEventListener('click', isCompleted);
newTodoForm.addEventListener('submit', submitTodo);
listContainer.addEventListener('click', deleteTodo);
filterOptions.addEventListener('click', filterTodos);
clearCompletedTaskBtn.addEventListener('click', clearCompletedTodos);

render();

