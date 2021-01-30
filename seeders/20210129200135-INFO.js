const users = require('../data/users');
const schools = require('../data/schools');
const subjects = require('../data/subjets');
const questions = require('../data/questions');
const answers = require('../data/answers');
const quizzes = require('../data/quizzes');
const reviews = require('../data/reviews');
const quizQtag = require('../data/quizQtag')
const {User, Subject, School } = require("../models/index");

('use strict');

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      // User.bulkCreate(users, { returning: true, validate: true, individualHooks: true }), //En teoría, debería funcionar así
      queryInterface.bulkInsert('Users', users , { returning: true, validate: true, individualHooks: true }), //Así está bien
      queryInterface.bulkInsert('Schools', schools , { returning: true, hooks: true, validate: true }), // Así está bien.
      queryInterface.bulkInsert('Subjects', subjects , { returning: true, hooks: true, validate: true }), //Hay que agregar el SchoolId
      // Subject.bulkCreate(subjects, { hooks: true, include: School })
      // .then(sub => {
      //   // console.log("que es sub", sub)
      //   sub.map((x) => {
      //     x.setSchool(schools[1]) //setSchool o como sea
      //     // console.log("que tengo acá?", x, schools[1])
      //   })
      // }),
     
      queryInterface.bulkInsert('Questions', questions , { returning: true, hooks: true, validate: true }),
      queryInterface.bulkInsert('Answers', answers , { returning: true, hooks: true, validate: true }),
      queryInterface.bulkInsert('Quizzes', quizzes , { returning: true, hooks: true, validate: true }),
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
