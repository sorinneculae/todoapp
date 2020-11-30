let data = {};

/*
  get the list of todos when app starts
*/

getList();

/*
  this will be called after every mutation
  right after result is returned, we will render the data on the screen
*/

function getList() {
  const query = `{
    lists {
      name
      id
      todos {
        id
        name
        completed
        listId
      }
    }
  }`;
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  };

  fetch(`http://localhost:4000/graphql`, options)
    .then(res => res.json())
    .then(res => {
      data = res.data.lists;
      render(data);
    });
}

/*
  used for any mutation in tje database: add, delete, update
*/

function mutation(query) {
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  };

  fetch(`http://localhost:4000/graphql`, options)
    .then(res => res.json())
    .then(res => getList());
}

/*
  get the data and render it on the screen
*/

function render(data) {
  const parent = document.getElementById('todos');
  parent.innerHTML = '';
  for (let i = 0; i < data.length; i++) {
    const l = data[i];
    const list = document.createElement('div');
    list.classList.add('todo-list');
    const todos = l.todos.map(item => `
        <li class="todo-item">
          <span class="todo-title ${ item.completed ? 'done' : ''}" onclick="markCompleted('${ item.id }', ${ !item.completed })">${item.name}</span>
          <span class="icon ${ item.completed ? 'icon-checkmark' : 'icon-checkmark2'}" onclick="markCompleted('${ item.id }', ${ !item.completed })"></span>
          <span class="icon icon-bin" onclick="removeTodo('${ item.id }')"></span>
        </li>`);
    list.innerHTML = `
        <h3 class="list-title">${l.name}<span class="icon icon-bin" onclick="removeList('${ l.id }')"></span></h3>
        <form onsubmit="addTodo(event, this, '${ l.id }')" class="todo-form">
          <input name="name" type="text" placeholder="New todo">
          <button type="submit"><i class="icon icon-plus"></i></button>
        </form>
        <ul>
          ${todos.join('')}
        </ul>`;

    parent.appendChild(list);
  }
}

/*
  mutations
*/

function addList(e, form) {
  e.preventDefault();
  const input = form.elements['name'];
  const { value } = input;
  if (value != '') {
    mutation(`
      mutation {
        addList(name: "${value}") {
          name
        }
      }`);
  }
  input.value = '';
}

function addTodo(e, form, id) {
  e.preventDefault();
  const input = form.elements['name'];
  const { value } = input;
  if (value != '') {
    mutation(`
      mutation {
        addTodo(name: "${value}", completed: false, listId: "${id}") {
          name
        }
      }`);
  }
  input.value = '';
}

function markCompleted(id, completed) {
  mutation(`
    mutation {
      updateTodo(id: "${id}", completed: ${completed}) {
        name
      }
    }`);
}

function removeTodo(id) {
  mutation(`
    mutation {
      removeTodo(id: "${id}") {
        name
      }
    }`);
}

function removeList(id) {
  mutation(`
    mutation {
      removeList(id: "${id}") {
        name
      }
    }`);
}

/*
  END mutations
*/