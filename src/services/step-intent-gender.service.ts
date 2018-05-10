import { NextFunction, Request, Response } from "express";
import HttpStatus = require('http-status-codes');

import * as Type from '../models/core/alexa.model';
import { JarvisLogger } from "../util/JarvisLogger";
import { AlexaError } from '../util/AlexaError';
import { ProductService } from '../services/quote/core/quote-product.service';
import { SessionService } from '../services/core/session.service';
import { ResponseBuilderService } from '../services/core/response-builder.service';
import { QuoteProcessService } from '../services/quote/quote-process.service';
import { AgeService } from '../services/step-intent-age.service';

/**
 * Intent Request - Gender.
 */
export class GenderService {

   private giServiceProductService: ProductService;
   private sessionService: SessionService;
   private builderService: ResponseBuilderService;
   private quoteProcessService: QuoteProcessService;
   private ageService: AgeService;
   
   constructor(){        
       this.giServiceProductService = new ProductService();
       this.sessionService = new SessionService();        
       this.builderService = new ResponseBuilderService();   
       this.quoteProcessService = new QuoteProcessService();    
       this.ageService = new AgeService();
     }

     public async getGenderIntent(gender: string, sessionAttributes:Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug('GenderService getGenderIntent'); 
        
        //to test locally
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
            sessionAttributes = await this.sessionService.getSession(); 
        }else{
            sessionAttributes = sessionAttributes;
        }

        //update session with gender
        sessionAttributes.gender = gender;

       if (gender === "male") {
            JarvisLogger.default.debug('GenderService getGenderIntent gender = male'); 
            //update gender
            sessionAttributes.quote.quoteDraft.autoDraft.listOfDrivers[0].gender = 'M';
            //TODO : Default Licence class to G2 and Date licensed to Nov’14

        }else{
            JarvisLogger.default.debug('GenderService getGenderIntent gender = female'); 
            //update gender
            sessionAttributes.quote.quoteDraft.autoDraft.listOfDrivers[0].gender = 'F';
            //TODO : Default Licence class to G2 and Date licensed to Nov’14
        }

        JarvisLogger.default.debug('-----PRE1-STEP0----\nGenderService getGenderIntent  ageService.getQuote ');
        let responseBody = await this.ageService.getQuote(sessionAttributes);
        JarvisLogger.default.debug('-----PRE1-STEP1----\nGenderService getGenderIntent  quoteProcessService.getQuotedResponse ');
        //call non-blocking get quoted response.
        this.quoteProcessService.getQuotedResponse(new Date(sessionAttributes.licenseDate), sessionAttributes).then((quote) => {
            JarvisLogger.default.debug('-----PRE1-STEP2----\nGenderService getGenderIntent  quoteProcessService.getQuotedResponse then ' +  JSON.stringify(quote));
        }).catch((error) => {
            JarvisLogger.default.error(GenderService.name, error);
            throw new AlexaError(JSON.stringify({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'GenderService getGenderIntent : getQuotedResponse'
            }));
        });
        return responseBody;
     }
}