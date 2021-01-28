const server = require("express").Router();
const { Quiz, Role } = require('../models/index');

// Borrar una QUIZ by ID - DELETE a /quiz/:id

server.delete("/:id", async (req, res) => {
  let { id } = req.params;

  if (!id)
    return res.status(400).send("Debe indicar el ID del cuestionario a eliminar");

  const quizToDestroy = await Quiz.findByPk(id);

  if (!quizToDestroy)
    return res.status(400).send("No existe el cuestionario a eliminar");

  const quiz = { ...quizToDestroy.dataValues };
  const payload = {
    message: "Se ha eliminado el cuestionario",
    id: quiz.id,
    name: quiz.name,
  };
  await quizToDestroy.destroy();
  return res.status(200).send(payload);
});

// Crear un QUIZ - POST a /quiz

server.post('/', async (req, res) => {
    let { quantity, name, description, modifiedBy, createdBy, students } = req.body;

    try {
        const newQuiz = await Quiz.create({ quantity, name, description, modifiedBy, createdBy  });

        await Role.create({
            QuizId: newQuiz.id,
            UserId: createdBy,
            name: "Teacher"
        });
        
        if(students) {  // Array con id de los user a agregar como student
            students.forEach(async (s) => {
                await Role.create({
                    QuizId: newQuiz.id,
                    UserId: s,
                    name: "Student"
                })
            })
        };

        return res.status(200).send(newQuiz);
    }
    catch(error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al crear el quiz' });
    }
});

// Editar un QUIZ - PUT a /quiz/:id

server.put('/:id', async (req, res) => {
    let { id } = req.params;
    let { quantity, name, description, modifiedBy, students, teachers } = req.body;

    if ( !id ) return res.status(400).send("Debe indicar el id del quiz que desea modificar");   
//    if (!quizToModify) return res.status(400).send("No existe el quiz que desea modificar");
    try {
        const quizToModify = await Quiz.findByPk(id);
        const quizEdited = await quizToModify.update({ quantity, name, description, modifiedBy }); // Habría que ver si se puede poner el "modifiedBy" de manera automática

        if(teachers) {  // Array con id de los user a agregar como student
            teachers.forEach(async (t) => {
                await Role.create({
                    QuizId: newQuiz.id,
                    UserId: t,
                    name: "Teacher"
                })
            })
        };

        if(students) {  // Array con id de los user a agregar como student
            students.forEach(async (s) => {
                await Role.create({
                    QuizId: id,
                    UserId: s,
                    name: "Student"
                })
            })
        };

        return res.status(200).send(quizEdited);
    } 
    catch(error) {
        console.error(error);
        return res.status(500).send({ message: 'Error al modificar el quiz' });
    }
});

// Traer un quiz - GET a /quiz/:id

server.get('/:id', async (req, res) => {
    let { id } = req.params;
    if ( !id ) return res.status(400).send("Debe indicar el id del quiz que desea buscar");
    Quiz.findOne({
        where: { id }
    })
    .then(quiz => {
        return res.status(200).send(quiz);
    })
    .catch(error => {
        console.error(error);
        return res.status(500).send({ message: 'Error al buscar el quiz' })
    })
});

module.exports = server;