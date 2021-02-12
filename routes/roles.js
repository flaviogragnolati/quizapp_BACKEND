const server = require('express').Router();
const { Role, User, Quiz } = require('../models/index');
const sendMail = require('./mails');

//Promover inscripto a STUDENT - POST a : roles/student

server.post('/student', async (req, res) => {
  let { UserId, QuizId, accepted } = req.body;

  if (!UserId || !QuizId)
    return res
      .status(400)
      .send(
        'Se necesita indicar el Id del usuario del Quiz para modificar un rol'
      );

  try {
    if (accepted) {
      const userAccepted = await Role.update(
        { name: 'Student' },
        { returning: true, where: { QuizId, UserId } }
      );

      const userPromoted = await User.findByPk(UserId, {
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'deletedAt',
            'createdBy',
            'password',
            'resetPasswordExpires',
            'resetPasswordToken',
          ],
        },
      });

      const quizAccepted = await Quiz.findByPk(QuizId);

      let payload = {
        user: {
          firstName: userPromoted.firstName,
          email: userPromoted.email,
        },
        quiz: {
          id: quizAccepted.id,
          name: quizAccepted.name,
          logo: quizAccepted.logo,
          description: quizAccepted.description,
        },
        type: 'accepted',
      };

      // sendMail(payload);
      return res
        .status(200)
        .send({ user: userPromoted, role: userAccepted[1][0] });
    } else {
      const userRejected = await Role.destroy({
        where: { name: 'Enrolled', QuizId, UserId },
      });

      const userNotPromoted = await User.findByPk(UserId, {
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'deletedAt',
            'createdBy',
            'password',
            'resetPasswordExpires',
            'resetPasswordToken',
          ],
        },
      });

      const quizRejected = await Quiz.findByPk(QuizId);

      let payload = {
        user: {
          firstName: userNotPromoted.firstName,
          email: userNotPromoted.email,
        },
        quiz: {
          id: quizRejected.id,
          name: quizRejected.name,
          logo: quizRejected.logo,
          description: quizRejected.description,
        },
        type: 'rejected',
      };
      // sendMail(payload);

      return res.status(200).send({
        user: userNotPromoted,
        role: 'El usuario no fue aceptado en el quiz.',
      });
    }
  } catch (error) {
    return res.status(500).send('No se ha asignado STUDENT al quiz');
  }
});

//Promover inscripto a STUDENT - GET a : roles/student/
server.post('/student/', async (req, res, next) => {
  let { UserId, QuizId } = req.body;
  if (!UserId || !QuizId)
    return res
      .status(400)
      .send(
        'Se necesita indicar el Id del usuario del Quiz para modificar un rol'
      );
  try {
    //console.log(teacherId, quizzId);
    const userEdited = await Role.update(
      { name: 'Student' },
      { where: { QuizId, UserId } }
    );

    const userPromoted = await User.findByPk(UserId);
    // console.log("user promoted", userPromoted)
    const quizAccepted = await Quiz.findByPk(QuizId);
    // console.log("quiz promoted", quizAccepted)

    let payload = {
      user: {
        firstName: userPromoted.firstName,
        email: userPromoted.email,
      },
      quiz: {
        name: quizAccepted.name,
        logo: quizAccepted.logo,
        description: quizAccepted.description,
      },
      type: 'promote', //cambiar acá!!! Armar nueva plantilla
    };
    sendMail(payload);
    return res.status(200).send(userPromoted);
  } catch (error) {
    return res.status(400).send('No se ha asignado teacher al quiz');
  }
});

// Inscribirse a un Quiz - POST a /roles/enroll

