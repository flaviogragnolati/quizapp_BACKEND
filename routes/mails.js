require("dotenv").config();
const express = require("express");
const sendMailRouter = express.Router();
const nodemailer = require("nodemailer");
let smtpTransport = require("nodemailer-smtp-transport");
const handlebars = require("handlebars");
const fs = require("fs");
//const { User, School } = require("../models/index");
const { FRONT_URL } = require("../config/environments/production");
const BASE_URL = process.env.BASE_URL;

sendMailRouter.post("/", async (req, res) => {
  let text;
  let subject;

  let { user, type, quiz, school } = req.body;

  let htmlTemplate = type;

  var readHTMLFile = (path, callback) => {
    fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
      if (err) {
        throw err;
      } else {
        callback(null, html);
      }
    });
  };

  smtpTransport = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      auth: {
        user: process.env.THE_EMAIL,
        pass: process.env.THE_PASSWORD,
      },
    })
  );

  switch (type) {
    case "welcome":
      var replacements = {
        // Espacios que van a ser reemplazados en el HTML Mail
        link: FRONT_URL,
      };
      subject = `Bienvenid@, ${user.firstName} a Quizapp`;
      break;

    case "accepted":
      var replacements = {
        name: user.firstName,
        link: `${FRONT_URL} + /${quiz.id}`,
      };
      subject = `Bienvenido al curso ${quiz}`;
      break;

    case "promote":
      subject = `${user.firstName} has sido promovido a Teacher`;
      text = "Te damos la bienvenida al equipo docente de Quizapp!";
      break;

    case "resetPassword":
      let linkToSend =
        BASE_URL + "auth/resetpassword?token=" + user.resetPasswordToken;
      var replacements = {
        name: user.firstName,
        link: linkToSend,
      };
      subject = "Recuperación de contraseña";
      break;

    case "createSchool":
      let linkToCreateSchool = FRONT_URL + "rutaParaEditarElPassword"; // ¡¡¡CAMBIAR POR LA RUTA REAL!!!
      // Ingrese a la web con el código ${school.password}. Debe ingresar un nuevo password para habilitar la cuenta
      var replacements = {
        school: school.name,
        link: linkToCreateSchool,
      };
      subject = "Inscripción de organización";
      break;
  }

  readHTMLFile(
    __dirname + `/mailsTemplate/${htmlTemplate}.html`,
    function (err, html) {
      var template = handlebars.compile(html);
      var htmlToSend = template(replacements);

      let mail = {
        from: process.env.THE_EMAIL,
        to: 'damsta1995@gmail.com', //user.email,
        subject,
        html: htmlToSend,
      };

      smtpTransport.sendMail(mail, (err, response) => {
        if (err) {
          console.log("NO se ha enviado el mail", err);
        } else {
          console.log("Se ha enviado el mail");
        }
      });
    }
  );
});

module.exports = sendMailRouter;
