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

const { normalize, schema } = require('normalizr');

// Borrar una QUIZ by ID - DELETE a /quiz/:id

//  SCHOOL(SUPERADMIN) - TEACHER

server.delete(
  '/:id',
  passport.authenticate('jwt-school', { session: false }),
  checkSuperAdmin, // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
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
  try {
    let data = await Quiz.findAll({
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
    });
    // let data = await Quiz.findByPk(1, {
    //   include: {
    //     model: Subject,
    //     attributes: { exclude: ['createdAt', 'updatedAt'] },
    //   },
    //   raw: true,
    //   nest: true,
    // });
    console.log('DATa', data.slice(0, 5));
    // data.map((d) => {
    //   console.log('ID', d.id);
    //   console.log(d.Reviews);
    // });
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

    // QuizSchema.define({
    //   Subject: SubjectsSchema,
    //   School: SchoolSchema,
    //   // QuizTags: QuizTagSchema,
    // });

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
      // raw: true,
      // nest: true,
    });

    // const quiz = await Quiz.findOne({
    //   where: { id },
    //   raw: true,
    //   nest: true,
    // });

    // const school = await School.findOne({
    //   where: { id: quiz.SchoolId },
    //   raw: true,
    //   nest: true,
    // });

    // const subject = await Subject.findOne({
    //   where: { id: quiz.SubjectId },
    //   raw: true,
    //   nest: true,
    // });

    // const quizTags = await QuizTag.findAll({
    //   where: { QuizId: quiz.id },
    //   raw: true,
    //   nest: true,
    // });

    // console.log(`encontré quizTags ${quizTags}`);

    // const reviews = await Review.findAll({
    //   where: { QuizId: quiz.id },
    //   raw: true,
    //   nest: true,
    // });

    const teachers = await Role.findAll({
      where: {
        QuizId: id,
        name: 'Teacher',
      },
      raw: true,
      nest: true,
    });

    let response = {
      ...data,
      teachers,
    };

    // response.quiz = quiz;

    // response.school = school;

    // response.subject.byId = subject;

    // // response.quizTags.byId = quizTags;
    // // response.quizTags.allIds = quizTags.map((qt) => {
    // //   return qt.id;
    // // });

    // response.reviews.byId = reviews;
    // response.reviews.allIds = reviews.map((r) => {
    //   return r.id;
    // });

    // response.teachers.byId = teachers;
    // response.teachers.allIds = teachers.map((t) => {
    //   return t.id;
    // });

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

// Traer todos los teachers de un QUIZ - GET a /quiz/:QuizId/teachers

server.get('/:QuizId/Teachers', async (req, res) => {
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

// Crear un QUIZ - POST a /quiz

// SCHOOL(SUPERADMIN) - TEACHER

server.post(
  '/',
  //passport.authenticate("jwt-school", { session: false }),
  //checkSuperAdmin,  // Por el momento solo pasa el superAdmin, la escuela NO (comentar si es necesario)
  async (req, res) => {
    let { name, description, SubjectId, SchoolId, teachers } = req.body;

    try {
      const newQuiz = await Quiz.create({
        quantity,
        name,
        description,
        SubjectId,
        SchoolId,
      });

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

    return res.status(200).send('El QUIZ ha sido activado');
  } catch (error) {
    console.error(error);
    return res.status(500).send('CATCH activate quiz');
  }
});

module.exports = server;
