var _ = require('lodash');
var Sequelize = require('sequelize');
var db = require('../_db');


module.exports = { 
	Order: db.define('order', {
		confirmation:{
			type: Sequelize.INTEGER
		},
		total: {
			type:Sequelize.INTEGER
		},
		status:{
			type: Sequelize.STRING,
			defaultValue: 'Pending'
		}
	},{
		hooks: {
			beforeCreate: function(order){
				order.confirmation = Math.floor(Math.random()*1000000) + 1000000
			}
		}
	}),
	Detail: db.define('detail', {

	})
}