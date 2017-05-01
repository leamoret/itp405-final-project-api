var sequelize = require('./../config/sequelize');
var Sequelize = require('sequelize');

var Piece = sequelize.define('piece', {
  title: {
    type: Sequelize.STRING,
    field: 'title'
  },
  price: {
    type: Sequelize.INTEGER,
    field: 'price'
  },
  photo_url: {
    type: Sequelize.STRING,
    field: 'photo_url'
  }
}, {
  timestamps: false
});

module.exports = Piece;
