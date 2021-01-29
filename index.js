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
// const { conn } = require('./BACKEND/db');
server.listen(3000, async function () {
 // await db.sequelize.sync();
  console.log('%s listening at 3000');
});
