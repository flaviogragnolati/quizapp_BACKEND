require("dotenv").config();
//const express = require("express");
//const sendMailRouter = express.Router();
const nodemailer = require("nodemailer");
let smtpTransport = require("nodemailer-smtp-transport");
const handlebars = require("handlebars");
const fs = require("fs");
//const { User, School } = require("../models/index");
const { FRONT_URL } = require("../config/environments/production");
const BASE_URL = process.env.BASE_URL;
const { THE_EMAIL, THE_PASSWORD } = process.env

const sendMail = ({ user, type, quiz, school }) => {
  let subject;

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
        user: THE_EMAIL,
        pass: THE_PASSWORD,
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
      
      case "welcomeSchool":
        console.log('en mails', user)
      var replacements = {
        // Espacios que van a ser reemplazados en el HTML Mail
        link: FRONT_URL + 'registerSchool',
      };
      subject = `Bienvenid@, ${user.name} a Quizapp`;
      break;

    case "accepted":
      var replacements = {
        name: user.firstName,
        link: `${FRONT_URL} + /${quiz.id}`,
      };
      subject = `Bienvenido al curso ${quiz}`;
      break;

    case "promote":
      var replacements = {
        quiz: quiz.name,
        quizImage: quiz.logo,
        description: quiz.description,
        link: `${FRONT_URL} + /${quiz.id}`,
      };
      subject = `${user.firstName} has sido promovido a Teacher`;
      break;

    case "resetPassword":
      let linkResetPassword =
        BASE_URL + "auth/resetpassword?token=" + user.resetPasswordToken;
      var replacements = {
        name: user.firstName,
        link: linkResetPassword,
      };
      subject = "Recuperación de contraseña";
      break;

    case "createSchool":
      let linkCreateSchool = FRONT_URL; // ¡¡¡CAMBIAR POR LA RUTA REAL!!!
      var replacements = {
        name: user.name,
        email: user.email,
        code: user.code,
        link: linkCreateSchool
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
        to: user.email,
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
};

module.exports = sendMail;

//module.exports = sendMailRouter;
