const server = require("express").Router();
const { User } = require("../models/index");
const { checkAdmin } = require("../utils/authTools.js");
const passport = require("passport");

//Las protecciones en las rutas las dejo comentadas

// Borrar un USER by ID - DELETE a /users/:id
server.delete(
  "/:id",
  // passport.authenticate('jwt', { session: false }),
  // checkAdmin,
  async (req, res) => {
    let { id } = req.params;
    if (!id) return res.status(400).send("No se recibio ID");
    const userToDestroy = await User.findByPk(id);
    if (!userToDestroy)
      return res.status(400).send("No existe el usuario a eliminar");
    const user = { ...userToDestroy.dataValues };
    const payload = {
      id: user.id,
      name: user.firstName + " " + user.lastName,
    };
    await userToDestroy.destroy();
    return res.status(200).send(payload);
  }
);

// Listar todos los USERS - GET a /users
server.get(
  "/",
  // passport.authenticate('jwt', { session: false }),
  // checkAdmin,
  (req, res, next) => {
    User.findAll()
      .then((user) => {
        return res.status(200).send(user);
      })
      .catch(next);
  }
);

// Devuelve USER por email - GET a /users/email

server.get('/email', async (req, res) => {
  let { email } = req.body;

  if(!email) return res.status(400).send('¿Cuál es el email a buscar?');

  try {
    const userByEmail = await User.findOne({
      where: { email }
    });
  
    return res.status(200).send(userByEmail);
  } catch(error) {
    console.error(error);
    return res.send(500).send('CATCH /users/email');
  }
});

// Editar un USER by ID - PUT a /users/:id

server.put(
  "/:id",
  // passport.authenticate('jwt', { session: false }),
  // checkAdmin,
  async (req, res) => {
    let { id } = req.params;
    let {
      firstName,
      lastName,
      email,
      birthdate,
      cellphone,
      password,
    } = req.body;

    if (!id) return res.status(400).send("El usuario no existe");

    const userToEdit = await User.findByPk(id);

    const userEdited = await userToEdit.update(
      { firstName, lastName, email, birthdate, cellphone, password },
      { where: { id } }
    );

    return res.status(200).json(userEdited);
  }
);

module.exports = server;