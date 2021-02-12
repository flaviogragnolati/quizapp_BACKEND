const server = require('express').Router();
const { Quiz, Role } = require('../models/index');

//Listar todos los quizzes de un student

server.get('/quizzes/:studentId', async (req, res) => {
  let { studentId } = req.params;

  if (!studentId) return res.status(400).send('Indique ID del estudiante.');

  try {
    const quizzesStudent = await Role.findAll({
      where: { UserId: studentId, name: 'Student' },
    });

    let quizzesId = quizzesStudent.map((quiz) => {
      return quiz.dataValues.QuizId;
    });

    const dataQuizzesStudent = () => {
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

    dataQuizzesStudent().then((quizzesOfStudent) => {
      return res.status(200).send(quizzesOfStudent);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al buscar los quizzes por este estudiante');
  }
});

module.exports = server;
