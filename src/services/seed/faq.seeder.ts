// ----------------------------------
// ***** NOTE: run this Seeder from compiled JS via /out/seed/faq.seeder.js
//
import mongoose = require("mongoose");
import fs = require("fs");
import { logger } from "../../util/Logger";

// constants
const INTENT_KEY = "intent";
const INTENT_VLAUE = "value";
const INTENT_ANSWER = "answer";

const Schema = mongoose.Schema;

const FAQ = require("../models/faq/faq");
const json = require("../../src/data/faq.json");

// TODO: - to get mongo DB url
// get mongo DB url
/*var mongoDbUrl:string = 'mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_SCHEMA;
if(process.env.DB_AUTHENTICATION_REQUIRED === 'Y') {
	mongoDbUrl = 'mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' +
	process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_SCHEMA;

}

logger.info('mongoDbUrl '+ mongoDbUrl);
*/
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/alexa", function(err) {
if (err) {
	console.log("Failed connecting to MongoDB!");
} else {
	console.log("Successfully connected to MongoDB!");
}
});



// clear all existing documents from the collections
FAQ.remove({}, function(err) {
	console.log("Removed - FAQ");
});



// Read the file and send to the callback
fs.readFile("../../src/data/faq.json", saveData);


let i: any;
let jsonData: any;
// Write the callback function
function saveData(err, data) {
	if (err) throw err;
	jsonData = JSON.parse(data);
	const FAQs: any = [];

	for (i in jsonData) {
		FAQs[i] = new FAQ({
			intent: jsonData[i][INTENT_KEY],
			value: jsonData[i][INTENT_VLAUE],
			answer: jsonData[i][INTENT_ANSWER]
		});
	}

	let done = 0;

	for (i = 0; i < FAQs.length; i++) {
		FAQs[i].save(function(err, result) {
			done++;
			if (done === FAQs.length) {
				exit();
			}
		});
	}

}



// close connection
function exit() {
	console.log("done inserting");
	mongoose.disconnect();
}