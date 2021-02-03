const server = require("express").Router();
const { Quiz, Role, User } = require("../models/index");
const { checkAdmin } = require("../utils/authTools.js");
const passport = require("passport");
const sendMail = require("./mails");

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
      },
      quiz: {
        name: quizTeacher.name,
      },
      type: "promote",
    };
    sendMail(payload);
    return res.status(200).send(userEdited);
  } catch (error) {
    return res.status(400).send("No se ha asignado teacher al quiz");
  }
});

module.exports = server;
