const server = require('express').Router();
const { QuizAttempt, Question, Answer, QuestionInstance,  } = require('../models/index');

// Crear una question instance - POST a /instance

server.post("/", async(req, res) => {
    let { QuestionId, AnswerId, QuizAttemptId, name } = req.body;
    if (!name || !QuestionId || !AnswerId || !QuizAttemptId) return res.status(400).send("No se han completado los datos necesarios");
    QuestionInstance.create({ 
        QuestionId,
        AnswerId, 
        QuizAttemptId, 
        name
    })
    .then(r => {
        return res.status(200).send(r);
    }).catch((error) => {
        console.log(error);
        return res.status(400).send(error);
    });    
})

// Actualizar una question instance - PUT a /instance/:id

server.put("/:id", async(req, res) => {
    let { id } = req.params;
    let { QuestionId, AnswerId, QuizAttemptId, name } = req.body;
    const instance = await QuestionInstance.findOne({ where: { id } });
    if (!instance) return res.status(404).send("No se ha encontrado la instancia solicitada");
    try {
        const updatedInstance = await instance.update({
            QuestionId,
            AnswerId, 
            QuizAttemptId, 
            name,
        });
        return res.status(200).send(updatedInstance);
    } catch(error){
        return res.status(400).send(error);
    }
})

module.exports = server;