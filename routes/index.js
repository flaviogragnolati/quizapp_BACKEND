const { Router } = require('express');

// Importamos los routers
const usersRouter = require('./users.js');
const authRouter = require('./auth.js');
<<<<<<< HEAD
const organizationRouter = require('./organizations.js');
=======
const orgRouter = require('./organizations.js');
>>>>>>> b120081bd413bfa04bd0e5c37dbabba0d95e00e4

const router = Router();

//Rutas
router.use('/users', usersRouter);
router.use('/auth', authRouter);
<<<<<<< HEAD
router.use('/org', organizationRouter);
=======
router.use('/org', orgRouter);
>>>>>>> b120081bd413bfa04bd0e5c37dbabba0d95e00e4

module.exports = router;
