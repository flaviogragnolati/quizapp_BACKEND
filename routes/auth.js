const server = require("express").Router();
const { User, Session } = require("../models/index");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { SECRET_KEY, FRONT_URL } = process.env;


// Ruta PROFILE - GET a /auth/me

server.get("/me", async (req, res, next) => {
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

// Inicio de sesión con FACEBOOK

server.get("/facebook", passport.authenticate("facebook"));

server.get(
  "/facebook/callback",
  passport.authenticate("facebook"),
  async (req, res) => {
    try {
      console.log("entre a facebook", req);
      const { id, firstName, lastName, email, birthdate, cellphone } = req.user;
      jwt.sign(
        {
          id,
          firstName,
          lastName,
          email,
          birthdate,
          cellphone,
        },
        SECRET_KEY
      );
      return res.redirect(FRONT_URL);
    } catch (error) {
      console.error(`CATCH FACEBOOK`, error);
    }
  }
);

// Inicio de sesión con GOOGLE

server.get(
  "/google",

  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  }),
  (req, res) => {}
);

server.get(
  "/google/callback",
  passport.authenticate("google"),
  async (req, res) => {
    try {
      const { id, firstName, lastName, email, birthdate, cellphone } = req.user;

      jwt.sign(
        {
          id,
          firstName,
          lastName,
          email,
          birthdate,
          cellphone,
        },
        SECRET_KEY
      );
      return res.redirect(FRONT_URL);
    } catch (error) {
      console.error(`CATCH GOOGLE`, error);
    }
  }
);

//*ruta para probar la validacion con el JWT
server.get(
  "/test",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("INGRESO A RUTA PROTEGIDA", req.body);
    return res.send("prueba de ruta protegia");
    // return res.send(req.user);
  }
);

// Ruta para DESLOGUEARSE - GET a /auth/logout

server.get("/logout", async (req, res) => {
  //let { id } = req.user ?
  const sessionOff = await Session.findOne({
    where: { userId: id }
  });
  await sessionOff.destroy();

  res.status(200).send("Se ha cerrado la sesión");
});

// Ruta para Registrarse / crear un usuario - POST a /auth/register

server.post(
  "/register",
  passport.authenticate("register-local", { session: false }),
  async (req, res) => {
    try {
      const {
        id,
        firstName,
        lastName,
        email,
        birthdate,
        cellphone,
        password,
      } = req.user;

      return res.send(
        jwt.sign(
          {
            id,
            firstName,
            lastName,
            email,
            birthdate,
            cellphone,
            password,
          },
          SECRET_KEY
        )
      );
    } catch (error) {
      console.error(`CATCH REGISTER`, error);
      return error;
    }
  }
);

//Ruta para Loguearse - POST a /auth/login

server.post(
  "/login",
  passport.authenticate("local-login", {
    failWithError: false,
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      return res.send({
        message: "Login exitoso",
        //token,
        user,
      });
    } catch (error) {
      console.error(`CATCH LOGIN`, error);
    }
  }
);

// Ruta para promover a un USER - PUT a /auth/promote/:id
/*
FALTA RELACIONARLO CON EL QUIZ

server.put("/promote/:id", async (req, res) => {
  let { id } = req.params;
  let { role } = req.body;

  if (!id)
    return res.status(400).send("Es necesario indicar el usuario a promover");

  const userToEdit = User.findByPk(id);

  const newRole = Role.findOne({
    where: { name: role },
  });

  const userEdited = await userToEdit.update(
    {
      idRole: newRole.id,
    }
  );

  res.status(200).json(userEdited);
});*/

// Rutas para RESETEAR la contraseña

// Primero se crea un token provisorio con caducidad de 5 minutos y se envía a través de un email
server.put("/resetpassword/:id", async (req, res) => {
  let { id } = req.params;

  if(!id) return res.status(400).send('No se recibió ID del usuario que desea restaurar su contraseña');

  try {
    const randomToken = () => {
      return Math.random().toString(36).substr(2);
    };
    const token = () => {
      return randomToken() + randomToken(); // Para hacer el token más largo
    };

    const expiresTime = () => {
      var date = new Date();
      var minutes = date.getMinutes();
      date.setMinutes(minutes + 5);
      return date;
  }
    
    const userUpdated = await User.update(
      {
        resetPasswordToken: token(),
        resetPasswordExpires: expiresTime(),
      },
      { where: { id } }
      );

    return res.status(200).send(userUpdated);
  } catch(error) {
    console.error('CATCH PUT RESET PASSWORD', error)
  }
});

// Cuando el user ingresa al link se hace un GET a /auth/resetpassword/?token=
server.get('/resetpassword', async (req, res) => {
  let { token } = req.query;
  
  try {
    const user = await User.findOne({
      where: { resetPasswordToken: token }
    });
    // Si el momento en el que intenta ingresar al link es mayor al de expiración del token se redirecciona a página que indica invalidez del mismo, sino se mostrará el formulario de cambio de contraseña.
    const now = new Date();
/*     now > user.resetPasswordExpires ? res.redirect(FRONT_URL + 'invalidresetpasswordtoken/') : res.redirect(FRONT_URL + 'resetpassword/'); */
  now > user.resetPasswordExpires ? res.send('token inválido') : res.send('Ahora puede cambiar su contraseña'); // Para prueba, cuando el front tenga la ruta hay que redireccionarlo ahí (como está arriba)
  } catch(error) {
    console.error('CATCH GET RESET PASSWORD', error)
  }
});

// Actualizar la contraseña

server.put("/pass/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;

  if (!id) return res.status(400).send("El usuario no existe");

  User.findByPk(id)
    .then(User.update({ password }, { where: { id } }))
    .then(() => {
      return res
        .status(200)
        .send("Se ha modificado la contraseña correctamente");
    });
});

module.exports = server;
