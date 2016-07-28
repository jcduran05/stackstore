'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db')
var User = db.model('user')

// GET Routes
router.get('/', function (req, res, next){
  //check the session ID and make sure user isAdmin
  if (req.user.status !== 'admin'){
    res.status(403).send('Forbidden');
    return
  }
  User.findAll()
  .then(function (users){
    res.send(users)
  }).catch(next)
})

router.get('/:id', function (req, res, next){
  // check that user is current user or Admin
  if (req.user.status !== 'admin' && req.user.id != req.params.id){
    res.status(403).send('Forbidden');
    return
  }
  User.findById(req.params.id)
  .then(function (user){
    res.send(user)
  }).catch(next)
})

// DELETE Routes
router.delete('/:id', function (req, res, next){
  // check that user is current user or Admin
  if (req.user.status !== 'admin' && req.user.id != req.params.id){
    res.status(403).send('Forbidden');
    return
  }
  User.findById(req.params.id)
  .then(function (user){
    if (!user) throw {status:404, message:'User not found.'};
    else return user.destroy()
  })
  .then(function(user){
    res.status(204).send(user);
  }).catch(next);
})

//confirm Password
router.put('/:id/confirm', function (req, res, next){
  // check that user is current user or Admin
  if (req.user.status === 'admin'){
    res.send(true)
    return
  }
  if (req.user.id != req.params.id){
    res.send(false)
    return
  }

  if (!req.body.pswd) {
    throw {status: 404, message: 'Not found.'};
  }
  User.findById(req.params.id)
  .then(function (user){
    res.send(user.correctPassword(req.body.pswd))
  }).catch(next);
})

// PUT Routes
router.put('/:id', function (req, res, next){
  // check that user is current user or Admin
  if (req.user.status !== 'admin' && req.user.id != req.params.id){
    res.status(403).send('Forbidden');
    return
  }
  User.findById(req.params.id)
  .then(function (user){
    if (!user) throw {status: 400, message:'User already exists'};
    else return user.update(req.body);
  })
  .then(function(user){
    res.status(200).send(user);
  }).catch(next);
})


// POST Routes
router.post('/', function (req, res, next){
  // check that user is current user or Admin
  if ( req.user && req.user.status !== 'admin' ){
    res.status(403).send('Forbidden');
    return
  }
  User.create(req.body)
  .then(function (user){
    return user.changeStatus('registered');
  })
  .then(function(user) {
    res.status(200).send(user);
  })
  .catch(next);
})

