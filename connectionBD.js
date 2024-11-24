const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('postgres', 'postgres', 'GhBDtn123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

module.exports = { sequelize };