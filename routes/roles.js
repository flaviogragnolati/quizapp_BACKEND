const server = require('express').Router();
const { Role, User } = require('../models/index');

// Inscribirse a un Quiz - POST a /roles/enroll 

server.post("/enroll", async(req, res) => {
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


server.get("/enrolled/:id", async(req, res) => {
    let { id } = req.params;
    if (!id) return res.status(400).send("El id indicado no existe")
    let pivot = [];
    let listadoUsers = [];
    try {
        const enrolledUsers = await Role.findAll({ where: { QuizId: id, name: "Enrolled"}});
          enrolledUsers.map((r) => {
          pivot.push(r.dataValues.UserId);
        
        //    let userList2 = User.findByPk(r.dataValues.UserId)
        //    console.log("datavalues",userList2)
        //    return userList2;
    })
    console.log("PIVOT", pivot)
   pivot.map(async (e) => {
     let prueba = await User.findByPk(e)
        listadoUsers.push(prueba)
        console.log("PRUEBA", prueba)
        return res.status(200).send(listadoUsers);
    })
   
    } catch (error){
        console.error(error);
        res.status(500).send("Error al buscar usuarios por ese rol");
    }   
})
  


module.exports = server;


