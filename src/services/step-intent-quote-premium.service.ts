import { NextFunction, Request, Response } from "express";
import * as Type from '../models/core/alexa.model';

import { JarvisLogger } from "../util/JarvisLogger";
import { ProductService } from '../services/quote/core/quote-product.service';
import { SessionService } from '../services/core/session.service';
import { ResponseBuilderService } from '../services/core/response-builder.service';
import { ErrorBuilderService } from '../services/core/error-response-builder.service';

export class QuotePremiumService {

    private giServiceProductService: ProductService;
    private sessionService: SessionService;
    private builderService: ResponseBuilderService;
    private errorBuilderService:ErrorBuilderService;
   
   constructor(){        
       this.giServiceProductService = new ProductService();
       this.sessionService = new SessionService();        
       this.builderService = new ResponseBuilderService();     
       this.errorBuilderService = new ErrorBuilderService();    
     }

    /**
     * Ready to know the premium confirmation.
     * @param premiumConfirm 
     */
    public async reviewTermsIntent(premiumConfirm: string, sessionAttributes:Type.Attributes): Promise<Type.ResponseBody> {              
        JarvisLogger.default.debug('QuotePremiumService confirmPremiumIntent');

        //to test locally
        if (String(process.env.NODE_TEST_LOCAL) == 'Y') {
            JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
            sessionAttributes = await this.sessionService.getSession();
        }


        let options = new Type.Options();

       if (premiumConfirm === 'yes') {
           JarvisLogger.default.debug('QuotePremiumService confirmPremiumIntent : If  premiumConfirm ' + premiumConfirm);

           //original version
           const responseRetrived = await this.sessionService.findResponseDocument(sessionAttributes);
            /*
            //harcoded version
           const responseRetrived = await this.sessionService.findHardCodedResponseDocument(sessionAttributes);
            */
           JarvisLogger.default.debug("QuotePremiumService confirmPremiumIntent responseRetrived " + responseRetrived);
           JarvisLogger.default.debug("QuotePremiumService confirmPremiumIntent responseRetrived.response " + responseRetrived.response);

            let responseBody:Type.ResponseBody = JSON.parse(responseRetrived.response);
            JarvisLogger.default.debug("QuotePremiumService confirmPremiumIntent responseBody " + responseBody);
            return responseBody;
        }else{
            
            //go back to main menu and clear session
            let responseBody = this.builderService.mainMenuBuildResponse(sessionAttributes.deviceId);
            return responseBody;
        }
     }

}