import { NextFunction, Request, Response } from "express";
import HttpStatus = require('http-status-codes');
import * as Type from '../models/core/alexa.model';

import { JarvisLogger } from "../util/JarvisLogger";
import { AlexaError } from '../util/AlexaError';
import { ProductService } from '../services/quote/core/quote-product.service';
import { SessionService } from '../services/core/session.service';
import { ResponseBuilderService } from '../services/core/response-builder.service';
import { QuoteService } from '../services/quote/core/quote-quote.service';
import { QuoteResponseService } from '../services/core/quote-response-builder';
import { QuoteProcessService } from '../services/quote/quote-process.service';
import { Quote }  from "../models/quote/quoter/quoter.model";
import { default as Voice , VoiceModel } from "../models/voice-session.model";
import { Guid } from "../util/Guid";

/**
 * Intent Request - Age.
 */
export class AgeService {

    private giServiceProductService: ProductService;
    private sessionService: SessionService;
    private builderService: ResponseBuilderService;
    private quoteService: QuoteService;
    private quoteResponseService: QuoteResponseService;
    private quoteProcessService: QuoteProcessService;

    constructor() {
        this.giServiceProductService = new ProductService();
        this.sessionService = new SessionService();
        this.builderService = new ResponseBuilderService();
        this.quoteService = new QuoteService();
        this.quoteResponseService = new QuoteResponseService();
        this.quoteProcessService = new QuoteProcessService();
    }

    public async getAgeIntent(twentyfive: string, sessionAttributes: Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug('AgeService getAgeIntent');

        //to test locally
        if (String(process.env.NODE_TEST_LOCAL) == 'Y') {
            JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
            sessionAttributes = await this.sessionService.getSession();
        }

        let options = new Type.Options();

        if (twentyfive === 'yes') {
            JarvisLogger.default.debug('AgeService getAgeIntent : If  twentyfive ' + twentyfive);
            let dob = new Date();
            let licenseDate = new Date();
            let vehiclePurchaseDate = new Date();
            //as per requirment for over 25 years age is (current - 30 years)
            dob.setFullYear(dob.getFullYear() - 30);
            //update date of birth
            sessionAttributes.quote.quoteDraft.autoDraft.listOfDrivers[0].dateOfBirth = dob;
            //as per requirment for over 25 years license date is (current - 8S years)
            licenseDate.setFullYear(licenseDate.getFullYear() - 8);

            //as per requirment for vechicle purchase date is (current - 3)
            vehiclePurchaseDate.setFullYear(vehiclePurchaseDate.getFullYear() - 3);
            sessionAttributes.quote.quoteDraft.autoDraft.listOfVehicles[0].vehiclePurchaseDate = vehiclePurchaseDate;

            //TODO: Default Licence class to G

            //udpated session with license date
            sessionAttributes.licenseDate = licenseDate;
            //updated session with intent category - Gender Intent
            sessionAttributes.category = Type.CustomIntentCategoryName.GenderCategory;

            //TODO : try-catch
            //build quote response
            //let responseBody = await this.buildQuoteResponse(licenseDate, sessionAttributes);
            //response before confirmation of quote.
            
            JarvisLogger.default.debug('-----PRE1-STEP0----\nAgeService getAgeIntent  getQuote ');
            let responseBody = await this.getQuote(sessionAttributes);
            JarvisLogger.default.debug('-----PRE1-STEP1----\nAgeService getAgeIntent  getQuotedResponse ');
            //call non-blocking get quoted response.
            this.quoteProcessService.getQuotedResponse(licenseDate, sessionAttributes).then((quote) => {
                JarvisLogger.default.debug('-----PRE1-STEP2----\nAgeService getAgeIntent  getQuotedResponse then ' +  JSON.stringify(quote));
            }).catch((error) => {
                JarvisLogger.default.error(AgeService.name, error);
                throw new AlexaError(JSON.stringify({
                    status: HttpStatus.BAD_REQUEST,
                    error: 'AgeService getAgeIntent : getQuotedResponse'
                }));
            });

            return responseBody;

        } else {
            JarvisLogger.default.debug('AgeService getAgeIntent : Else twentyfive ' + twentyfive);
            //the logic for else condition if not over 25 age
            let dob = new Date();
            let licenseDate = new Date();
            let vehiclePurchaseDate = new Date();
            //as per requirment for under 25 years age is (current - 20 years)
            dob.setFullYear(dob.getFullYear() - 20);
            //update date of birth
            sessionAttributes.quote.quoteDraft.autoDraft.listOfDrivers[0].dateOfBirth = dob;

            //as per requirment for over 25 years license date is (current - 8S years)
            licenseDate.setFullYear(licenseDate.getFullYear() - 8);

            //as per requirment for vechicle purchase date is (current - 3)
            vehiclePurchaseDate.setFullYear(vehiclePurchaseDate.getFullYear() - 3);
            sessionAttributes.quote.quoteDraft.autoDraft.listOfVehicles[0].vehiclePurchaseDate = vehiclePurchaseDate;

            //TODO: Default Licence class to G

            //udpated session with license date
            sessionAttributes.licenseDate = licenseDate;
            //updated session with intent category - Gender Intent
            sessionAttributes.category = Type.CustomIntentCategoryName.GenderCategory;
            //update session with age
		    sessionAttributes.isOverTwentyFive = false;

            //TODO - condition for less than 25
            //updated session with license date
            //sessionAttributes.licenseDate = licenseDate;

            let responseBody = this.builderService.confirmNoAgeBuildResponse(sessionAttributes);
            return responseBody;
        }
    }

    /**
     * TODO : To test review terms - to be deleted and use quote-premium intent 
     * @param licensedate 
     * @param sessionAttributes 
     */

    public async getQuote(sessionAttributes: Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug('-----PRE2-STEP1----\nAgeService getQuote');
        //to test locally
        if (String(process.env.NODE_TEST_LOCAL) == 'Y') {
            JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
            sessionAttributes = await this.sessionService.getSession();
        }
        //build response
        let responseBody = this.builderService.confirmYesAgeBuildResponse(sessionAttributes);
        return Promise.resolve(responseBody);

    }

}