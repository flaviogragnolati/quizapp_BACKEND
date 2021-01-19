const server = require('./server');
const db = require('./models');

server.listen(3000, function () {
  db.sequelize.sync();
});
