const server = require('express').Router();
const { School } = require('../models/Index');


server.get('/',
    (req, res, next) => {
        School.findAll()
            .then((school) => {
                return res.status(200).send(school);
            })
            .catch(next);
    }
);


server.post('/',
(req, res, next) => {
    let { name, email, description, city, country, logo } = req.body;
    School.create({
                name,
                description,
                email,
                city,
                country,
                logo,
               }) .then((school) => {
                        const [instance, wasCreated] = school;
                        if (!wasCreated) {
                            return res.status(200).send("La organización ya está registrada");
                          } else {
                              return res.status(200).send('La organización ha sido creada');
                          }
                      })    .catch((err) => {
                                return console.log(err);
                              });

})


module.exports = server;