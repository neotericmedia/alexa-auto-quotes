import { NextFunction, Request, Response } from "express";
import * as Type from '../models/core/alexa.model';

import { JarvisLogger } from "../util/JarvisLogger";
import { ProductAvailablityService } from '../services/quote/core/quote-product-availabilty.service';
import { SessionService } from '../services/core/session.service';
import { ResponseBuilderService } from '../services/core/response-builder.service';
import { QuoteService } from '../services/quote/core/quote-quote.service';


/**
* Intent Request - G/G2 License.
*/
export class LicenseService {

   private giProductAvailablityService: ProductAvailablityService;
   private sessionService: SessionService;
   private builderService: ResponseBuilderService;
   private quoteService: QuoteService;
   
   constructor(){        
       this.giProductAvailablityService = new ProductAvailablityService();
       this.sessionService = new SessionService();        
       this.builderService = new ResponseBuilderService();
       this.quoteService = new QuoteService();
       
     }

     public async getLicenseIntent(licensedate: any): Promise<Type.ResponseBody> {

       const productCode = String(process.env.GI_PRODUCT_CODE);
       const uwCompany = String(process.env.GI_UNDERWRITER_CODE);
       const productAvailabilityResponse = await this.giProductAvailablityService.getInitialQuote(productCode,uwCompany,licensedate);
       
       let sessionAttributes = new Type.Attributes();                  
       sessionAttributes.quote = productAvailabilityResponse.quote;
       sessionAttributes.gicookie = productAvailabilityResponse.gicookie;
       
       let options = new Type.Options();
       options.endSession = false;
       options.attributes = sessionAttributes;

       sessionAttributes.quote.quoteDraft.autoDraft.listOfDrivers[0].listOfLicenceClasses[0].dateLicense = licensedate;
       
       let responseQuote = await this.quoteService.saveQuote(sessionAttributes);
       sessionAttributes.quote = responseQuote;
       responseQuote.selectedQuotePublicID = responseQuote.listOfOfferedQuotes[0].id;
       options.attributes.quote = responseQuote;

       //to test locally
       if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
         JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
         this.sessionService.saveSession(options.attributes);
       }

       let updateResponseQuote = await this.quoteService.saveQuote(sessionAttributes);
       sessionAttributes.quote = updateResponseQuote;
       options.attributes.quote = updateResponseQuote;

       //to test locally
       if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
         JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
         this.sessionService.saveSession(options.attributes);
       }

       let quotedResponseQuote = await this.quoteService.quoteQuote(sessionAttributes);
       sessionAttributes.quote = quotedResponseQuote;
       options.attributes.quote = quotedResponseQuote;

       //to test locally
       if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
         JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
         this.sessionService.saveSession(options.attributes);
       }

       let total = quotedResponseQuote.listOfOfferedQuotes[0].total;

       JarvisLogger.default.debug('total '+ total);

       options.speechText = `You got your license ${licensedate}. Here is your premium calulation. Your quote is ${total} per year. Would you like to get another auto quote? Say Auto Quote otherwise say cancel or insurance information.`,
       options.repromptText = `You got your license ${licensedate}. Here is your premium calulation. Your quote is ${total} per year. Would you like to get another auto quote? Say Auto Quote otherwise say cancel or insurance information.`,
       options.endSession = false;

       
       if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
           JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
           this.sessionService.saveSession(sessionAttributes);
       }
       
       let responseBody = this.builderService.buildResponse(options);

       return responseBody;

     }
}