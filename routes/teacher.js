const server = require("express").Router();
const { Quiz, Role } = require("../models/index");
const { checkAdmin } = require("../utils/authTools.js");
const passport = require("passport");


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
    var allQuizzes = await Quiz.findAll(
          {where: {
        SchoolId: id}
      })
     allQuizzes.map(q => {
                idQ.push(q.id)
            })
       idQ.map(e => {
          Role.findAll({ //con un include, tomar solo el id
            where: {
              name: "Teacher",
              QuizId: e
            }
          }).then((tf) => {
            
            return res.status(200).send(tf);
          })
          
        })
         
        })
 

  module.exports = server;

