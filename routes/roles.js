const server = require('express').Router();
const { Role } = require('../models/index');

// Inscribirse a un Quiz - POST a /enroll 

server.post("/enroll", async(req, res) => {
    console.log("ENTRÉ")
    let { UserId, QuizId } = req.body;
    if (!UserId || !QuizId) return res.status(400).send("Se necesita indicar el usuario y del quiz para realizar la inscripción");
    try {
        const userToEnroll = await Role.create({UserId, QuizId, name: "Enrolled"});
      
        return res.status(200).send(userToEnroll);
    } catch (error){
        console.error(error);
        res.status(500).send("Error al editar el rol");
    }    
})

module.exports = server;


