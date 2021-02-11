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
const server = require('./server');
const db = require('./models');
var port = process.env.PORT || 8080;
// const { conn } = require('./BACKEND/db');
server.listen(port, function () {
  console.log(`app running on port ${port}`);
});
