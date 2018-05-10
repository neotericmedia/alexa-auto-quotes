import { NextFunction, Request, Response } from "express";

import { logger } from "../../util/Logger";
import { Quote }  from "../../models/quote/quoter/quoter.model";
import * as Type from "../../models/core/alexa.model";
import { SessionService } from '../core/session.service';
import { ResponseBuilderService } from '../core/response-builder.service';

//TODO - not used  to be deleted - srini
/**
 * Help Service - contextual help.
 */
export class HelpBuilderService {

   private sessionService: SessionService;
   private builderService: ResponseBuilderService;


  constructor(){        
      this.sessionService = new SessionService();        
      this.builderService = new ResponseBuilderService();     
  }

  /**
   * Response builder for dialog Launch Help Build Response.
   */     
  public async dialogLaunchHelpBuildResponse(): Promise<Type.ResponseBody> {
    logger.info("HelpBuilderService - dialogLaunchHelpBuildResponse");
    let options = new Type.Options();
    options.speechText = `I can help you to get a quick auto quote for your car in Ontario or get answers to general insurance questions related to auto insurance. For a quick quote, I may require information such as Year, make & model of your vehicle, postal code, age and gender.`,
    options.repromptText = `I can help you to get a quick auto quote for your car in Ontario or get answers to general insurance questions related to auto insurance. For a quick quote, I may require information such as Year, make & model of your vehicle, postal code, age and gender.`,
    options.endSession = false;
    let responseBody = this.builderService.buildResponse(options);
    return responseBody;
  
  }

  /**
   * Response builder for contextual help.
   * @param help contentual help message.
   */     
  public async contextualHelpBuildResponse(help: string): Promise<Type.ResponseBody> {
    logger.info("HelpBuilderService - contextualHelpBuildResponse help "+ help);
    let options = new Type.Options();
    options.speechText = `${help}`,
    options.repromptText = `${help}`,
    options.endSession = false;
    let responseBody = this.builderService.buildResponse(options);
    return responseBody;
  
  }
}