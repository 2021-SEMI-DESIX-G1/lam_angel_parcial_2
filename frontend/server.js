const express = require("express");
const app = express();
const port = 3000;

// Configuration for PUG Template engine
app.set("views", "./views");
app.set("view engine", "pug");

// Configuration for static files
app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.render("todoList.pug", { nombre: "Angel Lam" });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
