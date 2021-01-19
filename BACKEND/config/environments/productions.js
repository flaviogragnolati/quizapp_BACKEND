module.exports = {
  PORT: process.env.PORT,
  DB: {
    username: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'quizdb',
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
};
