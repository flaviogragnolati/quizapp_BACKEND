const users = require('../data/users');
const schools = require('../data/schools');
const subjects = require('../data/subjets');
const questions = require('../data/questions');
const answers = require('../data/answers');
const quizzes = require('../data/quizzes');
const reviews = require('../data/reviews');
const quizQtag = require('../data/quizQtag')
const {User, Subject, School, Answer, Question, Quiz } = require("../models/index");

('use strict');

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      // User.bulkCreate(users, { returning: true, validate: true, individualHooks: true }), //En teoría, debería funcionar así
      queryInterface.bulkInsert('Users', users , { returning: true, validate: true, individualHooks: true }), //Así está bien
      queryInterface.bulkInsert('Schools', schools , { returning: true, hooks: true, validate: true }), // Así está bien.
      // queryInterface.bulkInsert('Subjects', subjects , { returning: true, hooks: true, validate: true }), //Hay que agregar el SchoolId
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
     
      queryInterface.bulkInsert('Quizzes', quizzes , { returning: true, hooks: true, validate: true }),
      // queryInterface.bulkInsert('Questions', questions , { returning: true, hooks: true, validate: true }),
      Question.bulkCreate(questions, { hooks: true, include: Quiz })
      .then(q => {
        q.map((instance, i) => {
          Quiz.findByPk(questions[i].QuizId)
          .then(quizF => {
            instance.setQuiz(quizF)
          })
        })
      }),
     
      // queryInterface.bulkInsert('Answers', answers , { returning: true, hooks: true, validate: true }),
      Answer.bulkCreate(answers, { hooks: true, include: Question })
      .then(ans => {
        ans.map((instance, i) => {
          Question.findByPk(answers[i].QuestionId)
          .then(questionF => {
            instance.setQuestion(questionF)
          })
        })
      }),
      queryInterface.bulkInsert('Reviews', reviews , { returning: true, hooks: true, validate: true }),
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
