// Instantiate all models
var expect = require('chai').expect;

var Sequelize = require('sequelize');

var db = require('../../../server/db');

var supertest = require('supertest');
var app = require('../../../server/app');
var Promise = require('bluebird');

describe('Members Route', function () {

    var app, User;

    beforeEach('Sync DB', function () {
        return db.sync({ force: true });
    });

    beforeEach('Create app', function () {
        app = require('../../../server/app')(db);
        User = db.model('user');
    });

	xdescribe('Unauthenticated request', function () {

		var guestAgent;

		beforeEach('Create guest agent', function () {
			guestAgent = supertest.agent(app);
		});

		it('should get a 401 response', function (done) {
			guestAgent.get('/api/members/secret-stash')
				.expect(401)
				.end(done);
		});

	});

	xdescribe('Authenticated request', function () {

		var loggedInAgent;

		var userInfo = {
			email: 'joe@gmail.com',
			password: 'shoopdawoop'
		};

		beforeEach('Create a user', function (done) {
			return User.create(userInfo).then(function (user) {
                done();
            }).catch(done);
		});

		beforeEach('Create loggedIn user agent and authenticate', function (done) {
			loggedInAgent = supertest.agent(app);
			loggedInAgent.post('/login').send(userInfo).end(done);
		});

		it('should get with 200 response and with an array as the body', function (done) {
			loggedInAgent.get('/api/members/secret-stash').expect(200).end(function (err, response) {
				if (err) return done(err);
				expect(response.body).to.be.an('array');
				done();
			});
		});

	});


  describe('User manipulation: create/edit/delete', function () {

    var newUserInfo = {
      email: 'jo@gmail.com',
      password: 'testpass'
    };


    // beforeEach('Create a user', function (done) {
    //   return User.create(userInfo).then(function (user) {
    //             done();
    //         }).catch(done);
    // });

    // beforeEach('Create loggedIn user agent and authenticate', function (done) {
    //   loggedInAgent = supertest.agent(app);
    //   loggedInAgent.post('/login').send(userInfo).end(done);
    // });
    var agent;

    beforeEach('Create agent', function () {
      agent = supertest.agent(app);
    });

    it('should get with 200 response when creating a new user', function (done) {
      agent.post('/api/users')
      .send({
        email: 'jo@gmail.com',
        password: 'testpass'
      })
      .expect(200).end(function (err, response) {
        if (err) return done(err);
        expect(response.body.email).to.be.equal('jo@gmail.com');
        done();
      });
    });

    it('should get with 400 response when creating a new user', function (done) {

      agent.post('/api/users')
      .send({
        email: 'jo@gmail.com',
        password: 'testpass'
      }).expect(200).end(function (err, response) {
          if (err) return done(err);
          agent.post('/api/users')
          .send({
            email: 'jo@gmail.com',
            password: 'exists'
          })
          .expect(400).end(function (err, response) {
            if (err) return done(err);
            done();
          });
      });

    });

  });

});
