import { NextFunction, Request, Response } from "express";
import * as Type from '../models/core/alexa.model';
import HttpStatus = require('http-status-codes');

import { JarvisLogger } from "../util/JarvisLogger";
import { AlexaError } from '../util/AlexaError';
import { ProductAvailablityService } from '../services/quote/core/quote-product-availabilty.service';
import { ProductService } from '../services/quote/core/quote-product.service';
import { SessionService } from '../services/core/session.service';
import { ResponseBuilderService } from '../services/core/response-builder.service';
import { ErrorBuilderService } from '../services/core/error-response-builder.service';
import { ProductAvailability, ProductAvailabilityResponse }  from '../models/quote/lob/common/product-availability.model';

export class PostalCodeService {

    private giProductAvailablityService: ProductAvailablityService;
    private giProductService: ProductService;
    private sessionService: SessionService;
    private builderService: ResponseBuilderService;
    private errorBuilderService:ErrorBuilderService;
   
   constructor(){        
        this.giProductAvailablityService = new ProductAvailablityService();
        this.giProductService = new ProductService();
        this.sessionService = new SessionService();        
        this.builderService = new ResponseBuilderService();     
        this.errorBuilderService = new ErrorBuilderService();    
     }

     //NOT in user -sDELETE
     public async getPostalCodeIntent(postalCode: string): Promise<Type.ResponseBody> {
       JarvisLogger.default.debug('PostalCodeService getPostalCodeIntent PostalCode : '+ postalCode);

       try {

        let attribute = new Type.Attributes(); 
        const productCode = String(process.env.GI_PRODUCT_CODE);
        const uwCompany = String(process.env.GI_UNDERWRITER_CODE);
        
        if(String(process.env.GI_VOICE_SERVICE) === 'DEV'){
            JarvisLogger.default.debug('GI_VOICE_SERVICE is DEV');
            //Guidwire API is not yet upgraded in QA
            const productAvailabilityResponse = await this.giProductService.getInitialQuote(productCode, postalCode);
            attribute.quote = productAvailabilityResponse.quote;
            attribute.gicookie = productAvailabilityResponse.gicookie;
        }else{
            JarvisLogger.default.debug('GI_VOICE_SERVICE is not DEV');
            //Guidwire API is yet upgraded in PS-QA
            const productAvailabilityResponse = await this.giProductAvailablityService.getInitialQuote(productCode, uwCompany, postalCode);
            attribute.quote = productAvailabilityResponse.quote;
            attribute.gicookie = productAvailabilityResponse.gicookie;
        }
        
                         
        
        
        let options = new Type.Options();
        options.speechText = "Please tell me the 'Year' of your car.",
        options.repromptText = "Please tell me the 'Year' of your car.",
        options.endSession = false;
        options.attributes = attribute;

        /*TO-DO: Add If statments to accomodate error*/
        
        if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
            JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
            this.sessionService.saveSession(attribute);
        }
        
        let responseBody = this.builderService.buildResponse(options);
        return responseBody;
           
       } catch (error) {
            //Kickout error response.
            JarvisLogger.default.error(PostalCodeService.name, error);
            throw new AlexaError(JSON.stringify({
                status: HttpStatus.BAD_REQUEST,
                error: 'Product is not avaliable'
            }));
            
       }
       
     }

     /**
      * Postal code format valdiator for pattern A1A A1A.
      * @param postalCode postal code
      */
     public postalCodeValidator(postalCode: string):boolean{
        JarvisLogger.default.debug("PostalCodeService - postalCodeValidator");
        let validPostalCode:boolean = false;
        if(postalCode){
            const postaCodeUppercase = postalCode.toUpperCase();
            if(/^[A-Za-z]\d[A-Za-z] *\d[A-Za-z]\d$/.test(postaCodeUppercase)){
              validPostalCode = true;
            }
        }
      return validPostalCode;
     }

      
     /**
      * Invalid postal code response builder.
      */
     public async notValidPostalCodeResponse(postalCode: string, sessionAttributes:Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug("PostalCodeService - notValidPostalCodeResponse");
        
        //remove space from postal code for end-user confirmation 
        let postalCodeValue = postalCode.replace(' ', '');
        
        //build response for not a valid postal code response.
        let responseBody = this.builderService.notValidPostalCodeBuildResponse(postalCodeValue, sessionAttributes);
        return responseBody;
    }

    /**
      * Postal code confirmation response builder.
      */
     public async validPostalCodeResponse(postalCode: string, sessionAttributes:Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug("PostalCodeService - validPostalCodeResponse");
        
        //maximum 3 attempts of postal code intent
        if(sessionAttributes.postalCodeIntentAttempts == 2){
            JarvisLogger.default.debug("PostalCodeService - validPostalCodeResponse maximum 3 attemps - jump to main menu");
            const mainMenuResponse = this.builderService.mainMenuBuildResponse(sessionAttributes.deviceId);
            return mainMenuResponse;
        }else {
            //update session with postal intent apptems 
            sessionAttributes.postalCodeIntentAttempts = sessionAttributes.postalCodeIntentAttempts + 1;
        }

        //update session with postal code
        sessionAttributes.postalCode = postalCode;

        //remove space from postal code for end-user confirmation 
        let postalCodeValue = postalCode.replace(' ', '');
        //build response for valid postal response.
        let responseBody = this.builderService.validPostalCodeBuildResponse(postalCodeValue, sessionAttributes);
        return responseBody;
    }
    /**
     * Postal code confirmation.
     * @param postalCodeConfirm 
     */
    public async confirmPostalCodeIntent(postalCodeConfirm: string, sessionAttributes:Type.Attributes): Promise<Type.ResponseBody> {              
       JarvisLogger.default.debug('PostalCodeService confirmPostalCodeIntent');
       let options = new Type.Options();

       if (postalCodeConfirm === 'yes') {

            let postalCode = sessionAttributes.postalCode;
            JarvisLogger.default.debug('PostalCodeService confirmPostalCodeIntent postalCode ' + postalCode);

            //check for product avaliablity from guidewire
            const productCode = String(process.env.GI_PRODUCT_CODE);
            const uwCompany = String(process.env.GI_UNDERWRITER_CODE);

            //TODO: if product not avaliable
            let productAvailabilityResponse:ProductAvailabilityResponse = new ProductAvailabilityResponse();
            if(String(process.env.GI_VOICE_SERVICE) === 'DEV'){
                JarvisLogger.default.debug('GI_VOICE_SERVICE is DEV');
                //Guidwire API is not yet upgraded in QA
                productAvailabilityResponse = await this.giProductService.getInitialQuote(productCode, postalCode);
                JarvisLogger.default.debug('DEV : PostalCodeService confirmPostalCodeIntent productAvailabilityResponse\n' + JSON.stringify(productAvailabilityResponse));
            }else{
                JarvisLogger.default.debug('GI_VOICE_SERVICE is not DEV');
                //Guidwire API is yet upgraded in PS-QA
                productAvailabilityResponse = await this.giProductAvailablityService.getInitialQuote(productCode, uwCompany, postalCode);
                JarvisLogger.default.debug('QA : PostalCodeService confirmPostalCodeIntent productAvailabilityResponse\n' + JSON.stringify(productAvailabilityResponse));
            }
            
            //JarvisLogger.default.debug('PostalCodeService confirmPostalCodeIntent productAvailabilityResponse ' + JSON.stringify(productAvailabilityResponse));
            
            //updated session with quote.
            sessionAttributes.quote = productAvailabilityResponse.quote;
            //updated session with gi-service cookie
            sessionAttributes.gicookie = productAvailabilityResponse.gicookie;
            //updated session with intent category - Year/Make/Model Intent
            sessionAttributes.category = Type.CustomIntentCategoryName.YearMakeModelCategory;                              
            
            let responseBody = this.builderService.confirmYesPostalCodeBuildResponse(sessionAttributes);

            //to test locally
            if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
                JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
                this.sessionService.saveSession(responseBody.sessionAttributes);
            }

            return responseBody;
        }else{
            
            let responseBody = this.builderService.confirmNoPostalCodeBuildResponse(sessionAttributes);
            //to test locally
            if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
                JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
                this.sessionService.saveSession(responseBody.sessionAttributes);
            }

            return responseBody;
        }
     }
}