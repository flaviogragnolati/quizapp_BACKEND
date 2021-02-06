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
const { paginate } = require('../utils/index.js');

const { normalize, schema } = require('normalizr');

server.get('/', async (req, res) => {
    //Agregar el tag dentro del objeto de cada quiz.
  
     let page = 1;
    let pageSize = 6;
    
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
              { model: School, attributes: { exclude: ['createdAt', 'updatedAt', 'password'] } },
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

  module.exports = server;