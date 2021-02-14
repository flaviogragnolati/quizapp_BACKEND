const server = require('express').Router();
const { Quiz, Role, QuizAttempt, Subject } = require('../models/index');

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

//Listar todos los tags de los quizzes respondidos por un alumno (y contar cuantas veces cada uno). GET a mobile/tags/:studentId
server.get('/tags/:studentId', async (req, res) => {
  let { studentId } = req.params;
  let tagsStudentArray = []
  let subjectToStats = []
  let subjectsByName = []

  if (!studentId) return res.status(400).send('Indique ID del estudiante.');
  try {
  var tagsStudent = await QuizAttempt.findAll({
    where: { UserId: studentId },
  })
     tagsStudent.map(async t =>{
     await tagsStudentArray.push(t.QuizId)
     console.log("tagsStudentArray", tagsStudentArray)
  })
 
  for await (const q of tagsStudentArray) {
    const quizToStats = await Quiz.findByPk(q).then(async (quiz) => {
      console.log(quiz.SubjectId)
      await subjectToStats.push(quiz.SubjectId)
    });
  }
  for await (const s of subjectToStats) {
    const subjToStats = await Subject.findByPk(s).then(async (subj) => {
      console.log(subj.name)
      await subjectsByName.push(subj.name)
    });
  }
  return res.status(200).send(subjectsByName);
 }
  catch (error) {
    console.error(error);
    res.status(500).send('Error al buscar los tags para este estudiante');
  }
});

module.exports = server;
