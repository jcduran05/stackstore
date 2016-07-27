// Instantiate all models
var expect = require('chai').expect;

var Sequelize = require('sequelize');

var db = require('../../../server/db');

var supertest = require('supertest');

var Promise = require('bluebird');

xdescribe('Cart testing', function () {

    var app, User, Product;

    beforeEach('Sync DB', function () {
        return db.sync({ force: true });
    });

    beforeEach('Create app', function () {
        app = require('../../../server/app')(db);
        User = db.model('user');
        Product = db.model('product');
    });

	var loggedInAgent;

	var userInfo = {
		email: 'joe@gmail.com',
		password: 'shoopdawoop'
	};

	var productInfo = {
		firstName: 'Barack',
		lastName: 'Obama',
		price: 100,
		bought: false
	}

	beforeEach('Create a user', function (done) {
		return User.create(userInfo).then(function (user) {
            done();
        }).catch(done);
	});

	beforeEach('Create loggedIn user agent and authenticate', function (done) {
		loggedInAgent = supertest.agent(app);
		loggedInAgent.post('/login').send(userInfo).end(done);
	});



	beforeEach('Create a product', function (done) {
		return Product.create(productInfo).then(function (user) {
            done();
        }).catch(done);
	});

	beforeEach('adds to the cart', function (done) {
		loggedInAgent.post('/api/cart/add/1').end(function (){
			done()
		})
	});

	it('should add to the cart', function (done) {
		// loggedInAgent.post('/api/cart/add/1')
		loggedInAgent.post('/api/cart/add/1').end(function (err, response){
      if (err) return done(err);
      expect(response.body).to.have.length(2)
      done()
    })
	});

	it('should checkout', function (done) {

		loggedInAgent.post('/api/cart/checkout').end(function (err, response){
      if (err) return done(err);
      // expect(response.body.cart).to.have.length(0)
      done()
    })
	});

});




