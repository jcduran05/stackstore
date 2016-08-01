var _ = require('lodash');
var Sequelize = require('sequelize');
var db = require('../_db');


module.exports = db.define('review', {
    title:{
      type: Sequelize.STRING,
      allowNull: false,
    },
    content: {
      type:Sequelize.TEXT,
      allowNull: false,
    },
    rating:{
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  }, {}
);
