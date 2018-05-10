import {Type, Exclude, plainToClass} from "class-transformer";

import { Quote }  from "../../models/quote/quoter/quoter.model";

/**
 * Alexa Skills Kit TypeScript definitions built from
 * {@link https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference|JSON Interface Reference for Custom Skills}
 */

 'use strict';

 /**
 * The context object provides your skill with information about the 
 * current state of the Alexa service and device at the time the 
 * request is sent to your service. This is included on all requests. 
 * For requests sent in the context of a session (LaunchRequest and 
 * IntentRequest), the context object duplicates the user and 
 * application information that is also available in the session.
 * 
 */
export class Context {
	callbackWaitsForEmptyEventLoop: boolean;
	logGroupName: string;
	logStreamName: string;
	functionName: string;
	memoryLimitInMB: string;
	functionVersion: string;
	invokeid: string;
	awsRequestId: string;
}

/**
 * The request body sent to your service is in JSON format.
 * @example
    {
    "version": "string",
    "session": {
        "new": boolean,
        "sessionId": "string",
        "application": {
        "applicationId": "string"
        },
        "attributes": {
        "string": object
        },
        "user": {
        "userId": "string",
        "accessToken": "string"
        }
    },
    "request": object
    }
 */
export class RequestBody {
	/** The version specifier for the request with the value defined as: “1.0” */
	version: string;
	/** The session object provides additional context associated with the request. */
	session?: Session;
	/** An object that is composed of associated parameters that further describes the user’s request. */
	request: Request;
}

export type Request = LaunchRequest | IntentRequest | SessionEndedRequest;

/**
 * Session Object
 */
export class Session {
	/** 
	 * A boolean value indicating whether this is a new session. 
	 * Returns true for a new session or false for an existing session.
	 *  
	 */
	new: boolean;
	/** 
	 * A string that represents a unique identifier per a user’s active session. 
	 * Note: A sessionId is consistent for multiple subsequent requests for a user and session. 
	 * If the session ends for a user, then a new unique sessionId value is provided for subsequent requests for the same user. 
	 * 
	 */
	sessionId: string;
	/** 
	 * A map of key-value pairs. The attributes map is empty for requests where a new session has started with the attribute new set to true.
     * The key is a string that represents the name of the attribute. Type: string
     * The value is an object that represents the value of the attribute. Type: object
     */
	attributes: any;
	/** An object containing an application ID. This is used to verify that the request was intended for your service. */
	application: SessionApplication;
	/**
     * An object that describes the user making the request.
     * @see SessionUser
     */
	user: SessionUser;
}

/**
 * An object containing an session application ID. 
 * This is used to verify that the request was intended for your service.
 */
export class SessionApplication {
	/**
     * A string representing the application ID for your skill.
     * 
     * Your skill’s application ID is displayed on the Skill 
     * Information page in the developer portal.
     */
	applicationId: string;
}

/** 
 * User object used in Session 
 */
export class SessionUser {
	 /** 
     * A string that represents a unique identifier for the user who 
     * made the request. The length of this identifier can vary, but is 
     * never more than 255 characters. The userId is automatically 
     * generated when a user enables the skill in the Alexa app. Note 
     * that disabling and re-enabling a skill generates a new 
     * identifier. 
     */
	userId: string;
	/** 
     * A token identifying the user in another system. This is only 
     * provided if the user has successfully linked their account.
     * 
     * {@link https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system|Linking an Alexa User with a User in Your System}
     */
	accessToken?: string;
}

export interface LaunchRequest extends RequestBase {
	type: "LaunchRequest";
}

export interface IntentRequest extends RequestBase {
	type: "IntentRequest";
	intent: Intent;
}

export class Slot {
	name: string;
	value: any;
}

/** Represents an intent from a user. */
export class Intent {
	name: string;
	slots: any;
}

export type SessionEndedReason = "USER_INITIATED" | "ERROR" | "EXCEEDED_MAX_REPROMPTS";

export interface SessionEndedRequest extends RequestBase {
	type: "SessionEndedRequest";
	reason: SessionEndedReason;
}

export class RequestBase {
	requestId: string;
	timeStamp: string;
}
/**
 * Response Body Object
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#Response Format
 * @example {
                "version": "string",
                "sessionAttributes": {
                    "string": object
                },
                "response": {
                    "outputSpeech": {
                        "type": "string",
                        "text": "string",
                        "ssml": "string"
                    },
                    "card": {
                        "type": "string",
                        "title": "string",
                        "content": "string",
                        "text": "string",
                        "image": {
                            "smallImageUrl": "string",
                            "largeImageUrl": "string"
                        }
                    },
                    "reprompt": {
                        "outputSpeech": {
                            "type": "string",
                            "text": "string",
                            "ssml": "string"
                        }
                    },
                    "shouldEndSession": boolean
                }
            }
 */
