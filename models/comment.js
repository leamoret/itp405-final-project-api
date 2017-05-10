var sequelize = require('./../config/sequelize');
var Sequelize = require('sequelize');

var Comment = sequelize.define('comment', {
  piece_id: {
    type: Sequelize.INTEGER,
    field: 'piece_id'
  },
  content: {
    type: Sequelize.TEXT,
    field: 'content'
  }
}, {
  timestamps: false
});

module.exports = Comment;
