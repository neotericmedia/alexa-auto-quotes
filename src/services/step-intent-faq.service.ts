import { NextFunction, Request, Response } from "express";
import * as Type from '../models/core/alexa.model';

import { ResponseBuilderService } from '../services/core/response-builder.service';
import { FaqService } from '../services/faq/faq.service';
import { Guid } from "../util/Guid";

/**
 * Intent Request - FAQ.
 */
export class FAQService {

   private builderService: ResponseBuilderService;
   private faqService:FaqService;

   constructor(){              
        this.builderService = new ResponseBuilderService();      
        this.faqService = new FaqService();
   }


   public async getFAQIntent(deviceId: string): Promise<Type.ResponseBody> {
       
        let responseBody = this.builderService.faqBuildResponse(deviceId);
        
        return responseBody;
   }
   
}


