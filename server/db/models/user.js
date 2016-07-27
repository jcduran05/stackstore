'use strict';
var crypto = require('crypto');
var _ = require('lodash');
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('user', {
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING
    },
    salt: {
        type: Sequelize.STRING
    },
    // twitter_id: {
    //     type: Sequelize.STRING
    // },
    // facebook_id: {
    //     type: Sequelize.STRING
    // },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    creditCard: {
        type: Sequelize.INTEGER //eventually encrypt information
    },
    google_id: {
        type: Sequelize.STRING
    }
}, {
    instanceMethods: {
        sanitize: function () {
            return _.omit(this.toJSON(), ['password', 'salt']);
        },
        correctPassword: function (candidatePassword) {
            return this.Model.encryptPassword(candidatePassword, this.salt) === this.password;
        },
        clearCart: function (){
            return this.getCart()
            .then((cart) => {
                cart.forEach(item => this.removeCart(item))
            })
        }
    },
    classMethods: {
        generateSalt: function () {
            return crypto.randomBytes(16).toString('base64');
        },
        encryptPassword: function (plainText, salt) {
            var hash = crypto.createHash('sha1');
            hash.update(plainText);
            hash.update(salt);
            return hash.digest('hex');
        }
    },
    hooks: {
        beforeValidate: function (user) {
            if (user.changed('password')) {
                user.salt = user.Model.generateSalt();
                user.password = user.Model.encryptPassword(user.password, user.salt);
            }
        }
    }
});
