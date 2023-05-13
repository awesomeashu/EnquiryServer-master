const { lowerCase } = require('lodash');
const mongoose= require('mongoose');
const {Schema, model} = mongoose;

const loginSchema= new Schema({
	firstname: { type: String, required: true},
	lastname: { type: String, required: true},
	roll: { type: String, required: true, uppercase:true},
	email: { type: String, required: true},
	verified: {type: Boolean, default: false},
	birthdate: { type: Date, required: true},
	createddate: { type: Date, required: true},
	password: { type: String, required: true},
	type: { type: String, required: true, default: "student"},
	dp: { type: Buffer ,default: null}
});

const login= model('login', loginSchema, 'login');
module.exports = login;