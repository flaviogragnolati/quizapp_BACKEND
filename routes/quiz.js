const passport = require("passport");
const server = require("express").Router();
const {
  Quiz,
  Role,
  User,
  Subject,
  Review,
  Question,
  Answer,
  School,
  QuizTag,
} = require("../models/index");
const { checkSuperAdmin } = require("../utils/authTools.js");

// const { normalize, schema } = require("normalizr");

// Borrar una QUIZ by ID - DELETE a /quiz/:id

//  SCHOOL(SUPERADMIN) - TEACHER

server.delete(
  "/:id",
  passport.authenticate("jwt-school", { session: false }),
  checkSuperAdmin, // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
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
// En vez de cantidad de estudiantes poner el promedio de la review?
server.get("/", async (req, res) => {
  //Agregar el tag dentro del objeto de cada quiz.
  try {
    const schools = await School.findAll();

    const subjects = await Subject.findAll();

    const quizzes = await Quiz.findAll({
      include: { model: QuizTag },
    });

    const quizTags = await QuizTag.findAll();

    const reviews = await Review.findAll();

    let allData = [
      { name: "schools", data: schools },
      { name: "subjects", data: subjects },
      { name: "quizzes", data: quizzes },
      { name: "quizTags", data: quizTags },
      { name: "reviews", data: reviews },
    ];

    let response = {};

    for (let i = 0; i < allData.length; i++) {
      let newProp = allData[i].name;
      response[newProp] = {};
      response[newProp].byId = allData[i].data;

      var ids = [];
      response[newProp].byId.forEach((object) => {
        for (let property in object.dataValues) {
          if (Array.isArray(object[property])) {
            object[property].forEach((p) => {
              ids.push(p.dataValues.id);
            });
            delete object.dataValues[property];
          }
          object.dataValues.ids = ids;    // Darle el nombre de la propiedad
        }
      });

      response[newProp].allIds = allData[i].data.map((p) => {
        return p.id;
      });
    }

    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Error al buscar los quizzes" });
  }
});

//Traer info de un QUIZ - GET a /quiz/info/:id

server.get('/info/:id', async (req, res) => {
  let { id } = req.params;
   if (!id)
    return res.status(400).send('Debe indicar el id del quiz que desea buscar');

  try{
    const quiz = await Quiz.findOne({
      where: { id },
    });
   
    const school = await School.findOne({
      where: { id: quiz.SchoolId },
    });
  
    const subject = await Subject.findOne({
      where: { id: quiz.SubjectId },
    });
  
    // const quizTags = await QuizTag.findAll({
    //   where: { QuizId: quiz.id },
    // });

    // console.log(`encontré quizTags ${quizTags}`);

    const reviews = await Review.findAll({
      where: { QuizId: quiz.id },
    });

    const teachers = await Role.findAll({
      where: {
        QuizId: id,
        name: "Teacher",
      },
    });

    let response = {
      school: {},
      quiz: {},
      subject: {},
      quizTags: {},
      reviews: {},
      teachers: {},
      };

    response.quiz = quiz;

    response.school = school;
 
    response.subject.byId = subject;


    // response.quizTags.byId = quizTags;
    // response.quizTags.allIds = quizTags.map((qt) => {
    //   return qt.id;
    // });

    response.reviews.byId = reviews;
    response.reviews.allIds = reviews.map((r) => {
      return r.id;
    });

    response.teachers.byId = teachers;
    response.teachers.allIds = teachers.map((t) => {
      return t.id;
    });

 
    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error al buscar el quiz' });
  }
});

// Traer Questions & Answers de un quiz - GET a /quiz/:id
// Los profes, la School, la subject, tags, preguntas, reviews. Y alumnos??? Aunque no se muestren.
server.get('/:id', async (req, res) => {
  let { id } = req.params;
  console.log('ID', id);
  if (!id)
    return res.status(400).send('Debe indicar el id del quiz que desea buscar');

  try{
    const quiz = await Quiz.findOne({
      where: { id },
    });
    
    const questions = await Question.findAll({
      where: {
        QuizId: id,
      }, include: {
        model: Answer
      }
    });

     let response = {
       questions: {},
    };

   
    response.questions.byId = questions;
    response.questions.allIds = questions.map((q) => {
      return q.id;
    });

    return res.status(200).send(response);
  } catch (error) {
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
  //passport.authenticate("jwt-school", { session: false }),
  //checkSuperAdmin,  // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let {
      quantity,
      name,
      description,
      modifiedBy,
      createdBy,
      SubjectId,
      SchoolId,
    } = req.body;
    try {
      const newQuiz = await Quiz.create({
        quantity,
        name,
        description,
        modifiedBy,
        createdBy,
        SubjectId,
        SchoolId,
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
  checkSuperAdmin, // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let { id } = req.params;
    let {
      quantity,
      name,
      description,
      modifiedBy,
      //students,
      teachers,
      SubjectId,
      SchoolId,
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
        SubjectId,
        SchoolId,
      }); // Habría que ver si se puede poner el "modifiedBy" de manera automática

      if (teachers) {
        // Array con id de los user a agregar como student
        teachers.forEach(async (t) => {
          await Role.create({
            //Cuando haya data, revisar si agrega por segunda vez un teacher
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
