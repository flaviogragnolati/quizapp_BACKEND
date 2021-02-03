const server = require('express').Router();

// Editar un ROL - PUT a /role/:id //Ver relación con quizId (cómo lo recibimos y buscar en la tabla por QuizId)
//!NO ANDA. Está en TEACHERS
server.put("/:id"), async(req, res) => {
    let { id } = req.params;
    let { name } = req.body;
    if (!id) return res.status(400).send("Se necesita indicar el Id del usuario al que se le quiere modificar el rol");
    try {
        const userToModify = await Roles.findOne({where: {UserId: id}});
        const userModified = await userToModify.update({name});
        return res.status(200).send(userModified);
    } catch (error){
        console.error(error);
        res.status(500).send("Error al editar el rol");
    }    
}

module.exports = server;


