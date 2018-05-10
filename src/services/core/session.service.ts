import * as fs from "fs";
import * as path from "path";
import { NextFunction, Request, Response } from "express";

import { JarvisLogger } from "../../util/JarvisLogger";
import { Quote }  from "../../models/quote/quoter/quoter.model";
import * as Type from "../../models/core/alexa.model";
import { default as Voice , VoiceModel } from "../../models/voice-session.model";

/**
 * REST web service local session management.
 */
export class SessionService {
	/**
	 * This method used to read default quote json file and returng a Quote object.
	 */
	public async getDefaultQuote(): Promise<Quote> {
		let quote: Quote = new Quote();
		const inputFile = "../../../src/data/quote.json";
		const actualfile = await dataFromFile(inputFile);
		// logger.info('actualfile '+ actualfile);
		if (actualfile) {
			quote = JSON.parse(actualfile);
			// logger.info('quote object '+ quote);
		}
		return quote;
	}

	/**
	 * This method primary used to read session attributes from local file system.
	 * Primarly used for local testing.
	 */
	public async getSession(): Promise<Type.Attributes> {
		let attributes: Type.Attributes = new Type.Attributes();
		const inputFile = "../../session.json";
		const actualfile = await dataFromFile(inputFile);
		// logger.info('actualfile '+ actualfile);
		if (actualfile) {
			attributes = JSON.parse(actualfile);
			// logger.info('quote object '+ quote);
		}
		return attributes;
	}

	/**
	 * This method primary used to save session attributes to local file system.
	 * Primarly used for local testing.
	 */
	public async saveSession(data: Type.Attributes): Promise<any> {
		const sessionAttributes: Type.Attributes = new Type.Attributes();
		const inputFile = "../../session.json";
		const actualfile = await dataToFile(inputFile, data);
		// logger.info('actualfile '+ actualfile);
		return actualfile;
	}

	/**
	 * This method primary used to create response document in database.
	 * Primarly used for persisting the generated quted response while serving requests.
	 */
	public async createResponseDocument(responseData: Type.ResponseBody): Promise<any> {
		const responseSave = await createDocument(responseData);
		return responseSave;
	}

	/**
	 * This method primary used to find response document in database using deviceId and quoteId.
	 * Primarly used for find the updated response document wiht quoted data.
	 */
	public async findResponseDocument(sessionAttributes: Type.Attributes): Promise<any> {
		const response = await findDocument(sessionAttributes);
		return response;
	}

	/**
	 * This method primary used to find response document in database using deviceId and quoteId. - HARDCODED
	 * Primarly used for find the updated response document wiht quoted data.
	 */
	public async findHardCodedResponseDocument(sessionAttributes: Type.Attributes): Promise<any> {
		const response = await findHardCodedDocument();
		return response;
	}
}

// Helper method to read data from the file system.
function dataFromFile(sampleFile: string): Promise<any> {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname, sampleFile), "utf-8", (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

// Helper method to write data to the file system.
function dataToFile(sampleFile: string, data: Type.Attributes): Promise<any> {
	return new Promise((resolve, reject) => {
		fs.writeFile(path.join(__dirname, sampleFile), JSON.stringify(data), function(err) {
			if (err) reject(err);
			else resolve(data);
		});
	});
}

/**
 * Helper method to create a new reponse document in the database.
 * @param responseData 
 */
function createDocument(responseData: Type.ResponseBody): Promise<any> {
	JarvisLogger.db.debug('SessionService createDocument\n deviceId \n'+ responseData.sessionAttributes.deviceId + 'quoteId \n' + responseData.sessionAttributes.quoteId);
	return new Promise((resolve, reject) => {
		//stringify response
		let sResponse = JSON.stringify(responseData);
				
		//save response to database as document
		Voice.create({response: sResponse, deviceId: responseData.sessionAttributes.deviceId, quoteId: responseData.sessionAttributes.quoteId, GUID: responseData.sessionAttributes.GUID}, function(err, responseSave) {
			if (err) {
				JarvisLogger.db.error('err '+ err.message);
				throw new Error("Error while saving the voice response : " + err.message); 
			}else {
				JarvisLogger.db.debug("SessionService createDocument create responseSave "+responseSave);
				resolve(responseSave);
			}
			JarvisLogger.db.debug("SessionService createDocument CREATE response "+responseSave);			
		});
	});
}

/**
 * Helper method to find an existing reponse document in the database based on deviceId and QuoteId.
 * Using deviceId and quoteId.
 * @param responseData 
 */
function findDocument(sessionAttributes: Type.Attributes): Promise<any> {
	JarvisLogger.db.debug('SessionService findDocument\n deviceId \n'+ sessionAttributes.deviceId + 'GUID \n' + sessionAttributes.GUID);
	return new Promise((resolve, reject) => {
						
		//find one response to database as document
		Voice.findOne({ deviceId: sessionAttributes.deviceId, GUID: sessionAttributes.GUID}, function(err, response) {
			if (err) {
				JarvisLogger.db.error('err '+ err.message);
				throw new Error("Error while finding the voice response : " + err.message); 
			}else {
				JarvisLogger.db.debug("SessionService findDocument found response "+response);
				resolve(response);
			}	
			JarvisLogger.db.debug("SessionService findDocument FIND response "+response);	
		});
	});
}


/**
 * Helper method to find an existing reponse document in the database based on deviceId and QuoteId. - HARDCODED
 * Using deviceId and quoteId.
 * @param responseData 
 */
function findHardCodedDocument(): Promise<any> {
	const deviceId = 'amzn1.ask.device.AHJHSGZA2V4RGE3P422TRPV6FPWY7UWH2TKQLELW4GIG4T4OJ7QKOM3XXARQEBKWL7R5AHDH37OELJVWVYXEEB66ECKBOLIBEKZP5RNI6LR4NF5AJWYMAB5DIZVMK5Z3GDZN5YRSPPCCHUI7YIIGF7XYAC7Q';
	const GUID = 'fbaf2ccb-42ba-4cbb-8068-7493c6e5b062';
	JarvisLogger.db.debug('SessionService findHardCodedDocument - HARDCODED \n deviceId \n'+ deviceId + 'GUID \n' + GUID);
	return new Promise((resolve, reject) => {
						
		//find one response to database as document
		Voice.findOne({ deviceId: deviceId, GUID: GUID}, function(err, response) {
			if (err) {
				JarvisLogger.db.error('err '+ err.message);
				throw new Error("Error while finding the voice response : " + err.message); 
			}else {
				JarvisLogger.db.debug("SessionService findHardCodedDocument found response "+response);
				resolve(response);
			}	
			JarvisLogger.db.debug("SessionService findHardCodedDocument FIND response "+response);	
		});
	});
}
