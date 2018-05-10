import { NextFunction, Request, Response } from "express";
import * as Type from '../../models/core/alexa.model';

import { logger } from "../../util/Logger";
import { ResponseBuilderService } from '../core/response-builder.service';
import { Quote }  from "../../models/quote/quoter/quoter.model";
import { SessionService } from '../core/session.service';
import { QuoteService } from '../quote/core/quote-quote.service';

//TODO - not used  to be deleted - srini
/**
* Launch Request Intent.
* SessionEndedRequest Service.
*/
export class QuoteResponseService {

   private builderService: ResponseBuilderService;
   private sessionService: SessionService;
   private quoteService: QuoteService;

   constructor(){              
       this.builderService = new ResponseBuilderService();   
       this.sessionService = new SessionService();           
       this.quoteService = new QuoteService();        
     }

   public async getQuoterIntent(): Promise<Type.ResponseBody> {

        let attribute = new Type.Attributes();
        //udpate session journey as AutoQuote
        attribute.journery = Type.CustomJourneyRequestNames.AutoQuote;

        //updated session with intent category - Postal Code Intent
        attribute.category = Type.CustomIntentCategoryName.PostalCodeCategory;

        let options = new Type.Options();
        options.speechText = "Great, lets get started for an auto quote. What is your postal code ?",
        options.repromptText = "Lets get started for an auto quote. What is your postal code ?",       
        options.attributes = attribute;
        options.endSession = false;

        let responseBody = this.builderService.buildResponse(options);
        return responseBody;

   }

   /**
    * Individual methods for Save-Save-Quote
    */
    public getQuotedResponse(licensedate:Date, sessionAttributes:Type.Attributes, req: Request): Promise<Quote> {
        return this.getInitialResponseQuote(licensedate, sessionAttributes, req).then((responseQuote) => {
            return this.getUpdatedResponseQuote(responseQuote,sessionAttributes).then((responseQuote) => {
                return Promise.resolve(this.getFinalResponseQuote(responseQuote,sessionAttributes));
            })
        });
    }
   
   public async getInitialResponseQuote(licensedate:Date, sessionAttributes:Type.Attributes, req: Request): Promise<Quote> {
        logger.info('AgeService buildQuoteResponse');
        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            logger.info('NODE_TEST_LOCAL is Y');
            sessionAttributes = await this.sessionService.getSession(); 
        }

        let options = new Type.Options();

        //updated session
        options.attributes = sessionAttributes;

        logger.info('AgeService buildQuoteResponse licensedate ' + licensedate);
        sessionAttributes.quote.quoteDraft.autoDraft.listOfDrivers[0].listOfLicenceClasses[0].dateLicense = licensedate;
        
        logger.info('AgeService buildQuoteResponse : sessionAttributes \n' + JSON.stringify(sessionAttributes));
        let responseQuote = await this.quoteService.saveQuote(sessionAttributes);
        logger.info('AgeService buildQuoteResponse : quoteService.saveQuote : responseQuote \n' + JSON.stringify(responseQuote));
        return responseQuote;
            
     }

      public async getUpdatedResponseQuote(responseQuote:Quote, sessionAttributes:Type.Attributes): Promise<Quote> {
        let options = new Type.Options();
        sessionAttributes.quote = responseQuote;
        responseQuote.selectedQuotePublicID = responseQuote.listOfOfferedQuotes[0].id;
        options.attributes.quote = responseQuote;

        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            logger.info('NODE_TEST_LOCAL is Y');
            this.sessionService.saveSession(options.attributes);
        }

        let updateResponseQuote = await this.quoteService.saveQuote(sessionAttributes);
        logger.info('AgeService buildQuoteResponse : quoteService.saveQuote : updateResponseQuote \n' + JSON.stringify(updateResponseQuote));
        return updateResponseQuote;       
     }

     public async getFinalResponseQuote(updateResponseQuote:Quote, sessionAttributes:Type.Attributes): Promise<Quote> {
        let options = new Type.Options();
        sessionAttributes.quote = updateResponseQuote;
        options.attributes.quote = updateResponseQuote;

        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            logger.info('NODE_TEST_LOCAL is Y');
            this.sessionService.saveSession(options.attributes);
        }

        let quotedResponseQuote = await this.quoteService.quoteQuote(sessionAttributes);
        logger.info('AgeService buildQuoteResponse : quoteService.saveQuote : quotedResponseQuote \n' + JSON.stringify(quotedResponseQuote));
        sessionAttributes.quote = quotedResponseQuote;
        options.attributes.quote = quotedResponseQuote;

        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            logger.info('NODE_TEST_LOCAL is Y');
            this.sessionService.saveSession(options.attributes);
        }

        let total = quotedResponseQuote.listOfOfferedQuotes[0].total;

        logger.info('AgeService buildQuoteResponse : quoteService.saveQuote : total ' + total);
        
        return quotedResponseQuote;
     }
}