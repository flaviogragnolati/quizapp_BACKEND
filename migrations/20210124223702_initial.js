const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "Schools", deps: []
 * createTable() => "Users", deps: []
 * createTable() => "Subjects", deps: [Schools]
 * createTable() => "Quizzes", deps: [Subjects, Schools]
 * createTable() => "Questions", deps: [Quizzes]
 * createTable() => "Answers", deps: [Questions]
 * createTable() => "QuizAttempts", deps: [Quizzes]
 * createTable() => "QuestionInstances", deps: [Answers, Questions, QuizAttempts]
 * createTable() => "Reviews", deps: [Quizzes, Users]
 * createTable() => "Roles", deps: [Quizzes, Users]
 * createTable() => "Sessions", deps: [Users]
 * createTable() => "QuizTags", deps: [Subjects]
 * createTable() => "Quiz-QTag", deps: [Quizzes, QuizTags]
 * createTable() => "School-User", deps: [Schools, Users]
 *
 */

const info = {
  revision: 1,
  name: "initial",
  created: "2021-01-24T22:37:02.136Z",
  comment: "",
};

const migrationCommands = (transaction) => {
  return [
    {
      fn: "createTable",
      params: [
        "Schools",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          name: { type: Sequelize.STRING, field: "name", allowNull: false },
          email: {
            type: Sequelize.STRING,
            field: "email",
            unique: true,
            allowNull: false,
          },
          description: {
            type: Sequelize.TEXT,
            field: "description",
            allowNull: true,
          },
          country: {
            type: Sequelize.STRING,
            field: "country",
            allowNull: false,
          },
          city: { type: Sequelize.STRING, field: "city", allowNull: true },
          logo: { type: Sequelize.TEXT, field: "logo", allowNull: false },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Users",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          firstName: {
            type: Sequelize.STRING,
            field: "firstName",
            allowNull: false,
          },
          lastName: {
            type: Sequelize.STRING,
            field: "lastName",
            allowNull: false,
          },
          email: {
            type: Sequelize.STRING,
            field: "email",
            unique: true,
            allowNull: false,
          },
          birthdate: {
            type: Sequelize.DATEONLY,
            field: "birthdate",
            allowNull: false,
          },
          cellphone: { type: Sequelize.BIGINT, field: "cellphone" },
          password: {
            type: Sequelize.STRING,
            field: "password",
            allowNull: false,
          },
          resetPasswordToken: {
            type: Sequelize.STRING,
            field: "resetPasswordToken",
            defaultValue: null,
          },
          resetPasswordExpires: {
            type: Sequelize.DATE,
            field: "resetPasswordExpires",
            defaultValue: null,
          },
          avatar: { type: Sequelize.TEXT, field: "avatar" },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Subjects",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          name: { type: Sequelize.STRING, field: "name", allowNull: false },
          description: {
            type: Sequelize.TEXT,
            field: "description",
            allowNull: true,
          },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          SchoolId: {
            type: Sequelize.INTEGER,
            field: "SchoolId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Schools", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Quizzes",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          quantity: { type: Sequelize.INTEGER, field: "quantity" },
          name: { type: Sequelize.STRING, field: "name", allowNull: false },
          description: {
            type: Sequelize.TEXT,
            field: "description",
            allowNull: true,
          },
          modifiedBy: {
            type: Sequelize.INTEGER,
            field: "modifiedBy",
            allowNull: true,
          },
          createdBy: {
            type: Sequelize.INTEGER,
            field: "createdBy",
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          SubjectId: {
            type: Sequelize.INTEGER,
            field: "SubjectId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Subjects", key: "id" },
            allowNull: true,
          },
          SchoolId: {
            type: Sequelize.INTEGER,
            field: "SchoolId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Schools", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Questions",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          title: { type: Sequelize.STRING, field: "title", allowNull: false },
          question: {
            type: Sequelize.STRING,
            field: "question",
            allowNull: false,
          },
          modifiedBy: {
            type: Sequelize.INTEGER,
            field: "modifiedBy",
            allowNull: false,
          },
          createdBy: {
            type: Sequelize.INTEGER,
            field: "createdBy",
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          QuizId: {
            type: Sequelize.INTEGER,
            field: "QuizId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Quizzes", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Answers",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          text: { type: Sequelize.TEXT, field: "text", allowNull: false },
          correct: {
            type: Sequelize.BOOLEAN,
            field: "correct",
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          QuestionId: {
            type: Sequelize.INTEGER,
            field: "QuestionId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Questions", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "QuizAttempts",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          finished: {
            type: Sequelize.BOOLEAN,
            field: "finished",
            allowNull: false,
          },
          grade: { type: Sequelize.INTEGER, field: "grade", allowNull: false },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          QuizId: {
            type: Sequelize.INTEGER,
            field: "QuizId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Quizzes", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "QuestionInstances",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          name: { type: Sequelize.STRING, field: "name", allowNull: false },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          AnswerId: {
            type: Sequelize.INTEGER,
            field: "AnswerId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Answers", key: "id" },
            allowNull: true,
          },
          QuestionId: {
            type: Sequelize.INTEGER,
            field: "QuestionId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Questions", key: "id" },
            allowNull: true,
          },
          QuizAttemptId: {
            type: Sequelize.INTEGER,
            field: "QuizAttemptId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "QuizAttempts", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Reviews",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          puntaje: {
            type: Sequelize.SMALLINT,
            field: "puntaje",
            allowNull: false,
          },
          description: {
            type: Sequelize.TEXT,
            field: "description",
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          QuizId: {
            type: Sequelize.INTEGER,
            field: "QuizId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Quizzes", key: "id" },
            allowNull: true,
          },
          UserId: {
            type: Sequelize.INTEGER,
            field: "UserId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Users", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Roles",
        {
          name: {
            type: Sequelize.ENUM("Student", "Teacher"),
            field: "name",
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          QuizId: {
            type: Sequelize.INTEGER,
            field: "QuizId",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            references: { model: "Quizzes", key: "id" },
            primaryKey: true,
          },
          UserId: {
            type: Sequelize.INTEGER,
            field: "UserId",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            references: { model: "Users", key: "id" },
            primaryKey: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Sessions",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          device: { type: Sequelize.STRING, field: "device" },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          UserId: {
            type: Sequelize.INTEGER,
            field: "UserId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Users", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "QuizTags",
        {
          id: {
            type: Sequelize.INTEGER,
            field: "id",
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          name: { type: Sequelize.STRING, field: "name", allowNull: false },
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          SubjectId: {
            type: Sequelize.INTEGER,
            field: "SubjectId",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
            references: { model: "Subjects", key: "id" },
            allowNull: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "Quiz-QTag",
        {
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          QuizId: {
            type: Sequelize.INTEGER,
            field: "QuizId",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            references: { model: "Quizzes", key: "id" },
            primaryKey: true,
          },
          QuizTagId: {
            type: Sequelize.INTEGER,
            field: "QuizTagId",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            references: { model: "QuizTags", key: "id" },
            primaryKey: true,
          },
        },
        { transaction },
      ],
    },
    {
      fn: "createTable",
      params: [
        "School-User",
        {
          createdAt: {
            type: Sequelize.DATE,
            field: "createdAt",
            allowNull: false,
          },
          updatedAt: {
            type: Sequelize.DATE,
            field: "updatedAt",
            allowNull: false,
          },
          SchoolId: {
            type: Sequelize.INTEGER,
            field: "SchoolId",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            references: { model: "Schools", key: "id" },
            primaryKey: true,
          },
          UserId: {
            type: Sequelize.INTEGER,
            field: "UserId",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            references: { model: "Users", key: "id" },
            primaryKey: true,
          },
        },
        { transaction },
      ],
    },
  ];
};

const rollbackCommands = (transaction) => {
  return [
    {
      fn: "dropTable",
      params: ["Answers", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Questions", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["QuestionInstances", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Quizzes", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["QuizAttempts", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["QuizTags", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Reviews", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Roles", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Schools", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Sessions", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Subjects", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Users", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["Quiz-QTag", { transaction }],
    },
    {
      fn: "dropTable",
      params: ["School-User", { transaction }],
    },
  ];
};

const pos = 0;
const useTransaction = true;

const execute = (queryInterface, sequelize, _commands) => {
  let index = pos;
  const run = (transaction) => {
    const commands = _commands(transaction);
    return new Promise((resolve, reject) => {
      const next = () => {
        if (index < commands.length) {
          const command = commands[index];
          console.log(`[#${index}] execute: ${command.fn}`);
          index++;
          queryInterface[command.fn](...command.params).then(next, reject);
        } else resolve();
      };
      next();
    });
  };
  if (this.useTransaction) {
    return queryInterface.sequelize.transaction(run);
  }
  return run(null);
};

module.exports = {
  pos,
  useTransaction,
  up: (queryInterface, sequelize) => {
    return execute(queryInterface, sequelize, migrationCommands);
  },
  down: (queryInterface, sequelize) => {
    return execute(queryInterface, sequelize, rollbackCommands);
  },
  info,
};
