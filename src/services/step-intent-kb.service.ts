import { NextFunction, Request, Response } from "express";
import HttpStatus = require('http-status-codes');

import * as Type from '../models/core/alexa.model';
import { JarvisLogger } from "../util/JarvisLogger";
import { ResponseBuilderService } from '../services/core/response-builder.service';
import { KnowledgeBaseService } from '../services/faq/core/knowledge-base-search.service';
import { AlexaError } from '../util/AlexaError';


/**
 * Intent Request - KnowledgeBaseService.
 */
export class KnowledgeBaseIntentService {

   private builderService: ResponseBuilderService;
   private knowledgeBaseService:KnowledgeBaseService;

   constructor(){              
        this.builderService = new ResponseBuilderService();      
        this.knowledgeBaseService = new KnowledgeBaseService();
   }


   public async getKnowledgeBaseService(input: string, sessionAttributes: Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug('KnowledgeBaseIntentService getKnowledgeBaseService');
        let responseBody = new Type.ResponseBody();
        let options = new Type.Options();

        try {
            //const faq = await this.faqService.findFaqByIntent(reqIntent);
            const solrModel = await this.knowledgeBaseService.findAnswer(input, sessionAttributes);

            if(solrModel && (solrModel.matched == true)){
                JarvisLogger.default.debug('KnowledgeBaseIntentService getKnowledgeBaseService - (solrModel.matched == true)');
                let answer  = solrModel.shortAnswer + '. Would you like to ask another insurance question or get a quick auto quote ?';
                responseBody = this.builderService.clearSessionBuildResponsewithCard(sessionAttributes.deviceId, answer, answer);
            }else {
                JarvisLogger.default.debug('KnowledgeBaseIntentService getKnowledgeBaseService - (solrModel.matched == false)');
                let attribute = new Type.Attributes();
                //to continue for Q & A journey
                attribute.journery = Type.CustomJourneyRequestNames.AutoInsurance;
                //to go though User confirmation intent for Q & A.
                attribute.category = Type.CustomIntentCategoryName.KnowledgeBaseCategory;
                //update session with alternate answer
                attribute.knowledgebaseAnswer = solrModel.alternateAnswer;
                //update session with question
                attribute.knowledgebaseQuestion = solrModel.value;
                //set response.
                options.speechText = solrModel.shortAnswer;
                options.repromptText = solrModel.shortAnswer;
                options.attributes = attribute;
                options.endSession = false;
                responseBody = this.builderService.buildResponseWithCard(solrModel.shortAnswer, options);
            }

        } catch (error) {
            JarvisLogger.default.error('KnowledgeBaseIntentService getKnowledgeBaseService - Error\n' + error);
            throw new AlexaError(JSON.stringify({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'KnowledgeBaseIntentService getKnowledgeBaseService - Error'
            }));
            
        }
        
        return responseBody;
   }



   
}


