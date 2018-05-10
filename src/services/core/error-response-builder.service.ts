import { NextFunction, Request, Response } from "express";

import { logger } from "../../util/Logger";
import { Quote }  from "../../models/quote/quoter/quoter.model";
import * as Type from "../../models/core/alexa.model";
import { SessionService } from '../core/session.service';
import { ResponseBuilderService } from '../core/response-builder.service';

//TODO - not used  to be deleted - srini
/**
 * Error Service - Kickout, Unsupported, Not Understood & No Response.
 */
export class ErrorBuilderService {

   private sessionService: SessionService;
   private builderService: ResponseBuilderService;


  constructor(){        
      this.sessionService = new SessionService();        
      this.builderService = new ResponseBuilderService();     
  }

  /**
   * Response builder for all kickouts.
   * @param customRequestName origin custom request name.
   */     
  public async kickoutBuildResponse(customRequestName: string): Promise<Type.ResponseBody> {
    logger.info("ErrorBuilderService - kickoutBuildResponse customRequestName - "+ customRequestName);
    let options = new Type.Options();
    options.speechText = `Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as="telephone">1-855-788-9090 </say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?`,
    options.repromptText = `Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as="telephone">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?`,
    options.endSession = false;
    let responseBody = this.builderService.buildResponse(options);
    return responseBody;
  
  }

  /**
   * Response builder for all unsupported.
   */     
  public async unsupportedBuildResponse(sessionAttributes:Type.Attributes): Promise<Type.ResponseBody> {
    logger.info("ErrorBuilderService - unsupportedBuildResponse");
    let options = new Type.Options();
    options.speechText = `Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as="telephone">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?`,
    options.repromptText = `Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as="telephone">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?`,
    //pass session state
    options.attributes = sessionAttributes;
    options.endSession = false;
    let responseBody = this.builderService.buildResponse(options);
    return responseBody;
  
  }
}