const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
	intent: String,
	value: String,
	answer: String
});

module.exports = mongoose.model("faqs", schema);