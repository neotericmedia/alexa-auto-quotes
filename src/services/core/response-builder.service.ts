// import { Request, Response } from 'express';
import { injectable } from "inversify";
import { AlexaError } from "../../util/AlexaError";
import * as Type from "../../models/core/alexa.model";
import { Vehicle } from '../../models/quote/lob/auto/vehicles/vehicle.model';
import { JarvisLogger } from "../../util/JarvisLogger";
import HttpStatus = require("http-status-codes");
import * as i18n from "i18n";
import { Guid } from "../../util/Guid";


/**
 * Service class for logic related
 * to the voice response.
 */
@injectable()
export class ResponseBuilderService {

	private error: AlexaError;
	private responseBody: Type.ResponseBody;

	constructor() {
		this.error = new AlexaError();
		this.responseBody =  new Type.ResponseBody();
	}

	/**
	 * Function to build resposen based on options.
	 */
	public buildResponse(options: Type.Options): Type.ResponseBody {
		
		// TODO: remove hardcode values
		
		//Output speech
		const responseOutputSpeech = new Type.OutputSpeech();
		responseOutputSpeech.type = Type.OutputSpeechType.SSML;
		responseOutputSpeech.ssml = "<speak>" + options.speechText + "</speak>";

		const response: Type.Response = new Type.Response();
		response.outputSpeech = responseOutputSpeech
		response.shouldEndSession = options.endSession;

		this.responseBody.version = "1.0";
		this.responseBody.response = response;
	
		//Re-prompt
		if (options.repromptText) {
			const repromptOutputSpeech = new Type.OutputSpeech();
			repromptOutputSpeech.type = Type.OutputSpeechType.SSML;
			repromptOutputSpeech.ssml = "<speak>" + options.repromptText + "</speak>";

			const reprompt: Type.Reprompt = new Type.Reprompt();
			reprompt.outputSpeech = repromptOutputSpeech;
			this.responseBody.response.reprompt = reprompt;
		}

		if (options.attributes) {
			this.responseBody.sessionAttributes = options.attributes;
		}

		return this.responseBody;
	}

	/**
	 * Function to build resposen based on options with cards.
	 */
	public buildResponseWithCard(cardSpeech: string, options: Type.Options): Type.ResponseBody {
		
		//get build response.
		let responseBody =  this.buildResponse(options);

		//Card
		const card: Type.Card = new Type.Card();
		card.content = cardSpeech;
		card.title = "Ask Aviva";
		card.type = "Simple";
		responseBody.response.card = card;
		
		return responseBody;
	}


	/**
	 * Function to build response with card by reseting the session and initialize with same deviceId
	 * and assing a new GUID.
	 */
	public clearSessionBuildResponsewithCard(deviceId: string, speechText: string, repromptText: string): Type.ResponseBody {
		
		//get build response.
		let responseBody =  this.clearSessionBuildResponse(deviceId, speechText, repromptText);

		//Card
		const card: Type.Card = new Type.Card();
		card.content = speechText;
		card.title = "Ask Aviva";
		card.type = "Simple";
		responseBody.response.card = card;
		
		return responseBody;
	}

	/**
	 * Function to build response by reseting the session and initialize with same deviceId
	 * and assing a new GUID.
	 */
	public clearSessionBuildResponse(deviceId: string, speechText: string, repromptText: string): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService clearSessionBuildResponse');
		let options = new Type.Options();
        
        //create new session and re-initialize session state
		let sessionAttributes:Type.Attributes = new Type.Attributes();

		//set session with same deviceId from existing session.
        sessionAttributes.deviceId = deviceId;

        //reset session journey is not initiated
        sessionAttributes.journery = Type.CustomIntentInitalValues.NotInitiated;

        //reset session category is not initiated
        sessionAttributes.category = Type.CustomIntentInitalValues.NotInitiated;
        
        //reset session with GUID to identify the stateless service interation.
		sessionAttributes.GUID = Guid.newGuid();
		