export class ResponseBody {
	/** The version specifier for the response with the value to be defined as: “1.0” */
	version: string;
	/** 
     * A map of key-value pairs to persist in the session.
     * The key is a string that represents the name of the attribute. 
     * Type: string.
     * The value is an object that represents the value of the 
     * attribute. Type: object. 
     * 
     * Session attributes are ignored if included on a response to an 
     * AudioPlayer or PlaybackController request.
     */
	sessionAttributes?: any;
	/**
     * A response object that defines what to render to the user and whether to end the current session.
     * @see Response
     */
	response: Response;
}

/** 
 * Defines what to render to the user and whether to end the current session.
 */
export class Response {
	/**
     * The object containing the speech to render to the user.
     * @see OutputSpeech
     */
	outputSpeech?: OutputSpeech;
	/**
     * The object containing a card to render to the Amazon Alexa App.
     * @see Card
     */
	card?: Card;
	/**
     * The object containing the outputSpeech to use if a re-prompt is necessary.
     * This is used if the your service keeps the session open after sending the response, 
	 * but the user does not respond with anything that maps to an intent defined in your voice interface 
	 * while the audio stream is open.
     * If this is not set, the user is not re-prompted.
     * @see Reprompt
     */
	reprompt?: Reprompt;
	/** A boolean value with true meaning that the session should end, or false if the session should remain active. */
	shouldEndSession: boolean;
}


/** String literal with possible values. Used in place of an enum to allow string type. */
export type OutputSpeechType = "PlainText" | "SSML";

export const OutputSpeechType = {
    PlainText: "PlainText" as OutputSpeechType,
    SSML: "SSML" as OutputSpeechType,
};

/**
 * This object is used for setting both the outputSpeech and the reprompt properties.
 * */
export class OutputSpeech {
    /**
     * A string containing the type of output speech to render. Valid types are:
     *   "PlainText": Indicates that the output speech is defined as plain text.
     *   "SSML": Indicatesthat the output speech is text marked up with SSML.
     */
        type: OutputSpeechType;
    /** A string containing the speech to render to the user. Use this when type is "PlainText" */
    text?: string;
    /** A string containing text marked up with SSML to render to the user. Use this when type is "SSML" */
    ssml?: string;
}

/** 
 * Object describing a card presented to the user in the Alexa app. 
 */
export class Card {
	/**
     * "Simple": A card that contains a title and plain text content.
     * "Standard": A card that contains a title, text content, and an image to display.
     * "LinkAccount": a card that displays a link to an authorization 
     *     URL that the user can use to link their Alexa account with a 
     *     user in another system. See Linking an Alexa User with a 
     *     User in Your System for details. 
     */
	type: "Simple" | "Standard" | "LinkAccount";
	/**
     * A string containing the title of the card. (not applicable for
     * cards of type LinkAccount). 
     */
	title?: string;
	/**
     * A string containing the contents of a Simple card (not 
     * applicable for cards of type Standard or LinkAccount).
     * 
     * Note: Can include line breaks in the content for a card 
     * of type Simple. Use either “\r\n” or “\n” within the text of the 
     * card to insert line breaks. 
     */
	content?: string;
	 /**
     * A string containing the text content for a Standard card (not 
     * applicable for cards of type Simple or LinkAccount)
     * 
     * Note: Can include line breaks in the text for a Standard 
     * card. Use either “\r\n” or “\n” within the text of the card to 
     * insert line breaks. 
     */
	text?: string;
	/**
     * An image object that specifies the URLs for the image to display on a Standard card. Only applicable for Standard cards.
     * 
     * @see Image
     * {@link https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app|Including a Card in Your Skill's Response}
    */
	image?: Image;
}

/**
 * Allows to specify small and large urls for images in cards.
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app
*/
export class Image {
	/** Url for small image. */
	smallImageUrl: string;
	/** Url for large image. */
	largeImageUrl: string;
}

/**
 * A prompt that asks the user a question after a dialogue error has occurred. The general purpose of a re-prompt is to help the user recover from errors. 
 * Example:
 *  User: “Alexa, open Aviva”
 *  Alexa: Welcome to Aviva !. What’s your Postal Code?
 *  User: (no response)
 *  Alexa: “Welcome to Aviva !. What's your Postal Code?”
 * A re-prompt is usually played to encourage the user to respond.
 */
