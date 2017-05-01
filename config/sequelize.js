var Sequelize = require('sequelize');

var sequelize = new Sequelize('lea', 'lea', 'ember2016', {
  host: 'itp460.usc.edu',
  dialect: 'mysql'
});

module.exports = sequelize;
