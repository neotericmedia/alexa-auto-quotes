import { NextFunction, Request, Response } from "express";

import { JarvisLogger } from "../../util/JarvisLogger";
import { default as FAQ , FaqModel } from "../../models/faq/faq.model";


import mongoose = require("mongoose");
const faqs = require("../../models/faq/faqs");


//TODO - not used  to be deleted - srini - check with Doug.

let mongoDbUrl: string = "mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_SCHEMA;
if (process.env.DB_AUTHENTICATION_REQUIRED === "Y") {
	mongoDbUrl = "mongodb://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@" +
	process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_SCHEMA;
}

mongoose.connect(mongoDbUrl, function(err) {
	if (err) {
		JarvisLogger.db.error("Failed connecting to MongoDB!");
	} else {
		JarvisLogger.db.debug("Successfully connected to MongoDB!");
	}
});

export class FaqService {

	public async findByIntent(reqIntent: string): Promise<FaqModel> {
		return new Promise<FaqModel>((resolve, reject) => {
			if (!reqIntent || reqIntent.length < 1) {
				JarvisLogger.db.error("Empty input. Terminated invalid intent request.");
				reject(new Error("Empty input. Terminated invalid intent request."));
			}
			
			FAQ.find({ intent: reqIntent }, function(error, faqFound) {
			if (error) {
				JarvisLogger.db.error("FaqService findByIntent" + error);
				reject(new Error("Empty input. Terminated invalid intent request."));
			}
				const faqModel = new FaqModel();
				JarvisLogger.db.debug("faqFound - " + JSON.stringify(faqFound) );
				const faq = 
				/*faqModel.intent = faqFound[0].intent;
				faqModel.answer = faqFound[0].answer;
				faqModel.value = faqFound[0].value;
				console.log('Intent:' + ' ' + faqModel.intent + '\n' + 'Value:' + ' ' + faqModel.value + '\n' + 'Answer:' + ' ' + faqModel.answer);*/

			resolve(faqModel);
			});

		});    
	}

	public async findFaqByIntent(reqIntent: string): Promise<FaqModel> {
		return new Promise<FaqModel>((resolve, reject) => {
			if (!reqIntent || reqIntent.length < 1) {
				JarvisLogger.db.error("Empty input. Terminated invalid intent request.");
				reject(new Error("Empty input. Terminated invalid intent request."));
			}
			
			faqs.find({ intent: reqIntent }, function(error, faqFound) {
			if (error) {
				JarvisLogger.db.error("FaqService findByIntent" + error);
				reject(new Error("Empty input. Terminated invalid intent request."));
			}
				const faqModel = new FaqModel();
				JarvisLogger.db.debug("faqFound - " + JSON.stringify(faqFound) );
				const faq = 
				faqModel.intent = faqFound[0].intent;
				faqModel.answer = faqFound[0].answer;
				faqModel.value = faqFound[0].value;
				JarvisLogger.db.debug("Intent:" + " " + faqModel.intent + "\n" + "Value:" + " " + faqModel.value + "\n" + "Answer:" + " " + faqModel.answer);

			resolve(faqModel);
			});

		});    
	}
}