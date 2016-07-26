'use strict';
var crypto = require('crypto');
var _ = require('lodash');
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define("product", {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    party: Sequelize.STRING,
    price: Sequelize.INTEGER,
    bought: Sequelize.BOOLEAN,
    dateBought: Sequelize.DATE,
    rating: {
        type: Sequelize.INTEGER,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    instanceMethods: {},
    classMethods: {},
    hooks: {}
});
