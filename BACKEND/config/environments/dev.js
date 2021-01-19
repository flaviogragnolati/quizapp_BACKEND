module.exports = {
  PORT: process.env.PORT,
  DB: {
    username: 'postgres',
    password: 'mysecretpassword',
    database: 'quizdb',
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
  },
};
