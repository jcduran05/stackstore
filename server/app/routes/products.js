
'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db')
var User = db.model('user')
var Product = db.model('product')

router.get('/', function (req, res, next){
  Product.findAll()
  .then(function (products){
    res.send(products)
  }).catch(next)
})

router.get('/:id', function (req, res, next){
  Product.findById(req.params.id)
  .then(function (product){
    res.send(product)
  }).catch(next)
})

router.put('/:id', function (req, res, next){
	Product.findById(req.params.id)
  .then(function (product){
    product.update(req.body)    
  }).then(function (){
  	res.sendStatus(200).send("updated")
  })
  	.catch(next)
})//updating politician and restrict to admin


router.delete('/:id', function(req, res, next){ //deleting a politician restrict to admin 
Product.findById(req.params.id)
  .then(function (product){
    product.destroy()    
  }).then(function (){
  	res.sendStatus(200).send("deleted")
  })
  	.catch(next)
})