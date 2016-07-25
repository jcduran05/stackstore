'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db')
var User = db.model('user')

router.get('/', function (req, res, next){
  console.log(req.session)
  //check the session ID and make sure user isAdmin

  User.findAll()
  .then(function (users){
    res.send(users)
  }).catch(next)

})

router.get('/:id', function (req, res, next){

  // check that user is current user or Admin

  User.findById(req.params.id)
  .then(function (user){
    res.send(user)
  }).catch(next)
})

