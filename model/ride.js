const mongoose= require('mongoose');
const {Schema, model} = mongoose;

const rideSchema= new Schema({
	admin: { type: mongoose.ObjectId, required: true, ref: "login"},
	phone: {type: Number, required: true},
	slots: { type: Number, required: true},
	maxslots:{ type: Number, required: true},
	passengers:{ type :[mongoose.ObjectId], ref: 'login'},
	date: { type: Date, required: true},
	destination:  { type: String, required: true},
	pickup:{type: String, required: true},
});

const ride= model('ride', rideSchema, 'ride');
module.exports = ride;