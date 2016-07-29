/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var chalk = require('chalk');
var db = require('./server/db');
var User = db.model('user');
var Product = db.model('product')
var fs = require('fs');
var politicians = fs.readFileSync('./senators.json', 'utf8');
var politiciansObj = JSON.parse(politicians);
var Promise = require('sequelize').Promise;

var seedSenators = [];
for (var idx in politiciansObj.objects) {
  var politicianObj = politiciansObj.objects[idx];

  var politicianParty = politicianObj.party;

  var politician = {
    firstName: politicianObj.person.firstname,
    lastName: politicianObj.person.lastname,
    party: politicianObj.party,
    role: politicianObj.role_type,
    state: politicianObj.state,
    website: politicianObj.website,
    price: Math.floor(Math.random() * 1000000),
    picurl: 'default.png'
  };

  seedSenators.push(politician);
}

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password',
            status: 'admin'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    var creatingUsers = users.map(function (userObj) {
        return User.create(userObj);
    });

    return Promise.all(creatingUsers);

};

var trendingProducts = function(){
    var products = [
    {
        firstName: 'Hillary',
        lastName: 'Clinton',
        party: 'Democrat',
        price: '5',
        state: 'NY',
        picurl: 'http://www.newsbiscuit.com/wp-content/uploads/2015/10/hillary-clinton-womenjpeg-045d7.jpg',
        rating: '1',
    },{
        firstName: 'Donald',
        lastName: 'Trump',
        party: 'Republican',
        price: '20',
        state: 'NY',
        picurl: 'http://media.vanityfair.com/photos/55ddc2f8e8f804624a2ff49c/master/h_590,c_limit/donald-trump-history-hair-ss09.jpg',
        rating: '1',

    }];
    var creatingProducts = products.map(function (productObj){
        return Product.create(productObj)
    })
    return Promise.all(creatingProducts)
}


db.sync({ force: true })
    .then(function () {
        return Product.bulkCreate(seedSenators);
    })
    .then(function(){
        trendingProducts()
    })
    .then(function() {
        return seedUsers();
    })
    .then(function () {
        console.log(chalk.green('Seed successful!'));
        process.exit(0);
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
