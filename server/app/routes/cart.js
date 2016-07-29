'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db')
var User = db.model('user')
var Product = db.model('product')
var Order = db.model('order')
var Promise = require('bluebird')

router.get('/', function(req, res, next){
	res.send(req.session.cart ? req.session.cart : [])
})

router.post('/add/:id', function(req, res, next){
  Product.findById(req.params.id)
  .then(product => {
    if (product.bought) return
    if (!req.session.cart) req.session.cart = [];
    req.session.cart.push(product)
    res.send(req.session.cart)
  })
})

router.delete('/delete/:id', function(req, res, next){
    req.session.cart = req.session.cart.filter(item => item.id != req.params.id)
    res.send(req.session.cart)
})

router.post('/checkout', function (req, res, next){
  User.findById(req.user.id)
  .then(user => {
    return Promise.all([user.getProducts(), user, Product.checkBought(req.session.cart)])
  })
  .spread((owned, user, confirmation) => {
    req.session.cart = req.session.cart.filter((item, i) => !confirmation[i])
    if (owned.length + req.session.cart.length > 5) {
      throw new Error ('too many items in cart')
    }//do something on front end
    if (!req.session.cart.length){
      throw new Error('no items in cart')
    }//do something on front end
    return Promise.all([Order.create({
      productPrices: req.session.cart.map((item) => item.price),
      productNames: req.session.cart.map((item) => item.firstName +' '+item.lastName)
    }), user])
  })
  .spread((order, user) =>{
    user.addOrder(order)
    Product.setBought(req.session.cart, user, order)
    req.session.cart = []
    res.send({order: order})
  }).catch(next)
}) //get user, cart, products of the user -> check the cart length against products length (max 5 min 1) -> orderStatus/  politician.bought/ politician.dateBought, detail












