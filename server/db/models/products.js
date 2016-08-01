
'use strict';
var crypto = require('crypto');
var _ = require('lodash');
var Sequelize = require('sequelize');
var Promise = require('bluebird')

var db = require('../_db');

module.exports = db.define("product", {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    
    party: Sequelize.STRING,
    price: Sequelize.INTEGER,
    picurl: {type: Sequelize.STRING, defaultValue:'default.png'},

    website: Sequelize.STRING,
    state: Sequelize.STRING,
    bought: Sequelize.BOOLEAN,
    dateBought: Sequelize.DATE,
    rating: {
        type: Sequelize.INTEGER,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    instanceMethods: {},
    classMethods: {
        setBought: function (cart, user, order) {
            let pending = []
            cart.forEach(item => {
                this.findById(item.id)
                .then((prod) => {
                    prod.update({
                        bought: true,
                        dateBought: new Date()
                    }).catch(console.error.bind(console))
                    user.addProduct(prod).catch(console.error.bind(console))
                    order.addProduct(prod).catch(console.error.bind(console))
                }).catch(console.error.bind(console))
            })
        },
        checkBought: function (cart) {
            var pending = []
            cart.forEach(item => {
                pending.push(this.findById(item.id))
            })
            return Promise.all(pending)
            .spread(function(item1, item2, item3, item4, item5){
                let arr = [].slice.call(arguments)
                return arr.map((arg) => Boolean(arg.dataValues.bought))
            })
        }
    }

    // hooks: {
    //     beforeCreate: function () {
               
    //             db.model('product').findOne({where: {firstName: this.firstName, lastName: this.lastName}})
    //             .then(function(productMatch){

                  
    //                 // if (productMatch.firstName) console.log(productMatch, "THERE IS A MATCH"); 
    //                 if (productMatch.firstName) { throw new Error ("THATS THE WRONG THANG"); }
    //             })

    //     }
    // }
});

// db.model('product').hook('beforeCreate', function(aproduct){
//     db.model('product').findOne({where: {firstName: aproduct.firstName, lastName: aproduct.lastName}})
//                 .then(function(productMatch){ 
//                     console.log("HIIIIIIIIIIIIIIIIII", productMatch)

//                 if (productMatch) { 
//                 console.log("YESSSSSSSSSSSSSSSSSSSS")
//                 return Sequelize.Promise.reject("Already Created")}
                   
            
//                }).catch(function(err){
//                     console.log(err)
    
//     })
// })

