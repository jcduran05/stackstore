var sinon = require('sinon');
var expect = require('chai').expect;

var Sequelize = require('sequelize');
var Promise = require('bluebird')

var db = require('../../../server/db');

var User = db.model('user');
var Product = db.model('product');
var Order = db.model('order')


describe('User model', function () {

    beforeEach('Sync DB', function () {
       return db.sync({ force: true });
    });

    describe('password encryption', function () {

        describe('generateSalt method', function () {

            it('should exist', function () {
                expect(User.generateSalt).to.be.a('function');
            });

            it('should return a random string basically', function () {
                expect(User.generateSalt()).to.be.a('string');
            });

        });

        describe('encryptPassword', function () {

            var cryptoStub;
            var hashUpdateSpy;
            var hashDigestStub;
            beforeEach(function () {

                cryptoStub = sinon.stub(require('crypto'), 'createHash');

                hashUpdateSpy = sinon.spy();
                hashDigestStub = sinon.stub();

                cryptoStub.returns({
                    update: hashUpdateSpy,
                    digest: hashDigestStub
                });

            });

            afterEach(function () {
                cryptoStub.restore();
            });

            it('should exist', function () {
                expect(User.encryptPassword).to.be.a('function');
            });

            it('should call crypto.createHash with "sha1"', function () {
                User.encryptPassword('asldkjf', 'asd08uf2j');
                expect(cryptoStub.calledWith('sha1')).to.be.ok;
            });

            it('should call hash.update with the first and second argument', function () {

                var pass = 'testing';
                var salt = '1093jf10j23ej===12j';

                User.encryptPassword(pass, salt);

                expect(hashUpdateSpy.getCall(0).args[0]).to.be.equal(pass);
                expect(hashUpdateSpy.getCall(1).args[0]).to.be.equal(salt);

            });

            it('should call hash.digest with hex and return the result', function () {

                var x = {};
                hashDigestStub.returns(x);

                var e = User.encryptPassword('sdlkfj', 'asldkjflksf');

                expect(hashDigestStub.calledWith('hex')).to.be.ok;
                expect(e).to.be.equal(x);

            });

        });

        describe('on creation', function () {

            var encryptSpy;
            var saltSpy;

            var createUser = function () {
                return User.create({ email: 'obama@gmail.com', password: 'potus' });
            };

            beforeEach(function () {
                encryptSpy = sinon.spy(User, 'encryptPassword');
                saltSpy = sinon.spy(User, 'generateSalt');
            });

            afterEach(function () {
                encryptSpy.restore();
                saltSpy.restore();
            });

            it('should call User.encryptPassword with the given password and generated salt', function (done) {
                createUser().then(function () {
                    var generatedSalt = saltSpy.getCall(0).returnValue;
                    expect(encryptSpy.calledWith('potus', generatedSalt)).to.be.ok;
                    done();
                });
            });

            it('should set user.salt to the generated salt', function (done) {
               createUser().then(function (user) {
                   var generatedSalt = saltSpy.getCall(0).returnValue;
                   expect(user.salt).to.be.equal(generatedSalt);
                   done();
               });
            });

            it('should set user.password to the encrypted password', function (done) {
                createUser().then(function (user) {
                    var createdPassword = encryptSpy.getCall(0).returnValue;
                    expect(user.password).to.be.equal(createdPassword);
                    done();
                });
            });

        });

        describe('sanitize method', function () {

            var createUser = function () {
                return User.create({ email: 'obama@gmail.com', password: 'potus' });
            };

            it('should remove sensitive information from a user object', function () {
                createUser().then(function (user) {
                    var sanitizedUser = user.sanitize();
                    expect(user.password).to.be.ok;
                    expect(user.salt).to.be.ok;
                    expect(sanitizedUser.password).to.be.undefined;
                    expect(sanitizedUser.salt).to.be.undefined;
                });
            });
        });

        describe('getter', function () {

            var createUser = function () {
                return User.create({ email: 'obama@gmail.com', password: 'potus' });
            };

            var createProduct1 = function () {
                return Product.create({ firstName: 'obama', lastName: 'obama', bought: true });
            };

            var createProduct2 = function () {
                return Product.create({ firstName: 'obama2', lastName: 'obama2' });
            };
            var createOrder = function(){
                return Order.create({total:5})
            }
            it('status and confirmation should be set', function(){
                return createOrder()
                .then(function(order){
                expect(order.status).to.be.equal('Pending')
                console.log(order.confirmation)
                expect(order.confirmation).to.be.ok
                })
            })

            it('should confirm purchases', function () {

                return Promise.all([createProduct1(), createProduct2()])
                .then(() => Product.checkBought([{id:1}, {id: 2}]))
                .then(confirm => {
                    console.log(confirm)
                    expect(confirm.length).to.be.equal(2)
                })
            });

            xit('should create associations', function () {

                return Promise.all([createUser(), createProduct1(), createProduct2()])
                .spread(function (user, product1, product2) {
                    return Promise.all([user.setCart([product2, product1]), user])
                })
                .spread(function (something, user){
                    return Promise.all([user.getCart(), user])
                })
                .spread(function (politicians, user){
                    expect(politicians[0].userId).to.be.equal(user.id);
                })
            });

            // it('creates Users', function)

            xit('we can add and deleted items from cart', function () {
               return Promise.all([createUser(), createProduct1()])
                .spread(function(user, product) {
                    return Promise.all([user.setCart(product), user, product])
                }).spread(function(item, user, product){
                    return Promise.all([user.getCart(),user, product])
                }).spread(function(cart, user, product){
                    expect(cart.length).to.be.equal(1)
                    return Promise.all([user, user.removeCart(product) ])
                }).spread(function(user){
                    return user.getCart()
                }).then(function(cart){
                    expect(cart.length).to.be.equal(0)
                })

            });
            xit('we can add and deleted items from Owned', function () {
               return Promise.all([createUser(), createProduct1()])
                .spread(function(user, product) {
                    return Promise.all([user.setOwned(product), user, product])
                }).spread(function(item, user, product){
                    return Promise.all([user.getOwned(),user, product])
                }).spread(function(Owned, user, product){
                    expect(Owned.length).to.be.equal(1)
                    return Promise.all([user, user.removeOwned(product) ])
                }).spread(function(user){
                    return user.getOwned()
                }).then(function(Owned){
                    expect(Owned.length).to.be.equal(0)
                })

            });


        });


    });

});
