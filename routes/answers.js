const server = require("express").Router();
const { Answer } = require("../models/index");

// Borrar una ANSWER by ID - DELETE a /answers/:id

server.delete("/:id", async (req, res) => {
  let { id } = req.params;

  if (!id)
    return res
      .status(400)
      .send("Debe indicar el ID de la respuesta a eliminar");

  const ansToDestroy = await Answer.findByPk(id);

  if (!ansToDestroy)
    return res.status(400).send("No existe la respuesta a eliminar");

  const answer = { ...ansToDestroy.dataValues };
  const payload = {
    message: "Se ha eliminado la respuesta",
    id: answer.id,
    text: answer.text,
    correct: answer.correct,
  };
  await ansToDestroy.destroy();
  return res.status(200).send(payload);
});

// Crear una ANSWER - POST a /answers

server.post("/", async (req, res) => {
  let { text, correct, QuestionId } = req.body;

  if (!text || correct === undefined)
    return res
      .status(400)
      .send("No ha ingresado una respuesta o si es correcta o no");

  Answer.create({
    text,
    correct,
    QuestionId,
  })
    .then((answer) => {
      return res.status(200).send(answer);
    })
    .catch((error) => {
      console.log(error);
      return res.status(304).send(error);
    });
});

// Editar una Answer by ID - PUT a /answers/:id

server.put("/:id", async (req, res) => {
  let { text, correct } = req.body;
  let { id } = req.params;

  if (!id) return res.status(400).send("La respuesta no fue encontrada");

  const answerEdited = await Answer.update(
    { text, correct },
    { where: { id } }
  );
  //.then((answer)=> {
  return res
    .status(200)
    .send({ message: "Se ha modificado la pregunta", resp: answerEdited });
  //})
});

// Devuelve una Answer by ID - GET a /answers/:id

server.get("/:id", (req, res) => {
  let { id } = req.params;
  //    console.log(id);
  if (!id) return res.status(404).send("No existe la respuesta");

  Answer.findByPk(id).then((answer) => {
    return res.status(200).send(answer);
  }).catch((error) => {
    console.log(error);
    return res.status(304).send(error);
  });
});

module.exports = server;
