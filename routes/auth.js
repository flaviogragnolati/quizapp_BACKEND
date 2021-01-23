const server = require("express").Router();
const { User } = require("../models/index");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { SECRET_KEY, FRONT_URL } = process.env;
//const { makeJWT, cookieMaker, refreshTime } = require('../utils/index');

// Ruta ME - GET a /auth/me

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

server.get("/facebook", passport.authenticate('facebook'));

server.get('/facebook/callback',
	passport.authenticate('facebook'),
	async (req, res) => {
    try {
      console.log('entre a facebook', req)
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
      )
      return res.redirect(FRONT_URL);
    } catch(error) {
      console.error(`CATCH FACEBOOK`, error);
    }
	});

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
      /*const token = makeJWT(req.user, refreshTime, 'Bearer'); // guardar los tiempos de refresh en variable y aplicarselo a ambas
      const refresh_token = makeJWT(req.user);
      cookieMaker('refreshToken', refresh_token, res);*/
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

server.get(
  "/refresh",
  passport.authenticate("jwt-refresh", { session: false }),
  async (req, res) => {
    const user = req.user;
    /*const newToken = makeJWT(req.user, refreshTime, 'Bearer');
    const refresh_token = makeJWT(req.user);
    cookieMaker('refreshToken', refresh_token, res);*/
    return res.send({
      message: "Refresh exitoso",
      //newToken,
      user,
    });
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

server.get("/logout", (req, res) => {
  req.logout();
  res.clearCookie("refreshToken");
  res.status(200).send("Cerrar sesión");
});

// Ruta para Registrarse / crear un usuario - POST a /auth/register

server.post(
  "/register",
  passport.authenticate("register-local", { session: false }),
  async (req, res) => {
    try {
      //const user = req.user;
      const {
        id,
        firstName,
        lastName,
        email,
        birthdate,
        cellphone,
        password,
      } = req.user;
      /*const token = makeJWT(req.user, refreshTime, 'Bearer');
      const refresh_token = makeJWT(req.user);
      cookieMaker('refreshToken', refresh_token, res);*/
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
      /*const token = makeJWT(req.user, refreshTime, 'Bearer'); // guardar los tiempos de refresh en variable y aplicarselo a ambas
      const refresh_token = makeJWT(req.user);
      cookieMaker('refreshToken', refresh_token, res);*/
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

// Ruta para resetear la contraseña

server.put("/resetPass/:id", (req, res) => {
  let { id } = req.params;

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(value, salt);

  const token = bcrypt.randomBytes(20).toString("hex");

  User.update(
    {
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 360000,
    },
    { where: { id } }
  );
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
