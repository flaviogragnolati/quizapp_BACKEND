const { Router } = require('express');

// Importamos los routers
const usersRouter = require('./users.js');
const authRouter = require('./auth.js');

const router = Router();

//Rutas
router.use('/users', usersRouter);
router.use('/auth', authRouter);


module.exports = router;
