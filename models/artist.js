var sequelize = require('./../config/sequelize');
var Sequelize = require('sequelize');

var Artist = sequelize.define('artist', {
  name: {
    type: Sequelize.STRING,
    field: 'name'
  },
  age: {
    type: Sequelize.INTEGER,
    field: 'age'
  },
  biography: {
    type: Sequelize.TEXT,
    field: 'biography'
  },
  photo_url: {
    type: Sequelize.STRING,
    field: 'photo_url'
  },
  endorsement: {
    type: Sequelize.INTEGER,
    field: 'endorsement'
  }
}, {
  timestamps: false
});

module.exports = Artist;
