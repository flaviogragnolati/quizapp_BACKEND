//                        __
//                      .'  '.
//                  _.-'/  |  \
//     ,        _.-"  ,|  /  0 `-.
//     |\    .-"       `--""-.__.'=====================-,
//     \ '-'`        .___.--._)=========================|
//      \            .'      |                          |
//       |     /,_.-'        |        HENRY LABS        |
//     _/   _.'(             |                          |
//    /  ,-' \  \            |          GRUPO 3         |
//    \  \    `-'            |                          |
//     `-'                   '--------------------------'
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var port = process.env.PORT || 3000; //Cambiar a 8080 para subir
const server = require('./server');
const db = require('./models');
// const { conn } = require('./BACKEND/db');
server.listen(port,function() {
  console.log(`app running on port ${port}`); });
