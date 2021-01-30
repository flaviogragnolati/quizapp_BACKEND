const users = require('../data/users');
const schools = require('../data/schools');
const subjects = require('../data/subjets');
const questions = require('../data/questions');
const answers = require('../data/answers');
const quizzes = require('../data/quizzes');
const reviews = require('../data/reviews');
const quizQtag = require('../data/quizQtag')
const {User, Subject, School, Answer, Question, Quiz, Review } = require("../models/index");

('use strict');

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      // User.bulkCreate(users, { returning: true, validate: true, individualHooks: true }), //En teoría, debería funcionar así
      //Cargamos Usuarios
      queryInterface.bulkInsert('Users', users , { returning: true, validate: true, individualHooks: true }), //Así está bien
      //Cargamos Organizaciones
      queryInterface.bulkInsert('Schools', schools , { returning: true, hooks: true, validate: true }), // Así está bien.
      //Cargamos Subjects (materias)
      Subject.bulkCreate(subjects, { hooks: true, include: School })
      .then(sub => {
         sub.map((instance, i) => {
            School.findByPk(subjects[i].SchoolId)
            .then(schoolFounded => {
              instance.setSchool(schoolFounded) 
            }) 
        })
     
      })   .catch((err) => {
        console.log(err);
      }),
      //Cargamos Quizzes
      // queryInterface.bulkInsert('Quizzes', quizzes , { returning: true, hooks: true, validate: true }), //Falta agregarle la School
      Quiz.bulkCreate(quizzes, { hooks: true, include: School })
      .then(q => {
        q.map((instance, i) => {
          School.findByPk(quizzes[i].SchoolId)
          .then(schoolF => {
            instance.setSchool(schoolF)
          })
        })
      }).catch((err) => {
        console.log(err);
      }),
      //Cargamos Preguntas
      Question.bulkCreate(questions, { hooks: true, include: Quiz })
      .then(q => {
        q.map((instance, i) => {
          Quiz.findByPk(questions[i].QuizId)
          .then(quizF => {
            instance.setQuiz(quizF)
          })
        })
      }).catch((err) => {
        console.log(err);
      }),
     //Cargamos Respuestas
     Answer.bulkCreate(answers, { hooks: true, include: Question })
      .then(ans => {
        ans.map((instance, i) => {
          Question.findByPk(answers[i].QuestionId)
          .then(questionF => {
            instance.setQuestion(questionF)
          })
        })
      }).catch((err) => {
        console.log(err);
      }),
      //Cargamos Reviews
      // queryInterface.bulkInsert('Reviews', reviews , { returning: true, hooks: true, validate: true }),
      Review.bulkCreate(reviews, { hooks: true, include: {Quiz, User} })
      .then(rev => {
        rev.map((instance, i) => {
          User.findByPk(reviews[i].UserId)
          .then(userF => {
            instance.setUser(userF)
          }),
          Quiz.findByPk(reviews[i].QuizId)
          .then(quizF => {
            instance.setQuiz(quizF)
          })
        })
      }).catch((err) => {
        console.log(err);
      }),
      // queryInterface.bulkInsert('Quiz-QTag', quizQtag , { returning: true, hooks: true, validate: true }),
      
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.bulkDelete('Users', null, {}),
      queryInterface.bulkDelete('Schools', null, {}),
      queryInterface.bulkDelete('Subjects', null, {}),
      queryInterface.bulkDelete('Questions', null, {}),
      queryInterface.bulkDelete('Answers', null, {}),
      queryInterface.bulkDelete('Quizzes', null, {}),
      queryInterface.bulkDelete('Reviews', null, {}),
      queryInterface.bulkDelete('Quiz-QTag', null, {}),
    ]);
  },
};
