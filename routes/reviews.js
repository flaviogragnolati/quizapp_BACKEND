const server = require("express").Router();
const { Review, Quiz, User } = require('../models/index');

//Crea una Review para un Quiz.

server.post('/:quizId', (req, res) => {
    let { quizId } = req.params;
    let { puntaje, description, userId } = req.body;
  
    if (!quizId || !puntaje || !userId)
      return res.status(400).send('No se puede agregar la Review');
    User.findByPk(userId).then(() => {
      Review.create({
        puntaje,
        description,
      }).then((rev) => {
        Quiz.findByPk(quizId).then((q) => {
          q.addReview(rev);
          rev.setUser(userId);
          return res.send({msg: 'Se agregó la Review', res: rev});
        });
      });
    });
  });

  //Editar una Review

server.put('/:id', (req, res) => {
    let { puntaje, description } = req.body;
    let { id } = req.params;
  
    if (!id) return res.status(400).send('La Review no se encuentra');
    Review.update({ puntaje, description }, { where: { id } }).then(() => {
      return res.status(200).send('Se ha modificado la review');
    });
  });


//Borrar una Review

server.delete('/:id', (req, res) => {
    let { id } = req.params;
    if (!id) return res.status(400).send('No existe la Review');
  
    const revToDestroy = await Review.findByPk(id);

    Review.destroy({
      where: {
        id,
      },
    }).then(() => {
      return res.status(200).send({msg: "Review borrada", res: revToDestroy});
    });
  });


  //Ver todas las Reviews de un Producto

server.get('/:quizId', (req, res, next) => {
    let { quizId } = req.params;
    if (!quizId)
      return res.status(404).send('No existen reviews para ese Quiz');
  
    Review.findAll({
      where: {
        productId,
      }
     })
      .then((revs) => {
        res.json(
          revs.map((r) => {
            return {
              id: r.id,
              puntaje: r.puntaje,
              description: r.description,
              quizId,
              createdAt: r.createdAt,
           };
          })
        );
      })
      .catch((error) => {
        console.error(error);
        return res.status(304).send(error);
      });
  });

  //Ver todas las Reviews de un Usuario

server.get('/user/:userId', (req, res, next) => {
    let { userId } = req.params;
    if (!userId) return res.status(404).send('No existen reviews de ese usuario');
  
    Review.findAll({
      where: {
        userId,
      },
     })
      .then((revs) => {
        res.json(
          revs.map((r) => {
            return {
              id: r.id,
              puntaje: r.puntaje,
              description: r.description,
              quizId: r.quizId,
            };
          })
        );
      })
      .catch((error) => {
        console.error(error);
        return res.status(304).send(error);
      });
  });

module.exports = server;