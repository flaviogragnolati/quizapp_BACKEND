const { Router } = require('express');

// Importamos los routers
const usersRouter = require('./users.js');
const authRouter = require('./auth.js');
const orgRouter = require('./organizations.js');
const questionsRouter = require('./questions.js');
const answersRouter = require('./answers.js');
const quizRouter = require('./quiz.js');
const mailRouter = require('./mails.js');

const router = Router();

//Rutas
router.use('/users', usersRouter);
router.use('/auth', authRouter);
router.use('/org', orgRouter);
router.use('/questions', questionsRouter);
router.use('/answers', answersRouter);
router.use('/quiz', quizRouter);
router.use('/mails', mailRouter);

module.exports = router;