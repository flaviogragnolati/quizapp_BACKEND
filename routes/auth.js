const server = require('express').Router();
const { User } = require('../models/index');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { makeJWT, cookieMaker, refreshTime } = require('../utils/index');

//import { FRONT_URL } from './config/environments/index'

// Ruta ME
server.get('/me', async (req, res, next) => {
  try {
    if (req.user) {
      const { id } = req.user;
      const result = await User.findOne(id);
      res.json(result);
    } else res.sendStatus(401);
  } catch (error) {
    next(error);
  }
});

// Ruta para desloguearse (Habría que probarla a ver si anda)

server.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('refreshToken');
  res.status(200).send('Cerrar sesión');
});


//Ruta para Registrarse
server.post('/register', 
  passport.authenticate('register-local', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      
      /*const token = makeJWT(req.user, refreshTime, 'Bearer');
      const refresh_token = makeJWT(req.user);
      cookieMaker('refreshToken', refresh_token, res);*/
      return res.send({
        message: 'Registro exitoso',
        //token,
        user,
      });
    } catch (error) {
      console.error(`CATCH REGISTER`, error);
    }
  }
);

//Ruta para Loguearse
server.post('/login', 
  passport.authenticate('local-login', {
    failWithError: false,
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;
      /*const token = makeJWT(req.user, refreshTime, 'Bearer'); // guardar los tiempos de refresh en variable y aplicarselo a ambas
      const refresh_token = makeJWT(req.user);
      cookieMaker('refreshToken', refresh_token, res);*/
      return res.send({
        message: 'Login exitoso',
        //token,
        user,
      });
    } catch (error) {
      console.error(`CATCH LOGIN`, error);
    }
  }
);

server.get('/refresh', 
  passport.authenticate('jwt-refresh', { session: false }),
  async (req, res) => {
    const user = req.user;
    /*const newToken = makeJWT(req.user, refreshTime, 'Bearer');
    const refresh_token = makeJWT(req.user);
    cookieMaker('refreshToken', refresh_token, res);*/
    return res.send({
      message: 'Refresh exitoso',
      //newToken,
      user,
    });
  }
);

//*ruta para probar la validacion con el JWT
server.get('/test', 
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    console.log('INGRESO A RUTA PROTEGIDA', req.body);
    return res.send('prueba de ruta protegia');
    // return res.send(req.user);
  }
);

// // Hacer admin a un user (promote User)

// server.put('/:id', 
// (req, res) => {
//   let { id } = req.params;
//   if (!id) return res.status(400).send('El usuario no existe');

//   User.findByPk(id)
//     .then(User.update({ isAdmin: true }, { where: { id } }))
//     .then(() => {
//       return res.status(200).send('Se ha ascendido el usuario a Admin');
//     });
// });

//Reiniciar la contraseña (Modificarla para usarla desde un admin)

server.put('/pass/:id', 
 (req, res) => {
  let { id } = req.params;
  let { password } = req.body;

  if (!id) return res.status(400).send('El usuario no existe');

  User.findByPk(id)
    .then(User.update({ password }, { where: { id } }))
    .then(() => {
      return res
        .status(200)
        .send('Se ha modificado la contraseña correctamente');
    });
});

server.get('/github', 
  passport.authenticate('github', { scope: ['user:email'] }),
  (req, res) => {}
);

server.get('/github/callback', 
   passport.authenticate('github'),
  async (req, res) => {
    try {
      /*const token = makeJWT(req.user, refreshTime, 'Bearer'); // guardar los tiempos de refresh en variable y aplicarselo a ambas
      const refresh_token = makeJWT(req.user);
      cookieMaker('refreshToken', refresh_token, res);*/
      return res.redirect('https://web-comm.vercel.app/catalogue');
    } catch (error) {
      console.error(`CATCH GIT`, error);
    }
  }
);

server.get('/google', 
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  }),
  (req, res) => {}
);

server.get('/google/callback', 
  passport.authenticate('google'),
  async (req, res) => {
    try {
      /*const token = makeJWT(req.user, refreshTime, 'Bearer'); // guardar los tiempos de refresh en variable y aplicarselo a ambas
      const refresh_token = makeJWT(req.user);
      cookieMaker('refreshToken', refresh_token, res);*/
      return res.redirect(FRONT_URL);
    } catch (error) {
      console.error(`CATCH GOOGLE`, error);
    }
  }
);

module.exports = server;
