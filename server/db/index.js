'use strict';
var db = require('./_db');
module.exports = db;

var User = require('./models/user');
var Product = require('./models/products');
var Order = require('./models/orders').Order


Product.belongsTo(User);

User.hasMany(Product, {as: 'cart'});

Order.belongsTo(User);
Order.hasMany(Product, {as: 'purchased'});
// Detail.belongsTo(Order);
// Detail.hasMany(Product, {as: 'purchase'} );

