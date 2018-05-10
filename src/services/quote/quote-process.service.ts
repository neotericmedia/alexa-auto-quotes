import { NextFunction, Request, Response } from "express";
import * as Type from '../../models/core/alexa.model';
import HttpStatus = require('http-status-codes');
import { JarvisLogger } from "../../util/JarvisLogger";
import { logger } from "../../util/Logger";
import { ResponseBuilderService } from '../../services/core/response-builder.service';
import { Quote }  from "../../models/quote/quoter/quoter.model";
import { SessionService } from '../../services/core/session.service';
import { QuoteService } from '../../services/quote/core/quote-quote.service';
import { default as Voice , VoiceModel } from "../../models/voice-session.model";
import { AlexaError } from '../../util/AlexaError';

/**
* Quote processing service.
*/
export class QuoteProcessService {

   private builderService: ResponseBuilderService;
   private sessionService: SessionService;
   private quoteService: QuoteService;

   constructor(){              
       this.builderService = new ResponseBuilderService();   
       this.sessionService = new SessionService();           
       this.quoteService = new QuoteService();        
     }



   /**
    * Individual methods for Save-Save-Quote
    */
    public getQuotedResponse(licensedate:Date, sessionAttributes:Type.Attributes): Promise<Quote> {
        JarvisLogger.guidewire.debug('-----STEP1----\nQuoteProcessingService getQuotedResponse');
        return this.getInitialResponseQuote(licensedate, sessionAttributes).then((responseQuote) => {
            JarvisLogger.guidewire.debug('-----STEP2----\nQuoteProcessingService getQuotedResponse getInitialResponseQuote responseQuote.quoteNumber ' + responseQuote.quoteNumber);
            return this.getUpdatedResponseQuote(responseQuote,sessionAttributes).then((responseQuote) => {
                JarvisLogger.guidewire.debug('-----STEP3----\nQuoteProcessingService getQuotedResponse getInitialResponseQuote getUpdatedResponseQuote');
                return Promise.resolve(this.getFinalResponseQuote(responseQuote,sessionAttributes));
            })
        });
    }
   
   public async getInitialResponseQuote(licensedate:Date, sessionAttributes:Type.Attributes): Promise<Quote> {
        JarvisLogger.guidewire.debug('-----STEP1--1--\nQuoteProcessingService getInitialResponseQuote');
        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            JarvisLogger.guidewire.debug('NODE_TEST_LOCAL is Y');
            sessionAttributes = await this.sessionService.getSession(); 
        }

        let options = new Type.Options();

        //updated session
        options.attributes = sessionAttributes;

        JarvisLogger.guidewire.debug('-----STEP1--1--\nQuoteProcessingService getInitialResponseQuote licensedate ' + licensedate);
        sessionAttributes.quote.quoteDraft.autoDraft.listOfDrivers[0].listOfLicenceClasses[0].dateLicense = licensedate;
        
