const users = require('../data/users');
const schools = require('../data/schools');
const subjects = require('../data/subjets');
const questions = require('../data/questions');
const answers = require('../data/answers');
const quizzes = require('../data/quizzes');
const reviews = require('../data/reviews');
const roles = require('../data/role');
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
  Role,
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
      await Subject.bulkCreate(subjects, { hooks: true }),
      //Cargamos Quizzes
      await Quiz.bulkCreate(quizzes, { hooks: true}),
      //Cargamos los TAGS
      await QuizTag.bulkCreate(tags, { hooks: true }),
      //Cargamos Preguntas
      await Question.bulkCreate(questions, { hooks: true }),
      //Cargamos Respuestas
      await Answer.bulkCreate(answers, { hooks: true}),
      //Cargamos Reviews
      await Review.bulkCreate(reviews, { hooks: true}),
      //  Cargamos los ROLES 
      await Role.bulkCreate(roles, { hooks: true })
   

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
      queryInterface.bulkDelete('Roles', null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      }),
    ]);
  },
};
