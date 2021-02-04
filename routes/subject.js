const server = require("express").Router();
const { Subject, Quiz } = require("../models/index");

//  Borrar una SUBJECT by ID - DELETE a /subject/:id

server.delete("/:id", async (req, res) => {
  let { id } = req.params;

  if (!id)
    return res.status(400).send("Debe indicar el ID de la subject a eliminar");

  const subjectToDestroy = await Subject.findByPk(id);

  if (!subjectToDestroy)
    return res.status(400).send("No existe la subject a eliminar");

  const subject = { ...subjectToDestroy.dataValues };
  const payload = {
    message: "Se ha eliminado la subject",
    id: subject.id,
    name: subject.title,
    description: subject.description,
  };

  await subjectToDestroy.destroy();
  return res.status(200).send(payload);
});


// Traer un SUBJECT by ID - GET a /subject/:id

server.get("/:id", async (req, res) => {
    let { id } = req.params;
  
    if (!id) return res.status(400).send("No se encuentra el SUBJECT indicado");
  
    Subject.findAll({
      where: { id },
    })
      .then((subjects) => {
        return res.status(200).send(subjects);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send({ message: "Error al traer los Quizzes" });
      });
  });


// Traer los QUIZ de un SUBJECT - GET a /subject/quizzes/

server.get("/quizzes/", async (req, res) => {
  let { subjectId } = req.body;

  if (!subjectId) return res.status(400).send("No se encuentra el SUBJECT indicado");

  Quiz.findAll({
    where: { subjectId },
  })
    .then((quizzes) => {
      return res.status(200).send(quizzes);
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).send({ message: "Error al traer los Quizzes" });
    });
});

// Crear una SUBJECT - POST a /subject

server.post("/", async (req, res) => {
  let { name, description, SchoolId } = req.body;
  try {
    const newSubject = await Subject.create({ name, description, SchoolId });

    return res.status(200).send(newSubject);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Error al crear la SUBJECT" });
  }
});

// Editar una SUBJECT - PUT a /subject/:id

server.put("/:id", async (req, res) => {
  let { id } = req.params;
  let { name, description } = req.body;

  if (!id)
    return res
      .status(400)
      .send("Es necesario indicar el ID de la subject a editar");

  try {
    const subjectToEdit = await Subject.findByPk(id);

    const subjectEdited = await subjectToEdit.update({
      name, 
      description,
    });

    return res.status(200).send(subjectEdited);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error al editar la subject" });
  }
});

module.exports = server;
