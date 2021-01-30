const passport = require("passport");
const server = require("express").Router();
const { Quiz, Role, User, Subject, Review, Question, Answer, School, QuizTag } = require("../models/index");
const { checkSuperAdmin } = require("../utils/authTools.js");

// Borrar una QUIZ by ID - DELETE a /quiz/:id

//  SCHOOL(SUPERADMIN) - TEACHER

server.delete(
  "/:id",
  passport.authenticate("jwt-school", { session: false }),
  checkSuperAdmin,  // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let { id } = req.params;

    if (!id)
      return res
        .status(400)
        .send("Debe indicar el ID del cuestionario a eliminar");

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
  }
);

// Traer todos los quizzes - GET a /quiz
// La School, la subject, tags, reviews
//En vez de cantidad de estudiantes poner el promedio de la review?
server.get("/", async (req, res) => {
  //Agregar el tag dentro del objeto de cada quiz.
  
 try {
   const schools = await School.findAll();
   
   const subjects = await Subject.findAll();

   const quizzes = await Quiz.findAll();
    
   const quizTags = await QuizTag.findAll();
   
   const reviews = await Review.findAll();

  let response = {
    schools,
    subjects,
    quizzes,
    quizTags,
    reviews,
  };

  for(let prop in response) {
    response[prop].byId = [prop];
    response[prop].allIds = [prop].map(p => {
      return p.id
    })
  };

  /*response.schools.byId = schools;
  response.schools.allIds = schools.map(s => {
    return s.id;
  });

  response.subjects.byId = subjects;
  response.subjects.allIds = subjects.map(sj => {
    return sj.id;
  });

  response.quizzes.byId = quizzes;
  response.quizzes.allIds = quizzes.map(q => {
    return q.id;
  });

  response.quizTags.byId = quizTags;
  response.quizTags.allIds = quizTags.map(qt => {
    return qt.id;
  })

  response.reviews.byId = reviews;
  response.reviews.allIds = reviews.map(r => {
    return r.id;
  });*/
  
  return res.status(200).send(response);
  
  } catch(error) {
    console.error(error);
    return res.status(500).send({ message: "Error al buscar los quizzes" });
  }
});


// Traer un quiz - GET a /quiz/:id
// Los profes, la School, la subject, tags, preguntas, reviews. Y alumnos??? Aunque no se muestren.
server.get("/:id", async (req, res) => {
  let { id } = req.params;
  
  if (!id)
    return res.status(400).send("Debe indicar el id del quiz que desea buscar");

    try {
      const quiz = await Quiz.findOne({
        where: { id }
      });
     
      const schools = await School.findOne({
        where: { id: quiz.SchoolId }
      });
      
      const subject = await Subject.findOne({
        where: { id: quiz.subjectId }
      });
    
      const quizTags = await QuizTag.findAll({
        where: { QuizId: quiz.id }
      });
      
      const reviews = await Review.findAll({
        where: { QuizId: quiz.id }
      });

      const teachers = await Role.findAll({
        where: {
          QuizId: id,
          name: "Teacher",
        }
      });

/*       teachers = []

      const usersTeachers = await Userver.findAll({
        where: { id }
      }) */

      const questions = await Question.findAll({
        where: {
          QuizId: id,
         }
      })
   
     let response = {
       schools: {},
       subjects: {},
       quiz: {},
       quizTags: {},
       reviews: {},
       teachers: {},
     };

     response.quiz = quiz;
   
     response.schools.byId = schools;
     response.schools.allIds = schools.map(s => {
       return s.id;
     });
   
     response.subjects.byId = subjects;
     response.subjects.allIds = subjects.map(sj => {
       return sj.id;
     });
   
     response.quizTags.byId = quizTags;
     response.quizTags.allIds = quizTags.map(qt => {
       return qt.id;
     })
   
     response.reviews.byId = reviews;
     response.reviews.allIds = reviews.map(r => {
       return r.id;
     });

     response.teachers.byId = teachers;
     response.teachers.allIds = teachers.map(t => {
       return t.id;
     });
     
     return res.status(200).send(response);
     
     } catch(error) {
       console.error(error);
       return res.status(500).send({ message: "Error al buscar el quiz" });
     }

});

// Traer todos los teachers de un QUIZ - GET a /quiz/:QuizId/teachers

server.get("/:QuizId/Teachers", async (req, res) => {
  let { QuizId } = req.params;

  if (!QuizId) return res.status(400).send("Debe ingresar el ID del quiz");

  try {
    const teachers = [];
    const teachersQuiz = await Role.findAll({
      where: {
        QuizId,
        name: "Teacher",
      },
    });

    teachersQuiz.forEach((teacher) => {
      teachers.push(teacher.UserId);
    });

    return res.status(200).send(teachers);
  } catch (error) {
    console.error("CATCH TEACHERS QUIZ", error);
  }
});

// Crear un QUIZ - POST a /quiz

// SCHOOL(SUPERADMIN) - TEACHER

server.post(
  "/",
  passport.authenticate("jwt-school", { session: false }),
  checkSuperAdmin,  // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let {
      quantity,
      name,
      description,
      modifiedBy,
      createdBy,
    } = req.body;

    try {
      const newQuiz = await Quiz.create({
        quantity,
        name,
        description,
        modifiedBy,
        createdBy,
      });

      await Role.create({
        QuizId: newQuiz.id,
        UserId: createdBy,
        name: "Teacher",
      });

      return res.status(200).send(newQuiz);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error al crear el quiz" });
    }
  }
);

// Editar un QUIZ - PUT a /quiz/:id

// SCHOOL(SUPERADMIN) - TEACHER

server.put(
  "/:id",
  passport.authenticate("jwt-school", { session: false }),
  checkSuperAdmin,  // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let { id } = req.params;
    let {
      quantity,
      name,
      description,
      modifiedBy,
      //students,
      teachers,
    } = req.body;

    if (!id)
      return res
        .status(400)
        .send("Debe indicar el id del quiz que desea modificar");
    //    if (!quizToModify) return res.status(400).send("No existe el quiz que desea modificar");
    try {
      const quizToModify = await Quiz.findByPk(id);
      const quizEdited = await quizToModify.update({
        quantity,
        name,
        description,
        modifiedBy,
      }); // Habría que ver si se puede poner el "modifiedBy" de manera automática

      if (teachers) {
        // Array con id de los user a agregar como student
        teachers.forEach(async (t) => {
          await Role.create({
            QuizId: newQuiz.id,
            UserId: t,
            name: "Teacher",
          });
        });
      }

/*       if (students) {
        // Array con id de los user a agregar como student
        students.forEach(async (s) => {
          await Role.create({
            QuizId: id,
            UserId: s,
            name: "Student",
          });
        });
      } */

      return res.status(200).send(quizEdited);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Error al modificar el quiz" });
    }
  }
);

module.exports = server;
