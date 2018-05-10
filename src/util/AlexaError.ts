"use strict";
import HttpStatus = require("http-status-codes");
import * as i18n from "i18n";

import { JarvisLogger } from "./JarvisLogger";

/**
 * This class is an extension of the Error class
 * and allows method chaining - 'Fluent api'
 *
 * In future more methods can be chained as and when required.
 */
export class AlexaError extends Error {

	private dbConnectionErrorMsg = "not connected to a database";
	private customErrorMsg = "";

	constructor(message?: string) {
		super(message); // 'Error' breaks prototype chain here
		Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
	}

	/**
	 * This creates error messages for the api/endpoint to be dispalyed at the FE.
	 *
	 * @param errorMsg : string
	 * @param status : HttpStatus
	 * @param customErrorMessage : string
	 */
	public setApiMessage(status: number, customErrorMessage: string, errorMsg?: string) {
		if (errorMsg && errorMsg.indexOf(this.dbConnectionErrorMsg) !== -1) {
			this.message = JSON.stringify({ status: HttpStatus.INTERNAL_SERVER_ERROR, error: i18n.__("error.database.connect") });
		} else {
			if (customErrorMessage === "") {
				// Keeping it as a placeholder. Most likely there won't be a default error.
				customErrorMessage = i18n.__("error.default");
			}
			this.message = JSON.stringify({ status, error: customErrorMessage });
		}

		return this;
	}

	/**
	 * This method logs the message to the console
	 * and also in the default log file npm-debug.log
	 *
	 * @param errorMsg : string
	 */
	public setLogMessage(errorMsg: string) {
		JarvisLogger.default.error(JSON.stringify({ time: new Date().toLocaleDateString(), error: errorMsg }));
		return this;
	}

}
