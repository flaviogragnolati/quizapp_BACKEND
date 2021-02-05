const server = require("express").Router();
const { Quiz, Role, User } = require("../models/index");
const { checkAdmin } = require("../utils/authTools.js");
const passport = require("passport");
const sendMail = require("./mails");


//! ESTA RUTA PARECERÍA ESTAR ANDANDO SIN ROMPER. LA DEJO COMENTADA POR AHORA.
// Listar todos los TEACHERS de una SCHOOL - GET a /teachers/school/:id
/*server.get(
  "/school/:id",
  // passport.authenticate('jwt', { session: false }),
  // checkAdmin,
  async (req, res) => {
    let { id } = req.params;
    if (!id) return res.status(400).send("Debe indicar el ID");

    try {
      const allQuizzes = await Quiz.findAll({
        where: {
          SchoolId: id,
        },
      });

      let quizzesIds = allQuizzes.map((quizId) => {
        return quizId.dataValues.id;
      });
      console.log('IDS', quizzesIds)
      const dataQuizzes = () => {
        return Promise.all(
          quizzesIds.map((QuizId) =>
            Role.findAll({
              where: {
                name: "Teacher",
                QuizId,
              }, attributes: {
            exclude: ['createdAt', 'updatedAt']},
            })
          )
        );
      };

      dataQuizzes().then((teachersList) => {
        return res.status(200).send(teachersList[0]); //Por el findAll y el Promise.all se hace un arreglo dentro de otro, por eso tomo la primera posición (que sería la única)
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al buscar usuarios por ese rol");
    }
  }
);*/

// Listar todos los TEACHERS de una SCHOOL - GET a /teachers/school/:id
server.get(
  "/school/:id",
  // passport.authenticate('jwt', { session: false }),
  // checkAdmin,
  async (req, res, next) => {
    let { id } = req.params;
    let idQ = [];
    var teachersList = [];
    //Buscar todos los QUIZZES de la SCHOOL:
    var allQuizzes = await Quiz.findAll({
      where: {
        SchoolId: id,
      },
    });
    allQuizzes.map((q) => {
      idQ.push(q.id);
    });
    idQ.map((e) => {
      Role.findAll({
        //con un include, tomar solo el id
        where: {
          name: "Teacher",
          QuizId: e,
        },
      }).then((tf) => {
        return res.status(200).send(tf);
      });
    });
  }
);

//Ruta para asignar el rol de TEACHER a un usuario - POST a /teachers

server.post("/", async (req, res, next) => {
  let { teacherId, quizzId } = req.body;
  if (!teacherId || !quizzId)
    return res
      .status(400)
      .send(
        "Se necesita indicar el Id del usuario del Quiz para modificar un rol"
      );
  try {
    //console.log(teacherId, quizzId);
    const userEdited = await Role.create({
      name: "Teacher",
      UserId: teacherId,
      QuizId: quizzId,
    });
    const userPromoted = await User.findByPk(teacherId);

    const quizTeacher = await Quiz.findByPk(quizzId);

    let payload = {
      user: {
        firstName: userPromoted.firstName,
        email: userPromoted.email,
      },
      quiz: {
        name: quizTeacher.name,
        logo: quizTeacher.logo,
        description: quizTeacher.description,
      },
      type: "promote",
    };
    // sendMail(payload); // promueve pero entra en el catch y regresa un 400 (en redux un rejected)
    return res.status(200).send(userEdited);
  } catch (error) {
    return res.status(400).send("No se ha asignado teacher al quiz");
  }
});

// Ruta para eliminar un teacher de un quiz - DELETE a /teachers

server.delete("/", async(req, res) => {
  let { UserId, QuizId } = req.body;
  if (!UserId || !QuizId){
    return res.status(400).send("Se necesita indicar el Id del usuario del Quiz para modificar un rol");
  }
  try {
    const teacherDeleted = await Role.findOne({
      where: { UserId, QuizId}
    });
    teacherDeleted.destroy()
    return res.status(200).send(teacherDeleted);
  } catch (error) {
    return res,status(400).send("No se ha eliminado el teacher")
  }
})



module.exports = server;
