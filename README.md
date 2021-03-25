# QuizApp Back End

Web & mobile app for the management of quizzes. A tool designed for education institutions to outsource their examinations.

FRONTEND REPO: https://github.com/flaviogragnolati/quizapp_WEB

BACKEND REPO: https://github.com/flaviogragnolati/quizapp_BACKEND

Rutas:

'/'

Bienvenido a ApiQuizzes

/answers

/answers/:id
Borrar una ANSWER by ID - DELETE
/answers
Crear una ANSWER - POST
/answers/:id
Editar una Answer by ID - PUT
/answers/:id
Devuelve una Answer by ID - GET

/auth

// Ruta PROFILE - GET a /auth/me/:id

// Inicio de sesión con FACEBOOK

server.get('/facebook', passport.authenticate('facebook'));

'/facebook/callback',

// Inicio de sesión con GOOGLE

'/google',

'/google/callback',

// Ruta para DESLOGUEARSE - GET a /auth/logout

server.get('/logout'

'/restore',

// Ruta para Registrarse / crear un usuario - POST a /auth/register

//Ruta para Loguearse - POST a /auth/login

//Ruta para Loguearse una ORGANIZACIÓN - POST a /auth/login/org

// RUTA para el registro final de la SCHOOL - POST a /auth/org/register

// Primero se crea un token provisorio con caducidad de 5 minutos y se envía a través de un email

server.put('/resetpassword/:id'

// Cuando el user ingresa al link se hace un GET a /auth/resetpassword/?token=

// Actualizar la contraseña
server.put('/pass/:id'

/users

/org

/questions

/quiz

/subject

/roles

/teachers

/mobile
