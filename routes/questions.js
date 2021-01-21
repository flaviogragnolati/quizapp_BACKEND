const server = require("express").Router();
const { Question } = require("../models/index");

// Borrar una QUESTION by ID - DELETE a /questions/:id

server.delete("/:id", async (req, res) => {
  let { id } = req.params;

  if (!id)
    return res.status(400).send("Debe indicar el ID de la pregunta a eliminar");

  const questionToDestroy = await Question.findByPk(id);

  if (!questionToDestroy)
    return res.status(400).send("No existe la pregunta a eliminar");

  const question = { ...questionToDestroy.dataValues };
  const payload = {
    message: "Se ha eliminado la pregunta",
    id: question.id,
    name: question.title,
  };
  await questionToDestroy.destroy();
  return res.status(200).send(payload);
});

// Traer todas las QUESTION de un QUIZ - GET a /questions/:id

server.get("/", async (req, res) => {
  let { QuizId } = req.body;

  if (!QuizId) return res.status(400).send("No se encuentra el QUIZ indicado");

  Question.findAll({
    where: { QuizId },
  })
    .then((questions) => {
      return res.status(200).send(questions);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).send({ message: "Error al traer las preguntas" });
    });
});

// Crear una QUESTION - POST a /questions

server.post("/", async (req, res) => {
  let { title, modifiedBy, createdBy, QuizId } = req.body;

  try {
    const newQuestion = await Question.create({ title, modifiedBy, createdBy, QuizId });

    return res.status(200).send(newQuestion);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Error al crear la pregunta" });
  }
});

// Editar una QUESTION - PUT a /questions/:id

server.put("/:id", async (req, res) => {
  let { id } = req.params;
  let { title, modifiedBy, createdBy } = req.body;

  if (!id)
    return res
      .status(400)
      .send("Es necesario indicar el ID de la pregunta a editar");

  try {
    const questionToEdit = await Question.findOne({ where: { id } });

    const questionEdited = await questionToEdit.update({
      title,
      modifiedBy,
      createdBy,
    });

    return res.status(200).send(questionEdited);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error al editar la pregunta" });
  }
});

module.exports = server;
