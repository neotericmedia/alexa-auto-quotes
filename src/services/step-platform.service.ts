import { NextFunction, Request, Response } from "express";
import * as Type from '../models/core/alexa.model';

import { ResponseBuilderService } from '../services/core/response-builder.service';
import { SessionService } from '../services/core/session.service';
import { Guid } from "../util/Guid";

/**
* Launch Request Intent.
* SessionEndedRequest Service.
*/
export class PlatformService {

  private builderService: ResponseBuilderService;
  private sessionService: SessionService;

   constructor(){              
       this.builderService = new ResponseBuilderService();  
       this.sessionService = new SessionService();       
     }

   public async getLaunchRequest(deviceId: string): Promise<Type.ResponseBody> {
               
        let responseBody = this.builderService.launchRequestBuildResponse(deviceId);

        return responseBody;

   }
   
}