		//reset session postal code intent attempts to 0
		sessionAttributes.postalCodeIntentAttempts = 0;
		
		//reset session vechicle year intent attempts to 0
		sessionAttributes.vehicleYearIntentAttempts = 0;
		
		//reset session vehicle make intent attempts to 0
		sessionAttributes.vehicleMakeIntentAttempts = 0;
		
		//reset session vehicel model intent attempts to 0
		sessionAttributes.vehicleModelIntentAttempts = 0;

		//initialize speech text
		options.speechText = speechText;
		//initialize re-prompt speech text
        options.repromptText = repromptText;
		
        //continue session
		options.endSession = false;
		
		//option intialize with reset session state
		options.attributes = sessionAttributes;
		
		const responseBody = this.buildResponse(options);
		
		return responseBody;
	}

	/**
	 * Function to build main menu response, 
	 * by reseting the session and initialize with same deviceId
	 * and assing a new GUID.
	 */
	public mainMenuBuildResponse(deviceId: string): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService mainMenuBuildResponse - Jump to main menu : options ');
		const speechText = i18n.__('mainMenuBuildResponseSpeech');
		const responseBody = this.clearSessionBuildResponse(deviceId, speechText, speechText);
		JarvisLogger.default.debug('ResponseBuilderService mainMenuBuildResponse - Jump to main menu : options '+ JSON.stringify(responseBody));	
		return responseBody;
	}

		/**
	 * Function to build unsupported response, 
	 * by reseting the session and initialize with same deviceId with sorry message
	 * and assing a new GUID.
	 */
	public unsupportedBuildResponse(deviceId: string): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService unsupportedBuildResponse');
		const speechText = i18n.__('unsupportedBuildResponseSpeech');
		const responseBody = this.clearSessionBuildResponse(deviceId, speechText, speechText);
		JarvisLogger.default.debug('ResponseBuilderService unsupportedBuildResponse : options '+ JSON.stringify(responseBody));	
		return responseBody;
	}
	
	/**
	 * Function to build response for not understood usecase.
	 */
	public notUnderstoodBuildResponse(options: Type.Options): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService notUnderstoodBuildResponse - Jump to same step ');
		options.speechText = i18n.__('notUnderstoodBuildResponseSpeech', { postalCodeValue: options.speechText } );
		options.repromptText = i18n.__('notUnderstoodBuildResponseReprompt', { postalCodeValue: options.repromptText } );
		// options.speechText = `Sorry I don't understand that. ${options.speechText}`;
		// options.repromptText = `Sorry I don't understand that. ${options.repromptText}`;
		JarvisLogger.default.debug('ResponseBuilderService notUnderstoodBuildResponse - Jump to same step : options \n'+ JSON.stringify(options));
		return this.buildResponse(options);
	}

	/**
	 * Function to build launch request response, 
	 * by reseting the session and initialize with same deviceId
	 * and assing a new GUID.
	 */
	public launchRequestBuildResponse(deviceId: string): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService launchRequestBuildResponse');
		const speechText = i18n.__('launchRequestBuildResponseSpeech');
		const repromptText = i18n.__('launchRequestBuildResponseReprompt');
		let responseBody = this.clearSessionBuildResponse(deviceId, speechText , repromptText);

		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build auto quote response, 
	 * by reseting the session and initialize with same deviceId
	 * and assing a new GUID.
	 */
	public quoterIntentBuildResponse(deviceId: string): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService quoterIntentBuildResponse');
		const speechText = i18n.__('quoterIntentBuildResponseSpeech');
        const repromptText = i18n.__('quoterIntentBuildResponseReprompt');
		let responseBody = this.clearSessionBuildResponse(deviceId, speechText , repromptText);
		//udpate session journey as AutoQuote
        responseBody.sessionAttributes.journery = Type.CustomJourneyRequestNames.AutoQuote;
        //updated session with intent category - Postal Code Intent
		responseBody.sessionAttributes.category = Type.CustomIntentCategoryName.PostalCodeCategory;
		//update session with current intent name
		responseBody.sessionAttributes.currentIntent = Type.CustomRequestNames.AutoQuote;
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build auto insurance (FAQ) response, 
	 * by reseting the session and initialize with same deviceId
	 * and assing a new GUID.
	 */
	public faqBuildResponse(deviceId: string): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService faqBuildResponse');
		const speechText = i18n.__('faqBuildResponseSpeech');
		const repromptText = i18n.__('faqBuildResponseReprompt');
		let responseBody = this.clearSessionBuildResponse(deviceId, speechText , repromptText);
        //update session journey as AutoInsurance
        responseBody.sessionAttributes.journery = Type.CustomJourneyRequestNames.AutoInsurance;
        //updated session with intent category - not initialize
		responseBody.sessionAttributes.category = Type.CustomIntentInitalValues.NotInitiated;
		//update session with current intent name
		responseBody.sessionAttributes.currentIntent = Type.CustomRequestNames.AutoInsurance;
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build valid postal code response, 
	 * using same deviceId and session.
	 */
	public validPostalCodeBuildResponse(postalCodeValue: string, sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.guidewire.debug('ResponseBuilderService validPostalCodeBuildResponse');
		let options = new Type.Options();
		options.speechText = i18n.__('validPostalCodeBuildResponseSpeech', { postalCodeValue: postalCodeValue } );
		options.repromptText = i18n.__('validPostalCodeBuildResponseReprompt', { postalCodeValue: postalCodeValue } );
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.PostalCode;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}


	/**
	 * Function to build not valid postal code response, 
	 * using same deviceId and session.
	 */
	public notValidPostalCodeBuildResponse(postalCodeValue: string, sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService notValidPostalCodeBuildResponse');
		let options = new Type.Options();
		options.speechText = i18n.__('notValidPostalCodeBuildResponseSpeech', { postalCodeValue: postalCodeValue } );
		options.repromptText = i18n.__('notValidPostalCodeBuildResponseReprompt', { postalCodeValue: postalCodeValue } );
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.PostalCode;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response for year of the vehicle 
	 * using same deviceId and session.
	 */
	public vehicleYearBuildResponse(index: number, vehicleYear: string, sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService vehicleYearBuildResponse');
		let options = new Type.Options();

		//conditional speech text
        if (index !== -1) {
            JarvisLogger.default.debug('ResponseBuilderService vehicleYearBuildResponse (vehYears === vehicleYear) YES matching at index = '+index );
            //update session with vechile year.
			sessionAttributes.vehicleYear = vehicleYear;        
			options.speechText = i18n.__('vehicleYearBuildResponseMake' );
			options.repromptText = i18n.__('vehicleYearBuildResponseMake' );
        }else {
            JarvisLogger.default.debug('ResponseBuilderService vehicleYearBuildResponse (vehYears === vehicleYear) NO matching in the vehicle year list ');
			options.speechText = i18n.__('vehicleYearBuildResponseYear' );
			options.repromptText = i18n.__('vehicleYearBuildResponseYear' );
        }
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.VehicleYear;
        //updated session
		options.attributes = sessionAttributes;
		//continue session
        options.endSession = false;

        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response for make of the vehicle 
	 * using same deviceId and session.
	 */
	public vehicleMakeBuildResponse(index: number, vehicleMakeValue: string, sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService vehicleMakeBuildResponse');
		let options = new Type.Options();

		//conditional speech text
        if (index !== -1) {
            JarvisLogger.default.debug('ResponseBuilderService vehicleMakeBuildResponse (vehMakes === vehicleMake) YES matching at index = '+index );
            //update session with vechile make.
            sessionAttributes.vehicleMake = vehicleMakeValue;            
			options.speechText = i18n.__('vehicleYearBuildResponseModel' );
			options.repromptText = i18n.__('vehicleYearBuildResponseModel' );

        }else {
            JarvisLogger.default.debug('ResponseBuilderService vehicleMakeBuildResponse (vehMakes === vehicleMake) NO matching in the vehicle make list ');
            //reprompt to make intent
			options.speechText = i18n.__('vehicleYearBuildResponseMake' );
			options.repromptText = i18n.__('vehicleYearBuildResponseMake' );
            
        }
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.VehicleMake;
        //updated session
		options.attributes = sessionAttributes;
		//continue session
        options.endSession = false;

        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}


	/**
	 * Function to build response for model of the vehicle found
	 * using same deviceId and session.
	 */
	public vehicleModelFoundBuildResponse(sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService vehicleModelFoundBuildResponse');
		let options = new Type.Options();
		options.speechText = i18n.__('vehicleModelFoundBuildResponseSpeech', { yearMakeModel: sessionAttributes.yearMakeModel } );
		options.speechText = i18n.__('vehicleModelFoundBuildResponseReprompt', { yearMakeModel: sessionAttributes.yearMakeModel } );
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.VehicleModel;
        //updated session
		options.attributes = sessionAttributes;
		//continue session
        options.endSession = false;

        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response for model of the vehicle not found.
	 * using same deviceId and session.
	 */
	public vehicleModelNotFoundBuildResponse(yearMakeModelValue: string, sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService vehicleModelNotFoundBuildResponse');
		let options = new Type.Options();
		//check for yearMakeModelValue is empty
		if(yearMakeModelValue === ''){
			options.speechText = i18n.__('vehicleYearBuildResponseYear' );
			options.repromptText = i18n.__('vehicleYearBuildResponseYear' );
		}else{
			options.speechText = i18n.__('vehicleModelNotFoundBuildResponse', { yearMakeModelValue: yearMakeModelValue} );
			options.repromptText = i18n.__('vehicleYearBuildResponseYear' );
		}

		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.VehicleModel;
        //updated session
		options.attributes = sessionAttributes;
		//continue session
        options.endSession = false;

        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}


	/**
	 * Function to build response confirmation Yes for Age intent, 
	 * using same deviceId and session.
	 */
	public confirmYesAgeBuildResponse(sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService getQuoteBuildResponse');
		let options = new Type.Options();
		options.speechText = i18n.__('confirmYesAgeBuildResponseSpeech' );
		options.repromptText = i18n.__('confirmYesAgeBuildResponseReprompt' );
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.UserConfirmation;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response confirmation No for Age intent, 
	 * using same deviceId and session.
	 */
	public confirmNoAgeBuildResponse(sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService quotedBuildResponse');
		let options = new Type.Options();
		options.speechText = i18n.__('confirmNoAgeBuildResponseSpeech' );
		options.repromptText = i18n.__('confirmNoAgeBuildResponseReprompt' );
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.UserConfirmation;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}


	/**
	 * Function to build response confirmation Yes for ReviewTerms intent to generate the final quote, 
	 * using same deviceId and session.
	 */
	public confirmYesReviewTermsBuildResponse(monthlyPremium: number, sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService quotedBuildResponse');
		let options = new Type.Options();		
		const cardSpeech = i18n.__('confirmYesReviewTermsBuildResponseCard' );
		options.speechText = i18n.__('confirmYesReviewTermsBuildResponseSpeech' );
		options.repromptText = i18n.__('confirmYesReviewTermsBuildResponseReprompt' );

		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.UserConfirmation;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponseWithCard(cardSpeech, options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response confirmation Yes for year/make/model, 
	 * using same deviceId and session.
	 */
	public confirmYesYearMakeModelBuildResponse(sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService confirmYesYearMakeModelBuildResponse');
		let options = new Type.Options();
		options.speechText = i18n.__('confirmYesReviewTermsBuildResponseSpeechText' );
		options.repromptText = i18n.__('confirmYesReviewTermsBuildResponseReprompt' );
		//updated session with intent category - Age Intent
		sessionAttributes.category = Type.CustomIntentCategoryName.AgeCategory;
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.UserConfirmation;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response for confirmation No for year/make/model,
	 * using same deviceId and session.
	 */
	public confirmNoYearMakeModelBuildResponse(sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService confirmYesYearMakeModelBuildResponse');
		let options = new Type.Options();
		//reprompt user for vechile year.
		options.speechText = i18n.__('vehicleYearBuildResponseYear' );
		options.repromptText = i18n.__('vehicleYearBuildResponseYear' );
		//reset session values of vehicle year.
		sessionAttributes.vehicleYear = '';
		//reset session values of vehicle make.
		sessionAttributes.vehicleMake = '';
		//reset session values of vehicle model.
		sessionAttributes.vehicleModel = '';
		//reset session values of vehicle Year/Make/Model.
		sessionAttributes.yearMakeModel = '';
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.UserConfirmation;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response confirmation Yes to postal code, 
	 * using same deviceId and session.
	 */
	public confirmYesPostalCodeBuildResponse(sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService confirmYesPostalCodeBuildResponse');
		let options = new Type.Options();
		options.speechText = i18n.__('vehicleYearBuildResponseYear' );
		options.repromptText = i18n.__('vehicleYearBuildResponseYear' );
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.UserConfirmation;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response confirmation No to postal code, 
	 * using same deviceId and session.
	 */
	public confirmNoPostalCodeBuildResponse(sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService confirmNoPostalCodeBuildResponse');
		let options = new Type.Options();
        options.speechText = i18n.__('quoterIntentBuildResponseReprompt');
		options.repromptText = i18n.__('quoterIntentBuildResponseReprompt');
		//update current session with current intent name
		sessionAttributes.currentIntent = Type.CustomRequestNames.UserConfirmation;
        //updated session with current session
		options.attributes = sessionAttributes;
		//continue session
		options.endSession = false;
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response for AMAZON.StopIntent or AMAZON.CancelIntent
	 * clear details session.
	 */
	public stopCancelBuildResponse(): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService stopCancelBuildResponse');
		let options = new Type.Options();
		//create new session and ignore existing session details
		let sessionAttributes:Type.Attributes = new Type.Attributes();  
		//clear session
		options.attributes = sessionAttributes;
		//good bye message
		options.speechText = i18n.__('stopCancelBuildResponseSpeech');		
		//terminate session
		options.endSession = true; 
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}

	/**
	 * Function to build response for AMAZON.HelpIntent
	 * using same deviceId and session.
	 */
	public helpBuildResponse(sessionAttributes:Type.Attributes): Type.ResponseBody {
		JarvisLogger.default.debug('ResponseBuilderService stopCancelBuildResponse');
		let options = new Type.Options();
		//continue session
		options.endSession = false;
		//updated session
		options.attributes = sessionAttributes;

		if(sessionAttributes.category === Type.CustomIntentCategoryName.PostalCodeCategory){
			options.speechText = i18n.__('helpBuildResponsePostalCodeCategorySpeech');		
			options.repromptText = i18n.__('helpBuildResponsePostalCodeCategoryReprompt');		
		}else if(sessionAttributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory){
			options.speechText = i18n.__('helpBuildResponseYearMakeModelCategorySpeech');		
			options.repromptText = i18n.__('helpBuildResponseYearMakeModelCategoryReprompt');	
		}else if(sessionAttributes.category === Type.CustomIntentCategoryName.AgeCategory){
			options.speechText = i18n.__('helpBuildResponseAgeCategorySpeech');	
			options.repromptText = i18n.__('helpBuildResponseAgeCategoryReprompt');	
		}else if(sessionAttributes.category === Type.CustomIntentCategoryName.GenderCategory){
			options.speechText = i18n.__('helpBuildResponseGenderCategorySpeech');	
			options.repromptText = i18n.__('helpBuildResponseGenderCategoryReprompt');	
		}else {
			options.speechText = i18n.__('helpBuildResponseSpeech');	
			options.repromptText = i18n.__('helpBuildResponseReprompt');	
		}
        let responseBody = this.buildResponse(options);
		JarvisLogger.default.debug("RESPONSE : ", JSON.stringify(responseBody));
		return responseBody;
	}
}
