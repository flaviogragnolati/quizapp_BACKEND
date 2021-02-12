const passport = require('passport');
const server = require('express').Router();
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
} = require('../models/index');
const { Op } = require('sequelize');
const db = require('../models');
const quiz = require('../models/quiz');
const { checkSuperAdmin } = require('../utils/authTools.js');
const { paginate } = require('../utils/index.js');

const { normalize, schema } = require('normalizr');
const sequelize = db.sequelize;

// Borrar una QUIZ by ID - DELETE a /quiz/:id

//  SCHOOL(SUPERADMIN) - TEACHER

server.delete(
  '/:id',
  // passport.authenticate('jwt-school', { session: false }),
  // checkSuperAdmin, // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let { id } = req.params;

    if (!id)
      return res
        .status(400)
        .send('Debe indicar el ID del cuestionario a eliminar');

    const quizToDestroy = await Quiz.findByPk(id);

    if (!quizToDestroy)
      return res.status(400).send('No existe el cuestionario a eliminar');

    const quiz = { ...quizToDestroy.dataValues };
    const payload = {
      message: 'Se ha eliminado el cuestionario',
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
server.get('/', async (req, res) => {
  //Agregar el tag dentro del objeto de cada quiz.

  // TRAE EL DOBLE DE QUIZZES QUE PIDE PORQUE EN LA FUNCIÓN (EN INDEX) LE ESTAMOS PIDIENDO EL DOBLE PARA QUE HAGA EL PEDIDO AL BACK MENOS VECES
  let { page, pageSize } = req.query;

  try {
    let data = await Quiz.findAll(
      paginate(
        {
          //where: { active: true },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'SubjectId', 'SchoolId'],
          },
          include: [
            {
              model: Subject,
              attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
            {
              model: School,
              attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
            {
              model: Review,
              attributes: { exclude: ['createdAt', 'updatedAt', 'QuizId'] },
            },
            {
              model: QuizTag,
              attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
          ],
          raw: true,
          nest: true,
        },
        { page, pageSize }
      )
    );

    const UserSchema = new schema.Entity('users');
    const SubjectsSchema = new schema.Entity('subjects');
    const SchoolSchema = new schema.Entity('schools');
    const TagSchema = new schema.Entity('tags');
    const QuizTagSchema = new schema.Entity(
      'quizTags',
      {},
      {
        // processStrategy: (entity) => omit(entity, 'name'),
      }
    );
    const ReviewSchema = new schema.Entity('reviews', {}, {});
    const QuizSchema = new schema.Entity(
      'quizzes',
      {
        Subject: SubjectsSchema,
        School: SchoolSchema,
        QuizTags: QuizTagSchema,
        Reviews: ReviewSchema,
      },
      {
        mergeStrategy: (entityA, entityB) => ({
          ...entityA,
          ...entityB,
          QuizTags: [
            ...new Set(
              [entityA.QuizTags].concat(entityB.QuizTags).flat(10 ^ 1000)
            ),
          ], //!solucionar ULTRA CAVERNICOLA... HAY QUE BUSCAR LA FORMA DE MERGEAR LOS OBJETOS SIN SER TAN NINJA.....
          Reviews: [
            ...new Set(
              [entityA.Reviews].concat(entityB.Reviews).flat(10 ^ 1000)
            ),
          ], //!solucionar ULTRA CAVERNICOLA... HAY QUE BUSCAR LA FORMA DE MERGEAR LOS OBJETOS SIN SER TAN NINJA.....
        }),
      }
    );

    const normalizedData = normalize(data, [QuizSchema]);

    const studentsXquiz = {};
    for await (const q of data) {
      const quantity = await Role.count({
        where: {
          QuizId: q.id,
          name: 'Student',
        },
      }).then((y) => {
        return (studentsXquiz[q.id] = y);
      });
    }
    normalizedData.entities.studentsXquiz = studentsXquiz;

    const allQuizzes = await Quiz.findAll();
    const allQuizzesIds = allQuizzes.map((quiz) => quiz.id);

    normalizedData.allQuizzesIds = allQuizzesIds;

    return res.status(200).send(normalizedData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Error al buscar los quizzes' });
  }
});

//Traer info de un QUIZ - GET a /quiz/info/:id

server.get('/info/:id', async (req, res) => {
  let { id } = req.params;
  if (!id)
    return res.status(400).send('Debe indicar el id del quiz que desea buscar');

  try {
    let data = await Quiz.findAll({
      where: { id },
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'SubjectId', 'SchoolId'],
      },
      include: [
        {
          model: Subject,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        { model: School, attributes: { exclude: ['createdAt', 'updatedAt'] } },
        {
          model: Review,
          attributes: { exclude: ['createdAt', 'updatedAt', 'QuizId'] },
        },
        {
          model: QuizTag,
          attributes: { exclude: ['createdAt', 'updatedAt', 'Quiz_QTag'] },
        },
      ],
    });

    const teachers = await Role.findAll({
      where: {
        QuizId: id,
        name: 'Teacher',
      },
      raw: true,
      nest: true,
    });
    // console.log(data[0]);
    let response = {
      ...data[0].dataValues,
      teachers,
    };
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

  if (!id)
    return res.status(400).send('Debe indicar el id del quiz que desea buscar');

  try {
    const quiz = await Quiz.findOne({
      where: { id },
    });

    const questions = await Question.findAll({
      where: {
        QuizId: id,
      },
      include: {
        model: Answer,
      },
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
    return res.status(500).send({ message: 'Error al buscar el quiz' });
  }
});

// Contar todos los QUIZZES - GET a /quiz/all/quizzes

server.get('/all/quizzes', async (req, res) => {
  try {
    const allQuizzes = await Quiz.count({});

    return res.status(200).send(allQuizzes.toString()); // Primera opción: No me deja enviar números (lo toma como que intento enviar un status), por eso lo paso a STRING
    //return res.status(200).send({
    //numberOfQuizzes: allQuizzes
    //}); // Segunda opción: enviar un objeto con el valor
  } catch (error) {
    console.error(error);
    return res.status(500).send('CATCH COUNT ALL QUIZZES');
  }
});

//Contar todos los estudiantes de un QUIZ - GET a /quiz/countStudents/:id
server.get('/countStudents/:id', async (req, res) => {
  let { id } = req.params;
  try {
    const quantity = await Role.count({
      where: {
        QuizId: id,
        name: 'Student',
      },
    });
    // console.log('cantidad', quantity);
    return res.sendStatus(200).send(quantity);
  } catch (error) {
    console.error(error);
    return res.status(500).send('CATCH COUNT STUDENTS FROM QUIZ');
  }
});

// Traer todos los teachers de un QUIZ - GET a /quiz/:QuizId/teachers

server.get('/:QuizId/teachers', async (req, res) => {
  let { QuizId } = req.params;

  if (!QuizId) return res.status(400).send('Debe ingresar el ID del quiz');

  try {
    const teachersQuiz = await Role.findAll({
      where: {
        QuizId,
        name: 'Teacher',
      },
    });

    let teachersIds = teachersQuiz.map((teacher) => {
      return teacher.dataValues.UserId;
    });

    const teachersInfo = () => {
      return Promise.all(
        teachersIds.map((tId) =>
          User.findByPk(tId, {
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'deletedAt',
                'password',
                'resetPasswordExpires',
                'resetPasswordToken',
                'cellphone',
                'birthdate',
              ],
            },
          })
        )
      );
    };

    teachersInfo().then((teachers) => {
      return res.status(200).send(teachers);
    });
  } catch (error) {
    console.error('CATCH TEACHERS OF THE QUIZ', error);
  }
});

// Ruta que trae todos los QUIZZES en los que está enrolado el usuario - GET a /roles/enrolled/user/:id

server.get('/enrolled/user/:id', async (req, res) => {
  let { id } = req.params;

  if (!id) return res.status(400).send('Debe incluir el ID');

  try {
    const quizzesEnrolledUser = await Role.findAll({
      where: { UserId: id, name: 'Enrolled' },
    });

    let quizzesId = quizzesEnrolledUser.map((quiz) => {
      return quiz.dataValues.QuizId;
    });

    const dataEnrolledQuizzes = () => {
      return Promise.all(
        quizzesId.map((qId) =>
          Quiz.findByPk(qId, {
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'modifiedBy',
                'createdBy',
                'SubjectId',
                'SchoolId',
              ],
            },
          })
        )
      );
    };

    dataEnrolledQuizzes().then((enrolledQuizzes) => {
      return res.status(200).send(enrolledQuizzes);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send('Error al buscar los quizzes en los que está enrolado el USER');
  }
});

// Traer todos los students de un QUIZ - GET a /quiz/:QuizId/students

server.get('/:QuizId/students', async (req, res) => {
  let { QuizId } = req.params;

  if (!QuizId) return res.status(400).send('Debe ingresar el ID del quiz');

  try {
    const studentsInQuiz = await Role.count({
      where: {
        QuizId,
        name: 'Student',
      },
    });

    return res.status(200).send(studentsInQuiz.toString()); // Primera opción: No me deja enviar números (lo toma como que intento enviar un status), por eso lo paso a STRING
    //return res.status(200).send({
    //numberOfStudents: studentsInQuiz
    //}); // Segunda opción: enviar un objeto con el valor
  } catch (error) {
    console.error(error);
    return res.status(500).send('CATCH STUDENTS QUIZ');
  }
});

// Crear un QUIZ - POST a /quiz

// SCHOOL(SUPERADMIN) - TEACHER

server.post(
  '/',
  //passport.authenticate("jwt-school", { session: false }),
  //checkSuperAdmin,  // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let { name, description, logo, SubjectId, SchoolId } = req.body;

    try {
      const newQuiz = await Quiz.create({
        quantity: 0,
        name,
        description,
        logo,
        //createdBy: 1,
      });

      const setTheSubject = await Subject.findByPk(SubjectId);
      newQuiz.setSubject(setTheSubject);

      const setTheSchool = await School.findByPk(SchoolId);
      newQuiz.setSchool(setTheSchool);

      return res.status(200).send(newQuiz);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error al crear el quiz' });
    }
  }
);

// Agregar TAG a QUIZ - POST a /quiz/:id/tags

server.post('/:id/tags', async (req, res) => {
  let { id } = req.params;
  let { tags } = req.body;

  if (!id) return res.status(400).send('Indique el ID del QUIZ');

  try {
    const quizToEdit = await Quiz.findByPk(id);

    console.log(quizToEdit instanceof Quiz);

    tags.forEach((t) => {
      quizToEdit.setQuizTags(t);
    });

    return res.status(200).send('Tags agregadas con éxito');
  } catch (error) {
    console.error(error);
    return res.status(400).send('CATCH post TAGS');
  }
});

// Editar un QUIZ - PUT a /quiz/:id

// SCHOOL(SUPERADMIN) - TEACHER

server.put(
  '/:id',
  passport.authenticate('jwt-school', { session: false }),
  checkSuperAdmin, // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let { id } = req.params;
    let {
      quantity,
      name,
      description,
      modifiedBy, // enviar ID de user logueado
      //students,
      teachers,
      SubjectId,
      SchoolId,
    } = req.body;

    if (!id)
      return res
        .status(400)
        .send('Debe indicar el id del quiz que desea modificar');
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
        // Array con id de los user a agregar como teachers
        teachers.forEach(async (t) => {
          await Role.create({
            //Cuando haya data, revisar si agrega por segunda vez un teacher
            QuizId: newQuiz.id,
            UserId: t,
            name: 'Teacher',
          });
        });
      }
      return res.status(200).send(quizEdited);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Error al modificar el quiz' });
    }
  }
);

// Ruta para activar/desactivar QUIZZES - PUT a /quiz/activate/:id
const toNum = (n) => {
  return Number(n) || n;
};

server.put('/activate/:id', async (req, res) => {
  let { id } = req.params;
  try {
    const quizToActivate = await Quiz.findByPk(id);

    quizToActivate.update({
      active: !quizToActivate.active,
    });

    return res.status(200).send(id);
  } catch (error) {
    console.error(error);
    return res.status(500).send('CATCH activate quiz');
  }
});

server.post('/bulkUpdate', async (req, res) => {
  const {
    quizId: QuizId,
    questions,
    toDelete: { questions: toDeleteQuestionsId, answers: toDeleteAnswers },
  } = req.body;

  if (
    questions.length === 0 &&
    toDeleteQuestionsId.length === 0 &&
    Object.keys(toDeleteAnswers).length === 0 &&
    toDeleteAnswers.constructor === Object
  )
    return res.status(400).send({
      message: 'No se recibieron preguntas a actualizar o para borrar',
    });
  // console.log('QQQQQQQQQQQQQQQQQQ', questions);
  //Buscamos el quiz para verificar que exista
  const quiz = await Quiz.findByPk(parseInt(QuizId));
  if (!quiz)
    return res
      .status(400)
      .send({ message: 'El id no corresponde a ningun quiz' });

  //Se podian arman 2 objetos con info anidada adentro....pero asi es mas claro para debuggear :D
  //variables para guardar la data `vieja` que hay que ACTUALIZAR
  let toUpdateQuestionsId = [];
  let toUpdateQuestions = {};
  let toUpdateAnswersId = {};
  let toUpdateAnswers = {};
  //variables para guardar la data `nueva` que hay que CREAR
  let newQuestionsId = [];
  let newQuestions = {};
  let newAnswersId = {};
  let newAnswers = {};
  //*Bloque de manipulacion de data, deberiamos extraerlo a otra func
  try {
    for (const question of questions) {
      //las preguntas nuevas tienen un id No numerico
      if (!Number(question.id)) {
        //doble chequeo de paranoico??? nunca deberia recibir un id como string, a menos que sea un uuid
        let { Answers, createdAt: _c, updatedAt: _u, id: _id, ...q } = question;
        newQuestionsId.push(toNum(_id));
        newQuestions[toNum(_id)] = q;
        newAnswersId[toNum(_id)] = [];
        newAnswers[toNum(_id)] = {};
        Answers.forEach((answer) => {
          let { id: _ansId, ...ans } = answer;
          newAnswers[toNum(_id)][toNum(_ansId)] = ans;
          newAnswersId[toNum(_id)].push(toNum(_ansId));
        });
      } else {
        //las preguntas ya existentes tienen un id numerico y caen en el else
        let { Answers, ...q } = question;
        toUpdateQuestionsId.push(toNum(q.id));
        toUpdateQuestions[toNum(q.id)] = q;
        toUpdateAnswersId[toNum(q.id)] = [];
        toUpdateAnswers[toNum(q.id)] = {};
        // newAnswersId[q.id] = [];
        // newAnswers[q.id] = {};
        Answers.forEach((answer) => {
          //if para chequear si es una nueva respuesta para una pregunta existente
          if (!Number(answer.id)) {
            if (!Array.isArray(newAnswersId[toNum(q.id)]))
              newAnswersId[toNum(q.id)] = [];
            if (typeof newAnswers[toNum(q.id)] !== 'object')
              newAnswers[toNum(q.id)] = {};
            let { id: _ansId, ...ans } = answer;
            newAnswers[toNum(q.id)][toNum(_ansId)] = ans;
            newAnswersId[toNum(q.id)].push(toNum(_ansId));
          } else {
            //respuestas viejas que van a ser editadas
            toUpdateAnswers[toNum(q.id)][toNum(answer.id)] = answer;
            toUpdateAnswersId[toNum(q.id)].push(toNum(answer.id));
          }
        });
      }
    }
  } catch (error) {
    console.error(`Error en /bulkUpdate ----> manipulacion de data:
    ${error}`);
    return res.status(500).send({ message: 'Ha ocurrido un error!' });
  }
  //hacemos un bulk create de las questions
  // const createdQuestions = await Question.bulkCreate(t, {
  //   // validate: true,
  //   // hooks: true,
  //   // individualHooks: true,
  //   updateOnDuplicate: toUpdateQuestionsId,
  //   returning: ['id'],
  // });

  //*Bloque de operaciones con la DB con transacciones, nop queremos commitear ningun cambio si alguno
  //* lo mas prolijo seria usar un Promise.all y pasar todas las transacciones ahi, luego validar las transacciones
  //*
  try {
    //!como la documentacion de sequelize es una mierda y no hay nada sobre bulkcreate...
    //!volvemos al viejo y querido for
    const result = await sequelize.transaction(async (t) => {
      //borramos las preguntas que recibimos en toDeleteQuestions
      if (toDeleteQuestionsId.length > 0) {
        for await (const del_qId of toDeleteQuestionsId) {
          //en caso de que el id no sea numerico, sabemos que es una nueva question que nunca llego a la DB,
          if (!Number(del_qId)) continue;
          const foundToDeleteQuestion = await Question.findByPk(del_qId, {
            transaction: t,
          });
          if (!foundToDeleteQuestion) continue;
          foundToDeleteQuestion.destroy({
            transaction: t,
          });
        }
      }
      //for para crear nueva preguntas y sus correspondientes respuestas
      for await (const new_qId of newQuestionsId) {
        let createdQuestion = await Question.create(newQuestions[new_qId], {
          transaction: t,
        });
        for await (const new_aId of newAnswersId[new_qId]) {
          let newAnsPayload = newAnswers[new_qId][new_aId];
          newAnsPayload.QuestionId = createdQuestion.id;
          await Answer.create(newAnsPayload, { transaction: t });
        }
      }
      //ahora actualiamos todas las preguntas&respuestas que ya existen, y borramos las respuestas que estan en toDeleteAnswers
      for await (const old_qId of toUpdateQuestionsId) {
        let foundQuestion = await Question.findByPk(old_qId, {
          transaction: t,
        });
        if (!foundQuestion) continue;
        await foundQuestion.update(toUpdateQuestions[old_qId], {
          transaction: t,
        });
        //primero borramos las preguntas
        if (
          Array.isArray(toDeleteAnswers[old_qId]) &&
          toDeleteAnswers[old_qId].length > 0
        ) {
          for await (const del_aId of toDeleteAnswers[old_qId]) {
            //en caso de que el id no sea numerico, sabemos que es una nueva respuesta que nunca llego a la DB,no es necesario borrarla
            if (!Number(del_aId)) continue;
            const foundToDeleteAnswer = await Answer.findByPk(del_aId, {
              transaction: t,
            });
            if (!foundToDeleteAnswer) continue;
            foundToDeleteAnswer.destroy({
              transaction: t,
            });
          }
        }
        //actualizamos las preguntas
        for await (const old_aId of toUpdateAnswersId[old_qId]) {
          //editamos las respuestas existentes de la pregunta
          let foundAns = await Answer.findByPk(old_aId, { transaction: t });
          if (!foundAns) continue;
          await foundAns.update(toUpdateAnswers[old_qId][old_aId], {
            transaction: t,
          });
        }
        //chequeamos si hay nuevas preguintas para crear, en caso contrario continuamo
        if (!newAnswersId[old_qId]) continue;
        for await (const new_aId of newAnswersId[old_qId]) {
          let newAnsPayload = newAnswers[old_qId][new_aId];
          newAnsPayload.QuestionId = foundQuestion.id;
          await Answer.create(newAnsPayload, { transaction: t });
        }
      }
    });
    return res.status(201).send({ message: 'bulkUpdate con exito' });
    //mal codigos si lo hay....feo, poco eficiente, pedorro, e ilegible
  } catch (error) {
    console.error(`Error en /bulkUpdate ------> DB transaction:
    ${error}`);
    return res.status(500).send({ message: 'Ha ocurrido un error!' });
  }
});

module.exports = server;
