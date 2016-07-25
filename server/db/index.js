'use strict';
var db = require('./_db');
module.exports = db;

var User = require('./models/user');
var Product = require('./models/products');

User.hasMany(Product, {as: 'owned'})
Product.belongsTo(User);

User.belongsToMany(Product, {through: 'cart'})

