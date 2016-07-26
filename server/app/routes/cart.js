'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db')
var User = db.model('user')
var Product = db.model('product')
var Order = db.model('order')
var Promise = require('bluebird')

router.get('/', function(req, res, next){
	User.findById(req.user.id)
	.then(function(user){
		return user.getCart()
	}).then(function(cart){
		res.send(cart)
	}).catch(next)
})

router.post('/add/:id', function(req, res, next){
	User.findById(req.user.id)
	.then(function(user){
		return Promise.all([user, Product.findById(req.params.id)])

	}).spread(function(user, product){
		return user.setCart(product)
	}).then(function(cart){
		res.send("added to cart")
	}).catch(next)
})

router.delete('/add/:id', function(req, res, next){
	User.findById(req.user.id)
	.then(function(user){
		return Promise.all([user, Product.findById(req.params.id)])

	}).spread(function(user, product){
		return user.removeCart(product)
	}).then(function(cart){
		res.send("removed from cart")
	}).catch(next)
})

router.post('/checkout', function (req, res, next){
	User.findById(req.user.id)
	.then((user) => {
		return Promise.all([user, user.getCart(), user.getOwned()])
	})
	.spread( (user, cart, products) => {
		if (cart.length + products.length > 5) { throw new Error("not found!")} //do something
		if (!cart.length) { throw new Error("invalid: too little products")}//do something else
		let total = 0
		products.forEach((product) => {
			total += product.price;
		})
		let pending = []
		cart.forEach((item) => {
			item.bought = true;
			item.dateBought = new Date();
			// item.save()
			// .catch(next)
		});
		cart.forEach((item) => {
			pending.push(user.setOwned(item));
			pending.push(user.removeCart(item))
		});
		console.log(pending)
		pending.unshift(user)
		pending.unshift(total)
		return Promise.all(pending)
	})
	.spread((total, user) => {
		return Promise.all([user.getOwned(), Order.create({total: total})])
	})
	.spread((products, order) => {
		let orders = products.map((product) => order.setPurchase(product));
		orders.unshift(order)
		return Promise.all([order, orders])
	})
	.then((order) => {
		res.send(order)
	})
	.catch(next)
}) //get user, cart, products of the user -> check the cart length against products length (max 5 min 1) -> orderStatus/  politician.bought/ politician.dateBought, detail












