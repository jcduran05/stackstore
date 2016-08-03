

'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db')
var User = db.model('user')
var Product = db.model('product')
var Review = db.model('review')
var Promise = require('bluebird')

router.get('/', function (req, res, next){
  Product.findAll()
  .then(function (products){
    if (!req.session.cart) req.session.cart = [];
    products.forEach(product => {

      if (product.dateBought && new Date() - product.dateBought > 20000/*2592000000*/){ //if a product has been purchased for more than 30 days, it becomes released. may consider adding another value to the view of products with days left until availability.
        console.log(require('chalk').green('bought'), new Date() - product.dateBought, product.firstName)
        product.bought = false
        User.findById(req.user.id)
        .then(user => {
          return Promise.all([user.removeProduct(product), product.update({dateBought: null, bought: false})])
        })
        .then(() => {
          console.log(require('chalk').cyan('user removed'))
        })
      }

      req.session.cart.forEach(item => {
        if (!item) return
        if (item.id === product.id){
          product.dataValues.inCartState = true;
        }
      })


    })
    res.send(products)
  }).catch(next)
});

router.get('/:id', function (req, res, next){
  Product.scope('allReviews').findById(req.params.id)
  .then(function (product){
    // product.setRating();

    if (!req.session.cart) req.session.cart = [];
    req.session.cart.forEach(item => {
      if (item.id === product.id){
        product.dataValues.inCartState = true;
      }
  })
    res.send(product)
  }).catch(next)
})

router.get('/:id/review', function(req,res,next) {
  Review.findAll({
    where: {
      productId: req.params.id
    }
  })
  .then(function(reviews) {
    res.status(200).send(reviews);
  })
  .catch(next);
});

router.post('/:id/review', function (req, res, next){
  if (req.user.status !== 'registered' && req.user.status !== 'admin'){
    res.status(403).send('Forbidden');
    return
  }

  req.body.productId = req.params.id;
  req.body.userId = req.user.id;
  Review.create(req.body)
  .then(function(review) {
    res.status(200).send(review);
  })
  .catch(next);
})

router.put('/:id/review/:reviewId', function (req, res, next){
  if (req.user.status !== 'registered' && req.user.status !== 'admin'){
    res.status(403).send('Forbidden');
    return
  }

  req.body.productId = req.params.id;
  req.body.userId = req.user.id;
  Review.findById(req.params.reviewId)
  .then(function(review) {
    return review.update(req.body)
  })
  .then(function(review) {
    res.status(200).send(review);
  })
  .catch(next);
})

router.put('/:id', function (req, res, next){

  if(req.user.status!='admin'){
    res.status(403).send("forbidden")
    return
  }
	Product.findById(req.params.id)

  .then(function (product){
    product.update(req.body)
  }).then(function (){
  	res.status(200).send("updated")
  })
  	.catch(next)
})//updating politician and restrict to admin


router.delete('/:id', function(req, res, next){ //deleting a politician restrict to admin

  if(req.user.status!='admin'){
    res.status(403).send("forbidden")
    return
  }
  Product.findById(req.params.id)
    .then(function (product){
      product.destroy()
    }).then(function (){
    	res.status(200).send("deleted")
    })
    	.catch(next)
})

router.post('/create', function (req, res, next){
  // check that product doesnt already exist

  if (req.user.status !== 'admin'){
    res.status(401).send('Unauthorized')
    return
  }

  Product.findOne({where: {firstName: req.body.firstName, lastName: req.body.lastName}})
  .then(function(productMatch){
  if (productMatch) return Sequelize.Promise.reject("Already Created")
  else {
    Product.create(req.body)
    .then(function(product) {
    res.status(200).send(product);
    })
  }})

  .catch(next);
  })










