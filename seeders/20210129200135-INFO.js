const users = require('../data/users');
const schools = require('../data/schools');
const subjects = require('../data/subjets');
const questions = require('../data/questions');
const answers = require('../data/answers');
const quizzes = require('../data/quizzes');
const reviews = require('../data/reviews');
const quizQtag = require('../data/quizQtag');
const tags = require('../data/tags');
const {
  User,
  Subject,
  School,
  Answer,
  Question,
  Quiz,
  Review,
  QuizTag,
} = require('../models/index');

('use strict');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      //Cargamos Usuarios
      await User.bulkCreate(users, { hooks: true }),
      //Cargamos Organizaciones
      await School.bulkCreate(schools, { hooks: true }),
      //Cargamos Subjects (materias)
      await Subject.bulkCreate(subjects, { hooks: true, include: School })
        .then((sub) => {
          sub.map((instance, i) => {
            School.findByPk(subjects[i].SchoolId).then((schoolFounded) => {
              instance.setSchool(schoolFounded);
            });
          });
        })
        .catch((err) => {
          console.log(err);
        }),
      //Cargamos Quizzes
      await Quiz.bulkCreate(quizzes, {
        hooks: true,
        include: [School, Subject],
      })
        .then((q) => {
          q.map((instance, i) => {
            School.findByPk(quizzes[i].SchoolId).then((schoolF) => {
              instance.setSchool(schoolF);
            }),
              Subject.findByPk(quizzes[i].SubjectId).then((subF) => {
                instance.setSubject(subF);
              });
          });
        })
        .catch((err) => {
          console.log(err);
        }),
      //Cargamos los TAGS
      await QuizTag.bulkCreate(tags, { hooks: true, include: Quiz })
        .then((tag) => {
          tag.map((instance, i) => {
            Quiz.findByPk(tags[i].QuizId) //Plantear como posible array el campo QuizId?
              .then((quizF) => {
                instance.addQuiz(quizF);
              });
          });
        })
        .catch((err) => {
          console.log(err);
        }),
      //Cargamos Preguntas
      await Question.bulkCreate(questions, { hooks: true, include: Quiz })
        .then((q) => {
          q.map((instance, i) => {
            Quiz.findByPk(questions[i].QuizId).then((quizF) => {
              instance.setQuiz(quizF);
            });
          });
        })
        .catch((err) => {
          console.log(err);
        }),
      //Cargamos Respuestas
      await Answer.bulkCreate(answers, { hooks: true, include: Question })
        .then((ans) => {
          ans.map((instance, i) => {
            Question.findByPk(answers[i].QuestionId).then((questionF) => {
              instance.setQuestion(questionF);
            });
          });
        })
        .catch((err) => {
          console.log(err);
        }),
      //Cargamos Reviews
      await Review.bulkCreate(reviews, { hooks: true, include: [Quiz, User] })
        .then((rev) => {
          rev.map((instance, i) => {
            User.findByPk(reviews[i].UserId).then((userF) => {
              instance.setUser(userF);
            }),
              Quiz.findByPk(reviews[i].QuizId).then((quizF) => {
                instance.setQuiz(quizF);
              });
          });
        })
        .catch((err) => {
          console.error('REVIEW: ', err);
        }),
    ];
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.bulkDelete('Users', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
      queryInterface.bulkDelete('Schools', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
      queryInterface.bulkDelete('Subjects', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
      queryInterface.bulkDelete('Questions', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
      queryInterface.bulkDelete('Answers', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
      queryInterface.bulkDelete('Quizzes', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
      queryInterface.bulkDelete('Reviews', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
      queryInterface.bulkDelete('Quiz-QTag', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
    ]);
  },
};
