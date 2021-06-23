(() => {
  const App = {
    htmlElements: {
      taskForm: document.getElementById("task-form"),
      mainTaskList: document.querySelector(".main-task-list"),
      taskInput: document.getElementById("task-input"),
      taskDropdown: document.getElementById("task-dropdown"),
    },
    init: () => {
      App.initializeData.tasks();
      App.bindEvents();
    },
    bindEvents: () => {
      App.htmlElements.taskForm.addEventListener(
        "submit",
        App.events.onTaskFormSubmit
      ),
        App.htmlElements.mainTaskList.addEventListener(
          "change",
          App.events.onCompletedTask
        );
      App.htmlElements.mainTaskList.addEventListener(
        "click",
        App.events.onDeleteTask
      );
    },
    initializeData: {
      tasks: async () => {
        const { data } = await App.utils.getData(
          "http://localhost:4000/api/v1/tasks/"
        );
        data.forEach((task, index) => {
          App.events.addTask({
            name: task.name,
            status: task.completed,
            type: task.type,
            index,
          });
        });
        App.htmlElements.taskInput.value = "";
        App.htmlElements.taskDropdown.value = "";
      },
    },
    events: {
      addTask: ({ name, type, status, index }) => {
        App.htmlElements.mainTaskList.innerHTML += `<div class="task-list"><div class="task-checkbox"><input ${
          status === true ? "checked" : ""
        } type="checkbox" class="checkbox" name="rendered-task" data-status="${status}" data-name="${name}" id="${name}_${index}" data-number="${index}">
        <section class="task-label">  
        <label for="${name}_${index}" class="task-name" style="text-decoration:${
          status === true ? "line-through" : ""
        }">${name}</label><label for="${name}_${index}" class="task-type">${type}</label></section></div><div><button type="button" class="update_button">Actualizar</button><button type="button" class="delete_button">Borrar</button></div></div>`;
      },
      onCompletedTask: async (event) => {
        if (event.target.nodeName === "INPUT") {
          const completedInput =
            event.target.getAttribute("data-status") === "false";

          if (completedInput) {
            event.target.parentElement.children[1].children[0].style.textDecoration =
              "line-through";
          } else {
            event.target.parentElement.children[1].children[0].style.textDecoration =
              "none";
          }

          const data = {
            completed: completedInput,
          };

          document
            .getElementById(event.target.id)
            .setAttribute("data-status", completedInput);

          await App.utils.patchData(
            "http://localhost:4000/api/v1/tasks/",
            data,
            event.target.getAttribute("data-number")
          );
        }
      },
      onDeleteTask: async (event) => {
        if (event.target.className === "delete_button") {
          event.target.parentElement.parentElement.remove();
          await App.utils.deleteData(
            "http://localhost:4000/api/v1/tasks/",
            event.target.parentElement.parentElement.children[0].children[0].getAttribute(
              "data-number"
            )
          );
        }
        if (event.target.className === "update_button") {
          const childrens = [...App.htmlElements.mainTaskList.children];
          childrens.forEach((child) => {
            child.children[1].children[1].disabled = false;
          });
          App.htmlElements.taskInput.value =
            event.target.parentElement.parentElement.children[0].children[1].children[0].innerHTML;
          App.htmlElements.taskDropdown.value =
            event.target.parentElement.parentElement.children[0].children[1].children[1].innerHTML;

          App.htmlElements.taskInput.setAttribute(
            "data-position",
            event.target.parentElement.parentElement.children[0].children[0].getAttribute(
              "data-number"
            )
          );

          App.htmlElements.taskInput.setAttribute(
            "data-id",
            event.target.parentElement.parentElement.children[0].children[0].id
          );

          event.target.parentElement.children[1].disabled = true;
        }
      },
      onTaskFormSubmit: async (event) => {
        event.preventDefault();
        const {
          task: { value: taskValue },
          "task-type": { value: taskType },
        } = event.target.elements;

        const inputId = App.htmlElements.taskInput.getAttribute("data-id");

        if (inputId !== "" && inputId !== null && inputId !== undefined) {
          const updateElement = document.getElementById(
            App.htmlElements.taskInput.getAttribute("data-id")
          );

          updateElement.parentElement.children[1].children[0].innerHTML =
            taskValue;
          updateElement.parentElement.children[1].children[1].innerHTML =
            taskType;

          // Actualizar en el servidor
          await App.utils.putData(
            "http://localhost:4000/api/v1/tasks/update/",
            {
              name: taskValue,
              type: taskType,
              completed: false,
            },
            App.htmlElements.taskInput.getAttribute("data-position")
          );
        } else {
          App.events.addTask({
            name: taskValue,
            status: "false",
            type: taskType,
            index: App.htmlElements.mainTaskList.childElementCount,
          });
          // Guardar en el servidor
          await App.utils.postData("http://localhost:4000/api/v1/tasks/", {
            name: taskValue,
            type: taskType,
            completed: false,
          });
        }

        App.htmlElements.taskInput.value = "";
        App.htmlElements.taskInput.setAttribute("data-id", "");
        App.htmlElements.taskInput.setAttribute("data-position", "");
        App.htmlElements.taskDropdown.value = "";
      },
    },
    utils: {
      getData: async (url = "") => {
        const response = await fetch(url);
        return response.json();
      },
      // Ejemplo implementando el metodo POST:
      postData: async (url = "", data = {}) => {
        console.log(data);
        // Opciones por defecto estan marcadas con un *
        const response = await fetch(url, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
      },
      patchData: async (url = "", data = {}, id) => {
        const response = await fetch(url + id, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      },
      putData: async (url = "", data = {}, id) => {
        const response = await fetch(url + id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      },
      deleteData: async (url = "", id) => {
        const response = await fetch(url + id, {
          method: "DELETE",
        });
        return response.json();
      },
    },
  };
  App.init();
})();