        JarvisLogger.guidewire.debug('-----STEP1--1--\nQuoteProcessingService getInitialResponseQuote : sessionAttributes \n' + JSON.stringify(sessionAttributes));
        let responseQuote = await this.quoteService.saveQuote(sessionAttributes);
        JarvisLogger.guidewire.debug('-----STEP1--1--\nQuoteProcessingService getInitialResponseQuote : quoteService.saveQuote : responseQuote \n' + JSON.stringify(responseQuote));
        return responseQuote;
            
     }

      public async getUpdatedResponseQuote(responseQuote:Quote, sessionAttributes:Type.Attributes): Promise<Quote> {
        JarvisLogger.guidewire.debug('-----STEP1--2--\nQuoteProcessingService getUpdatedResponseQuote');

        //throw exception if respone quote is undefined for some reason.
        if(responseQuote === undefined){
            JarvisLogger.guidewire.error("QuoteProcessService getUpdatedResponseQuote : responseQuote is undefined");
            throw new AlexaError(JSON.stringify({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'QuoteProcessService getUpdatedResponseQuote : responseQuote is undefined'
            }));
        }

        let options = new Type.Options();
        //initialize with previous session
        options.attributes = sessionAttributes;
        //update current session with latest quote.
        sessionAttributes.quote = responseQuote;
        //update selectedQuotePublicID in current quote.
        responseQuote.selectedQuotePublicID = responseQuote.listOfOfferedQuotes[0].id;
        JarvisLogger.guidewire.debug('-----STEP1--2--\nQuoteProcessingService getUpdatedResponseQuote responseQuote.selectedQuotePublicID (-) ' + responseQuote.selectedQuotePublicID);
        //update session quote with curent updated quote along with selectedQuotePublicID
        options.attributes.quote = responseQuote;

        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            JarvisLogger.guidewire.debug('NODE_TEST_LOCAL is Y');
            this.sessionService.saveSession(options.attributes);
        }
        JarvisLogger.guidewire.debug('-----STEP1--2--\nQuoteProcessingService getUpdatedResponseQuote sessionAttributes (-) ' + sessionAttributes);
        let updateResponseQuote = await this.quoteService.saveQuote(sessionAttributes);
        JarvisLogger.guidewire.debug('-----STEP1--2--\nQuoteProcessingService getUpdatedResponseQuote : quoteService.saveQuote : updateResponseQuote \n' + JSON.stringify(updateResponseQuote));
        return updateResponseQuote;       
     }

     public async getFinalResponseQuote(updateResponseQuote:Quote, sessionAttributes:Type.Attributes): Promise<Quote> {
        JarvisLogger.guidewire.debug('-----STEP1--3--\nQuoteProcessingService getFinalResponseQuote');

        //throw exception if respone quote is undefined for some reason.
        if(updateResponseQuote === undefined){
            JarvisLogger.guidewire.error("QuoteProcessService getFinalResponseQuote : updateResponseQuote is undefined");
            throw new AlexaError(JSON.stringify({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'QuoteProcessService getFinalResponseQuote : updateResponseQuote is undefined'
            }));
        }

        let options = new Type.Options();
        //initialize with previous session
        options.attributes = sessionAttributes;
        //update current session with latest quote.
        sessionAttributes.quote = updateResponseQuote;
        //update session quote with curent updated quote.
        options.attributes.quote = updateResponseQuote;

        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            JarvisLogger.guidewire.debug('NODE_TEST_LOCAL is Y');
            this.sessionService.saveSession(options.attributes);
        }

        JarvisLogger.guidewire.debug('-----STEP1--3--\nQuoteProcessingService getFinalResponseQuote quoteService.quoteQuote');
        let quotedResponseQuote = await this.quoteService.quoteQuote(sessionAttributes);
        JarvisLogger.guidewire.debug('-----STEP1--3--\nQuoteProcessingService getFinalResponseQuote : quoteService.saveQuote : quotedResponseQuote \n' + JSON.stringify(quotedResponseQuote));
        //update current session with final quote quote.
        sessionAttributes.quote = quotedResponseQuote;

        //update session with quote Id
        sessionAttributes.quoteId = quotedResponseQuote.quoteNumber;

        //update session quote with final quote quote.
        options.attributes.quote = quotedResponseQuote;

        //update session with final quote and it's quote number
        options.attributes.quoteId = quotedResponseQuote.quoteNumber;

        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            JarvisLogger.guidewire.debug('NODE_TEST_LOCAL is Y');
            this.sessionService.saveSession(options.attributes);
        }

        let monthlyPremium = quotedResponseQuote.listOfOfferedQuotes[0].monthlyPremium

        JarvisLogger.guidewire.debug('-----STEP1--3--\nQuoteProcessingService getFinalResponseQuote : monthlyPremium ' + monthlyPremium);

        // build final quote response
        let quotedResponseBody = await this.buildQuotedResponse(sessionAttributes);

        //stringify response
        //let finalData = JSON.stringify(quotedResponseBody);

        JarvisLogger.guidewire.debug('-----STEP3--3--\nQuoteProcessingService getFinalResponseQuote :  quotedResponseBody ' + JSON.stringify(quotedResponseBody));

        JarvisLogger.guidewire.debug('-----STEP3--3--\nQuoteProcessingService getFinalResponseQuote :  sessionService.createResponseDocument ');
        
        //save to database the final quote response
        const responseRetrived = await this.sessionService.createResponseDocument(quotedResponseBody);

        return quotedResponseQuote;
     }

     /**
     * @param sessionAttributes 
     */
    public async buildQuotedResponse(sessionAttributes: Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.guidewire.debug('-----STEP3--3-part1-\nQuoteProcessingService buildQuotedResponse');
        //to test locally
        if (String(process.env.NODE_TEST_LOCAL) == 'Y') {
            JarvisLogger.guidewire.debug('NODE_TEST_LOCAL is Y');
            sessionAttributes = await this.sessionService.getSession();
        }

        //get final monthly premium.
        let monthlyPremium = sessionAttributes.quote.listOfOfferedQuotes[0].monthlyPremium;

        let responseBody = this.builderService.confirmYesReviewTermsBuildResponse(monthlyPremium, sessionAttributes);
        return Promise.resolve(responseBody);

    }
}