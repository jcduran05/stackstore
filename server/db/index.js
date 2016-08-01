'use strict';
var db = require('./_db');
module.exports = db;

var User = require('./models/user');
var Product = require('./models/products');
var Order = require('./models/orders').Order
var Review = require('./models/reviews');


Product.belongsTo(User);

User.hasMany(Product);


Order.belongsTo(User);
User.hasMany(Order);
Order.hasMany(Product); //need product hasMany/belongsToMany orders as well
// Detail.belongsTo(Order);
// Detail.hasMany(Product, {as: 'purchase'} );

// Review relations
User.hasMany(Review);
Product.hasMany(Review);
Review.belongsTo(Product);
Review.belongsTo(User);

