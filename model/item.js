const mongoose= require('mongoose');
const {Schema, model} = mongoose;

const itemSchema= new Schema({
	itemname: { type: String, required: true},
	location: { type: String, required: true},
	date: { type: Date, required: true},
	description: { type: String, default:"None"},
	image: { type: Buffer, required: true },
	poster: {type: mongoose.ObjectId , ref: 'login', required: true}
});
 const item = model('item', itemSchema, 'item');
 module.exports = item;