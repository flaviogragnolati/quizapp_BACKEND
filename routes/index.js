const { Router } = require('express');

// Importamos los routers
const usersRouter = require('./users.js');
const authRouter = require('./auth.js');
const orgRouter = require('./organizations.js');
const questionsRouter = require('./questions.js');
const answersRouter = require('./answers.js');
const quizRouter = require('./quiz.js');
const mailRouter = require('./mails.js');
const subjectRouter = require('./subject.js');
const rolesRouter = require('./roles.js');
const teachersRouter = require('./teacher.js');

const router = Router();

//Rutas
router.get('/', function (req, res) { res.send('Bienvenido a ApiQuizzes'); });
router.use('/users', usersRouter);
router.use('/auth', authRouter);
router.use('/org', orgRouter);
router.use('/questions', questionsRouter);
router.use('/answers', answersRouter);
router.use('/quiz', quizRouter);
router.use('/mails', mailRouter);
router.use('/subject', subjectRouter);
router.use('/roles', rolesRouter);
router.use('/teachers', teachersRouter);

module.exports = router;