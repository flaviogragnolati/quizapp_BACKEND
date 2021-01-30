const users = require('../data/users');
const schools = require('../data/schools');
const subjects = require('../data/subjets');
const questions = require('../data/questions');
const answers = require('../data/answers');
const quizzes = require('../data/quizzes');
const reviews = require('../data/reviews');
const User = require("../models/index");

('use strict');

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      // User.bulkCreate(users, { returning: true, validate: true, individualHooks: true }), //En teoría, debería funcionar así
      queryInterface.bulkInsert('Users', users , { returning: true, validate: true, individualHooks: true }),
      queryInterface.bulkInsert('Schools', schools , { returning: true, hooks: true, validate: true }),
      queryInterface.bulkInsert('Subjects', subjects , { returning: true, hooks: true, validate: true }),
      queryInterface.bulkInsert('Questions', questions , { returning: true, hooks: true, validate: true }),
      queryInterface.bulkInsert('Answers', answers , { returning: true, hooks: true, validate: true }),
      queryInterface.bulkInsert('Quizzes', quizzes , { returning: true, hooks: true, validate: true }),
      queryInterface.bulkInsert('Reviews', reviews , { returning: true, hooks: true, validate: true }),
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
    ]);
  },
};