export class Reprompt {
	/** An OutputSpeech object containing the text or SSML to render as a re-prompt. */
	outputSpeech: OutputSpeech;
}

/**
 * Transfer attributes is custom transfer object as input to Request.
 */
export class Attributes {
	/** 
	 * String array to carry the cookies from GI-Service.
	 * To enable the secure communication between GI-Voice-Service and GI-Service,
	 */
	gicookie: string[];

	/** 
	 * Quote for carrying the domain model for Guidewire though GI-Service.
	 */
	@Type(() => Quote)
    quote: Quote;
    /**
     * Vehicle year.
     */
    vehicleYear: string;
    /**
     * Vehicle make.
     */
    vehicleMake: string;
    /**
     * Vehicle model.
     */
    vehicleModel: string;
    /**
     * Voice journey.
     */
    journery: string;
    /**
     * Postal code.
     */
    postalCode: string;
    /**
     * Vehicle year make model.
     */
    yearMakeModel: string;
    /**
     * Age over twenty five.
     */
    isOverTwentyFive: boolean;
    /**
     * Gender.
     */
    gender: string;
    /**
     * Current intent.
     */
    currentIntent: string;
    /**
     * Intent category.
     */
    category: string;
    /**
     * Previous intent.
     */
    previousIntent: string;
    /**
     * request device Id
     */
    deviceId: string;
    /**
     * quoteId
    */
    quoteId: string;
    /**
     * License data
     */
    licenseDate: Date;
    /**
     * GUID to identify the stateless service interation
     */
    GUID: string;
    /**
     * Vehicle purchase date
     */
    vehiclePurchaseDate: string;

    /**
     * Postal code intent attempts
     */
    postalCodeIntentAttempts : number;
    /**
     * Vechicle year intent attempts
     */
    vehicleYearIntentAttempts : number;
    /**
     * Vechicle make intent attempts
     */
    vehicleMakeIntentAttempts : number;
    /**
     * Vechicle model intent attempts
     */
    vehicleModelIntentAttempts : number;
    /**
     * Knowledge base question.
     */
    knowledgebaseQuestion: string;
    /**
     * Knowledge base answer.
     */
    knowledgebaseAnswer: string;
    /**
     * Defaulted Year Make Model for Guidewire.
     */
    defaultYearMakeModel: string;
}
export class Options {

	speechText: string;
	repromptText: string;
	endSession: boolean;
	
	@Type(() => Attributes)
	attributes: Attributes;
	
}
/**
 * Alexa Request Names.
 */
export class RequestNames {
	
	/*A LaunchRequest represents that a user made a request to an Alexa skill, but did not provide a specific intent.*/
	static LaunchRequest = 'LaunchRequest';
	/*An IntentRequest represents a request made to a skill based on what the user wants to do.*/
	static IntentRequest = 'IntentRequest';
	/*A SessionEndedRequest represents a request made to an Alexa skill to notify that a session was ended.*/
    static SessionEndedRequest = 'SessionEndedRequest';
}

/**
 * Alexa Custom Request Names.
 */
export class CustomRequestNames {
    static AutoQuote = 'AutoQuote';
    static AutoInsurance = 'AutoInsurance';
    static PostalCode = 'PostalCode';
    static ReviewPostalCode = 'ReviewPostalCode';
    static YearMakeModel = 'YearMakeModel';
	static VehicleYear = 'VehicleYear';
	static VehicleMake = 'VehicleMake';
    static VehicleModel = 'VehicleModel';
    static ReviewYearMakeModel = 'ReviewYearMakeModel';
	static AgeIntent = 'AgeIntent';
    static GenderIntent = 'GenderIntent';
    static FAQIntent = 'FAQIntent';
    static ReviewTerms = 'ReviewTerms';
    static UserConfirmation = 'UserConfirmation';
    static CatchAllQuestions = 'CatchAllQuestions';
}

/**
 * Alexa Custom Journey Request Names.
 */
export class CustomJourneyRequestNames {
    static AutoQuote = 'AutoQuote';
    static AutoInsurance = 'AutoInsurance';
}

/**
 * Alexa Custom Intent Category Names.
 */
export class CustomIntentCategoryName {
    static PostalCodeCategory = 'PostalCodeCategory';
    static YearMakeModelCategory = 'YearMakeModelCategory';
    static AgeCategory = 'AgeCategory';
    static GenderCategory = 'GenderCategory';
    static KnowledgeBaseCategory = 'KnowledgeBaseCategory';
}

/**
 * Alexa custom validation constants for intent and intent group.
 */
export class CustomIntentInitalValues {
    static NotInitiated = 'NotInitiated';
}