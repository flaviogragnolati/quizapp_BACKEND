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
  Quiz_QTag,
} = require('../models/index');

('use strict');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      //Cargamos Usuarios
      // await queryInterface.bulkInsert('Users', users, { hooks: true }),
      await User.bulkCreate(users, { hooks: true }),
      //Cargamos Organizaciones
      await School.bulkCreate(schools, { hooks: true }),
      // await queryInterface.bulkInsert('Schools', schools, { hooks: true }),
      //Cargamos Subjects (materias)
      await queryInterface.bulkInsert('Subjects', subjects, { hooks: true }),
      //Cargamos Quizzes
      await queryInterface.bulkInsert('Quizzes', quizzes, { hooks: true }),
      //Cargamos los TAGS
      await queryInterface.bulkInsert('QuizTags', tags, { hooks: true }),
      //Cargamos Preguntas
      await queryInterface.bulkInsert('Questions', questions, { hooks: true }),
      //Cargamos Respuestas
      await queryInterface.bulkInsert('Answers', answers, { hooks: true }),
      //Cargamos Reviews
      await queryInterface.bulkInsert('Reviews', reviews, { hooks: true }),
      // Cargamos los ROLES
      await queryInterface.bulkInsert('Roles', roles, { hooks: true }),
      //Cargamos la tabla intermadia de Quiz-Tags
      await queryInterface.bulkInsert('Quiz_QTag', quizQtag, { hooks: true }),
      /**
       * !en las migraciones/seeds es preferible no hacer referencia al modelo directamente
       * !queremos utilizar la `queryInerface` que nos provee de los metodos adecuados y preparados
       * !para ejecutar la migration/seed
       * !es un metodo mas robusto y nos puede evitar algunos dolores de cabeza...
       */
    ]);
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
      queryInterface.bulkDelete('Quiz_QTag', null, {
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
