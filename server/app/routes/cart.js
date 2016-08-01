'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db')
var User = db.model('user')
var Product = db.model('product')
var Order = db.model('order')
var Promise = require('bluebird')
var chalk = require('chalk')
var stripeConfig= require('../../env').STRIPE;
var stripe = require('stripe')(stripeConfig.testSecretKey)

router.get('/', function(req, res, next){
  if (req.user){
    User.findById(req.user.id)
    .then(user =>{
      console.log(chalk.green('stored cart'), user.cart)
    })
  }
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

  var promiseForUser = req.user ? User.findById(req.user.id) : User.findOrCreate({where: {email: req.body.stripeEmail}});
  promiseForUser
  .then(user => {
    if (user.length) user = user[0]
    return Promise.all([user.getProducts(), user, Product.checkBought(req.session.cart)])
  })
  .spread((owned, user, confirmation) => {
    req.session.cart = req.session.cart.filter((item, i) => !confirmation[i])
    // if (owned.length + req.session.cart.length > 5) {
    //   throw new Error ('too many items in cart')
    // }//do something on front end
    if (!req.session.cart.length){
      throw new Error('no items in cart')
    }//do something on front end
    return Promise.all([Order.create({
      productPrices: req.session.cart.map((item) => item.price),
      productNames: req.session.cart.map((item) => item.firstName +' '+item.lastName),
      total: req.session.cart.map(item => item.price).reduce(function(item1, item2){ return item1 + item2 })
    }), user])
  })
  .spread((order, user) =>{
    Product.setBought(req.session.cart, user, order)
    req.session.cart = [];

    return Promise.all([stripe.customers.create({card: req.body.stripeToken, email: user.email}), user, order, user.addOrder(order)])
  })
  .spread((stripeCustomer, user, order, user2) => {
    return Promise.all([stripe.charges.create({
        amount: order.total * 100,
        currency: 'usd',
        customer: stripeCustomer.id
      }), user.update({stripeId: stripeCustomer.id}), Order.findOne({where: {userId: user2.id, total: order.total}})]) //probably should encode stripeId
  })
  .spread((stripeOrder, user, order) => {
    console.log(chalk.cyan('stripe Order'), stripeOrder)
    if(stripeOrder.paid){
      return order.update({status: 'paid'})
    } else return order
  })
  .then(order => {
    res.send({order: order})
  })
  .catch(next)

}) //get user, cart, products of the user -> check the cart length against products length (max 5 min 1) -> orderStatus/  politician.bought/ politician.dateBought, detail












