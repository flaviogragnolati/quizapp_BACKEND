const { session } = require('passport');
const passport = require('passport');
const { School, Role } = require('../models/index');

const checkSuperAdmin = async (req, res, next) => {
  const { isSuperAdmin } = req.school;

  if (isSuperAdmin) {
    return next();
  } else {
    return res.status(401).send({ message: 'No posee el nivel de acceso' });
  }
};

// Para terminar en la semana 3

const isStudent = async (req, res, next) => {
  const { id } = req.user;

  if (role !== 'student') {
    return next();
  } else {
    return res.status(401).send({ message: 'No posee el nivel de acceso' });
  }
};

module.exports = {
  checkSuperAdmin,
  isStudent,
};
