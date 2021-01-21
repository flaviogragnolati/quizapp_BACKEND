const { Router } = require('express');

// Importamos los routers
const usersRouter = require('./users.js');
const authRouter = require('./auth.js');
const orgRouter = require('./organizations.js');

const router = Router();

//Rutas
router.use('/users', usersRouter);
router.use('/auth', authRouter);
router.use('/org', orgRouter);

module.exports = router;
