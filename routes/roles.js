const server = require("express").Router();
const { Role, User, Quiz } = require("../models/index");
const sendMail = require("./mails");

//Promover inscripto a STUDENT - POST a : roles/student

server.post("/student/", async (req, res, next) => {
  let { UserId, QuizId } = req.body;
  if (!UserId || !QuizId)
    return res.status(400).send("Se necesita indicar el Id del usuario del Quiz para modificar un rol");
  try {
     const userEdited = await Role.update(
      {name: "Student"},
      {where: {QuizId, UserId}}
      );

    const userPromoted = await User.findByPk(UserId);
    const quizAccepted = await Quiz.findByPk(QuizId);
    
    let payload = {
      user: {
        firstName: userPromoted.firstName,
        email: userPromoted.email,
      },
      quiz: {
        id: quizAccepted.id,
        name: quizAccepted.name,
        logo: quizAccepted.logo,
        description: quizAccepted.description,
      },
      type: "accepted"
    };
  
    // sendMail(payload);

    return res.status(200).send(userPromoted);
  } catch (error) {
    return res.status(500).send("No se ha asignado student al quiz");
  }
});

// Inscribirse a un Quiz - POST a /roles/enroll

server.post("/enroll", async (req, res) => {
  let { UserId, QuizId } = req.body;
  if (!UserId || !QuizId)
    return res
      .status(400)
      .send(
        "Se necesita indicar el usuario y del quiz para realizar la inscripción"
      );
  try {
    const userToEnroll = await Role.create({
      UserId,
      QuizId,
      name: "Enrolled",
    });

    return res.status(200).send(userToEnroll);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al editar el rol");
  }
});

/* server.get("/enrolled/:id", async(req, res) => {
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
}); */

// Ruta que trae todos los usuarios que están enrolados a un QUIZ - GET a /roles/enrolled/:id

server.get("/enrolled/:id", async (req, res) => {
  let { id } = req.params;
  if (!id) return res.status(400).send("El id indicado no existe");

  try {
    const enrolledUsers = await Role.findAll({
      where: { QuizId: id, name: "Enrolled" },
    });

    let usersId = enrolledUsers.map((user) => {
      return user.dataValues.UserId;
    });

    const dataUsersEnrolled = () => {
      return Promise.all(usersId.map((uid) => 
        User.findByPk(uid, { attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt', 'password', 'resetPasswordExpires', 'resetPasswordToken', 'cellphone', 'birthdate']}})
      ));
    };

    dataUsersEnrolled().then((enrolledUsers) => {
      return res.status(200).send(enrolledUsers);
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al buscar usuarios por ese rol");
  }
});

module.exports = server;
