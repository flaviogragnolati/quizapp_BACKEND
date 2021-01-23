require('dotenv').config();
const express = require('express');
const sendMailRouter = express.Router();
const nodemailer = require('nodemailer');

const transport = {
  service: 'gmail',

  auth: {
    user: process.env.THE_EMAIL,
    pass: process.env.THE_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(transport);

// Para registro, cambio de password, promovido

sendMailRouter.post('/', (req, res) => {
  let text;
  let subject;
  let { name, email, type, quiz } = req.body;
  if (type === 'Welcome') {
    subject = `Bienvenid@, ${name} a Quizapp`;
    text = 'Te damos la bienvenida a Quizapp!';
  } else if (type === 'Accepted') {
    subject = `Bienvenido al curso ${quiz.id}`;
    text = `Te informamos que tu inscripción al curso ${quiz.id} ya fue aceptada.`;
  } else if (type === 'Promote') {
    subject = `${name} has sido promovido a Teacher`;
    text = 'Te damos la bienvenida al equipo docente de Quizapp!';
  } else if (type === 'Dispatch') {
    subject = `Inscripción al curso ${quiz.name}`;
    text = `Tu inscripción al curso ${quiz.name} ha sido enviada. Se te enviará una confirmación a este mismo mail.`;
  } else if (type === 'ResetPassword') {
    subject = 'Recuperación de contraseña';
    text = `Para restrablecer la contraseña haga click en el siguiente link: ${link}.`;
  };

  let mail = {
    from: process.env.THE_EMAIL,
    to: email,
    subject,
    text,
  };
  transporter.sendMail(mail, (err, data) => {
    if (err) {
      console.log('NO se ha enviado el mail', err);
    } else {
      console.log('Se ha enviado el mail');
    }
  });
});

module.exports = sendMailRouter;
