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
const quiz = require('../models/quiz');
const { checkSuperAdmin } = require('../utils/authTools.js');
const { paginate } = require('../utils/index.js');

const { normalize, schema } = require('normalizr');

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
  let { page, pageSize  } = req.query;
  
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
            { model: School, attributes: { exclude: ['createdAt', 'updatedAt'] } },
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
    console.log(data[0]);
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

// Traer todos los teachers de un QUIZ - GET a /quiz/:QuizId/teachers

server.get('/:QuizId/teachers', async (req, res) => {
  let { QuizId } = req.params;

  if (!QuizId) return res.status(400).send('Debe ingresar el ID del quiz');

  try {
    const teachers = [];
    const teachersQuiz = await Role.findAll({
      where: {
        QuizId,
        name: 'Teacher',
      },
    });

    teachersQuiz.forEach((teacher) => {
      teachers.push(teacher.UserId);
    });

    return res.status(200).send(teachers);
  } catch (error) {
    console.error('CATCH TEACHERS QUIZ', error);
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
        logo
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


module.exports = server;