server.post('/enroll', async (req, res) => {
  let { UserId, QuizId } = req.body;
  if (!UserId || !QuizId)
    return res
      .status(400)
      .send(
        'Se necesita indicar el usuario y del quiz para realizar la inscripción'
      );
  try {
    //Busca el Role del usuario en el Quizz
    const userToEnroll = await Role.findOne({
      where: {
        UserId,
        QuizId,
      },
    });

    if (userToEnroll && userToEnroll.name !== 'Fan')
      return res.status(200).send(userToEnroll);
    //Si ya tiene un Role, chequea que sea Fan. Si es Fan, lo modifica a Enrolled (para no degradar un Student a Enrolled)
    if (userToEnroll !== null) {
      const userEnrolled = await Role.update(
        {
          name: 'Enrolled',
        },
        {
          where: {
            UserId,
            QuizId,
            name: 'Fan',
          },
          returning: true,
        }
      );
      return res.status(200).send(userEnrolled[1][0]);
    }

    if (userToEnroll === null) {
      const userEnrolled = await Role.create({
        UserId,
        QuizId,
        name: 'Enrolled',
      });
      return res.status(200).send(userEnrolled);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al editar el rol');
  }
});

// Agregar un Quiz a favoritos - POST a /roles/fan

server.post('/fan', async (req, res) => {
  let { UserId, QuizId } = req.body;
  if (!UserId || !QuizId)
    return res
      .status(400)
      .send(
        'Se necesita indicar el usuario y del quiz para agregar a favoritos'
      );
  try {
    const roleToFind = await Role.findOne({
      where: {
        UserId,
        QuizId,
      },
    });
    if (roleToFind) return res.status(200).send(roleToFind);

    const userToFav = await Role.create({
      UserId,
      QuizId,
      name: 'Fan',
    });

    return res.status(201).send(userToFav);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al editar el rol');
  }
});

// Borrar un Quiz de favoritos o de enrolled - DELETE a /roles/

server.delete('/', async (req, res) => {
  let { UserId, QuizId } = req.body;
  if (!UserId || !QuizId)
    return res
      .status(400)
      .send(
        'Se necesita indicar el usuario y del quiz para quitar de favoritos o retirar la inscripción'
      );
  try {
    const userToUnroll = await Role.findOne({
      where: {
        UserId,
        QuizId,
      },
    });
    await Role.destroy({
      where: {
        UserId,
        QuizId,
      },
    }).then(() => {
      return res.status(200).send(userToUnroll);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al borrar el rol');
  }
});

/* server.get("/enrolled/:id", async(req, res) => {
    let { id } = req.params;
    if (!id) return res.status(400).send("El id indicado no existe")
    let pivot = [];
    let listadoUsers = [];
    try {
        const enrolledUsers = await Role.findAll({ where: { QuizId: id, name: "Enrolled"}});
          enrolledUsers.map((r) => {
          pivot.push(r.dataValues.UserId);
        
        //    let userList2 = User.findByPk(r.dataValues.UserId)
        //    console.log("datavalues",userList2)
        //    return userList2;
    })
    console.log("PIVOT", pivot)
   pivot.map(async (e) => {
     let prueba = await User.findByPk(e)
        listadoUsers.push(prueba)
        console.log("PRUEBA", prueba)
        return res.status(200).send(listadoUsers);
    })
   
    } catch (error){
        console.error(error);
        res.status(500).send("Error al buscar usuarios por ese rol");
    }   
}); */

// Ruta que trae todos los usuarios que están enrolados a un QUIZ - GET a /roles/enrolled/:id

server.get('/enrolled/:id', async (req, res) => {
  let { id } = req.params;
  if (!id) return res.status(400).send('El id indicado no existe');

  try {
    const enrolledUsers = await Role.findAll({
      where: { QuizId: id, name: 'Enrolled' },
    });

    let usersId = enrolledUsers.map((user) => {
      return user.dataValues.UserId;
    });

    const dataUsersEnrolled = () => {
      return Promise.all(
        usersId.map((uid) =>
          User.findByPk(uid, {
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'deletedAt',
                'password',
                'resetPasswordExpires',
                'resetPasswordToken',
                'cellphone',
                'birthdate',
              ],
            },
          })
        )
      );
    };

    dataUsersEnrolled().then((enrolledUsers) => {
      return res.status(200).send(enrolledUsers);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al buscar usuarios por ese rol');
  }
});

// Ruta que trae todos los favoritos de un usuario - GET a /roles/favorites/user/:id

server.get('/favorites/user/:id', async (req, res) => {
  let { id } = req.params;

  if (!id) return res.status(400).send('Debe incluir el ID');

  try {
    const quizzesFavoritesUser = await Role.findAll({
      where: { UserId: id, name: 'Fan' },
    });

    let quizzesId = quizzesFavoritesUser.map((quiz) => {
      return quiz.dataValues.QuizId;
    });

    const dataFavoritesQuizzes = () => {
      return Promise.all(
        quizzesId.map((qId) =>
          Quiz.findByPk(qId, {
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'modifiedBy',
                'createdBy',
                'SubjectId',
                'SchoolId',
              ],
            },
          })
        )
      );
    };

    dataFavoritesQuizzes().then((favoritesQuizzes) => {
      return res.status(200).send(favoritesQuizzes);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al buscar favoritos');
  }
});

// Ruta que trae todos los QUIZZES en los que está enrolado el usuario - GET a /roles/enrolled/user/:id

server.get('/enrolled/user/:id', async (req, res) => {
  let { id } = req.params;

  if (!id) return res.status(400).send('Debe incluir el ID');

  try {
    const quizzesEnrolledUser = await Role.findAll({
      where: { UserId: id, name: 'Enrolled' },
    });

    let quizzesId = quizzesEnrolledUser.map((quiz) => {
      return quiz.dataValues.QuizId;
    });

    const dataEnrolledQuizzes = () => {
      return Promise.all(
        quizzesId.map((qId) =>
          Quiz.findByPk(qId, {
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'modifiedBy',
                'createdBy',
                'SubjectId',
                'SchoolId',
              ],
            },
          })
        )
      );
    };

    dataEnrolledQuizzes().then((enrolledQuizzes) => {
      return res.status(200).send(enrolledQuizzes);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send('Error al buscar los quizzes en los que está enrolado el USER');
  }
});

module.exports = server;
