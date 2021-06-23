const express = require("express");
const { body, validationResult } = require("express-validator");
const cors = require("cors");
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

const Data = [
  {
    name: "Terminar clase de metodologías",
    type: "",
    completed: true,
  },
  {
    name: "Hacer laboratorio de programación",
    type: "",
    completed: false,
  },
];

const Tasks = {
  getTasks: (req, res) => {
    res.json({
      model: "Tasks",
      count: Data.length,
      data: Data,
    });
  },
  getTask: (req, res) => {
    res.json(Data[req.params.id]);
  },
  createTask: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(errors);
    }
    const { name, completed, type } = req.body;
    Data.push({ name, completed, type });
    res.json({
      model: "Tasks",
      count: Data.length,
      data: Data,
    });
  },
  completeTask: (req, res) => {
    const { completed } = req.body;
    Data[req.params.id].completed = completed;
    res.json({
      model: "Tasks",
      data: Data,
    });
  },
  updateTask: (req, res) => {
    Data[req.params.id] = req.body;
    res.json({
      model: "Tasks",
      data: Data,
    });
  },
  deleteTask: (req, res) => {
    Data.splice(req.params.id, 1);
    res.json({
      model: "Tasks",
      data: Data,
    });
  },
};

const TasksValidations = {
  createTask: [
    body("name", "La tarea es requerida.").exists({
      checkNull: true,
      checkFalsy: true,
    }),
    body("type").isIn(["universidad", "", "trabajo"]),
  ],
};

app.get("/api/v1/tasks/", Tasks.getTasks);
app.post("/api/v1/tasks/", TasksValidations.createTask, Tasks.createTask);
app.patch("/api/v1/tasks/:id", Tasks.completeTask);
app.put("/api/v1/tasks/update/:id", Tasks.updateTask);
app.delete("/api/v1/tasks/:id", Tasks.deleteTask);

app.listen(port, () => {
  console.log(`Ejemplo escuchando en: http://localhost:${port}`);
});
