const server = require('express').Router();
const { Quiz, QuizAttempt, User } = require('../models/index');

// Crear un intento de QUIZ - POST a /attempts

server.post("/", async (req, res) => {
    console.log(req.body);
    let { QuizId, UserId, grade, finished } = req.body;
    if (!QuizId || !UserId) return res.status(400).send("Se necesita el QuizId y el UserId");
    QuizAttempt.create({
        QuizId,
        UserId,
        grade,
        finished,
    })
    .then(r => {
        console.log(r);
        return res.status(200).send(r);
    }).catch((error) => {
        console.log(error);
        return res.status(400).send(error);
    });  
});

// Actualiza el resultado de un quiz - PUT a /attempts/:id

server.put("/:id", async(req, res) => {
    let { id } = req.params;
    let { QuizId, UserId, grade, finished } = req.body
    console.log(id);
    let attempt = await QuizAttempt.findOne({ where: { UserId } });
    if (!attempt) return res.status(404).send("No se encontró el intento buscado");
    try {
        const updatedQuizAttempt = await attempt.update({
            grade,
            finished
        });
        return res.send(updatedQuizAttempt);
    } catch(error) {return res.status(400).send(error)};
})

// Devuelve todos los attempts de un usuario - GET a /attempts

server.get("/user/:id", async(req, res) => {
    let { id } = req.params;
    if (!id) return res.status(404).send("Se necesita el id del usuario");
    const userAttempts = await QuizAttempt.findAll({
        where: {UserId: id},
//        include: [{
//            model: User,
//        }]
    });
    return res.status(200).send(userAttempts);
}) 

// Devuelve un attempt de un usuario - GET a /attempts/:id

server.get("/:id", async(req, res) => {
    let { id } = req.params;
    let userId = req.query;
    const userAttempt = await QuizAttempt.findByPk(id);
    if (!userAttempt) return res.status(404).send("No se encontró el intento");
//    if (userId !== userAttempt.UserId) return res.status(403).send("No se permite acceder a la información");
    return res.status(200).send(userAttempt)
});

module.exports = server;