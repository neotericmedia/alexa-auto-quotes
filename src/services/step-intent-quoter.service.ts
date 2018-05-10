import { NextFunction, Request, Response } from "express";
import * as Type from '../models/core/alexa.model';

import { ResponseBuilderService } from '../services/core/response-builder.service';
import { Quote }  from "../models/quote/quoter/quoter.model";
import { SessionService } from '../services/core/session.service';
import { QuoteService } from '../services/quote/core/quote-quote.service';
import { Guid } from "../util/Guid";


/**
* Launch Request Intent.
* SessionEndedRequest Service.
*/
export class QuoterService {

   private builderService: ResponseBuilderService;
   private sessionService: SessionService;
   private quoteService: QuoteService;

   constructor(){              
       this.builderService = new ResponseBuilderService();   
       this.sessionService = new SessionService();           
       this.quoteService = new QuoteService();        
     }

   public async getQuoterIntent(deviceId: string): Promise<Type.ResponseBody> {

        let responseBody = this.builderService.quoterIntentBuildResponse(deviceId);
        
        return responseBody;

   }
}