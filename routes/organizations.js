const server = require("express").Router();
const { School } = require("../models/index");

// RUTA para BORRAR School - delete a /org/:id

server.delete(
    '/:id',
    // passport.authenticate('jwt', { session: false }),
    // checkAdmin,
    async (req, res) => {
      let { id } = req.params;

      if (!id) return res.status(400).send('No se recibió ID');

      const schoolToDestroy = await School.findByPk(id);

      if (!schoolToDestroy)
        return res.status(400).send('No existe la school a eliminar');

      const school = { ...schoolToDestroy.dataValues };
      const payload = {
        id: school.id,
        name: school.name,
      };
      await schoolToDestroy.destroy();
      return res.status(200).send(payload);
    }
  );

  // RUTA para LISTAR TODAS las School - get a /org

server.get("/", (req, res, next) => {
  School.findAll()
    .then((school) => {
      return res.status(200).send(school);
    })
    .catch(next);
});

// RUTA para AGREGAR/CREAR School - post a /org

server.post("/", (req, res, next) => {
  let { name, email, description, city, country, logo, code } = req.body;
  School.findOrCreate({
    where: {
      email,
    },
    defaults: {
        name,
        description,
        email,
        city,
        country,
        logo,
        address,
        password: code,
    },
  })
    .then((school) => {
      const [instance, wasCreated] = school;
      if (!wasCreated) {
        return res.status(200).send("La organización ya está registrada");
      } else {
        return res.status(200).send("La organización ha sido creada");
      }
    })
    .catch((err) => {
      return console.log(err);
    });
});

// RUTA para EDITAR School - PUT a /org/:id

server.put('/:id', async (req, res) => {
  let { id } = req.params;
  let { name, email, description, city, country, logo } = req.body;

  if(!id) return res.status(400).send('Es necesario indicar la escuela a actualizar/modificar')

  const schoolToEdit = await School.findByPk(id);

  const schoolEdited = await schoolToEdit.update({
    name, email, description, city, country, logo
  });

  return res.status(200).send(schoolEdited);
});

module.exports = server;
