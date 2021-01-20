const server = require('express').Router();
const { User } = require('../BACKEND/db.js');
const { checkAdmin } = require('../utils/authTools.js');
const passport = require('passport');


//Las protecciones en las rutas las dejo comentadas

//Borrar un USER by ID

server.delete('/:id',
    // passport.authenticate('jwt', { session: false }),
    // checkAdmin,
    async (req, res) => {
        let { id } = req.params;
        if (!id) return res.status(400).send('No se recibio ID');
        const userToDestroy = await User.findByPk(id);
        if (!userToDestroy)
            return res.status(400).send('No existe el usuario a eliminar');
        const user = { ...userToDestroy.dataValues };
        const payload = {
            id: user.id,
            name: user.firstName + ' ' + user.lastName,
        };
        await userToDestroy.destroy();
        return res.status(200).send(payload);
    }
);


// Listar todos los USERS

server.get('/',
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

//Editar un USER by ID

server.put('/:id',
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
            isAdmin,
            password,
        } = req.body;

        if (!id) return res.status(400).send('El usuario no existe');

        const userToEdit = await User.findByPk(id);

        const userEdited = await userToEdit.update(
            { firstName, lastName, email, birthdate, cellphone, isAdmin, password },
            { where: { id } }
        );

        return res.status(200).json(userEdited);
    });


module.exports = server;
