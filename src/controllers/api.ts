
import { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';
import HttpStatus = require('http-status-codes');
import { All, Controller, Get, interfaces, Post, Put } from 'inversify-express-utils';

import { JarvisLogger } from '../util/JarvisLogger';
import { ResponseBuilderService } from '../services/core/response-builder.service';
import { AlexaError } from '../util/AlexaError';
import * as Type from '../models/core/alexa.model';
import { ProductAvailability, ProductAvailabilityResponse }  from '../models/quote/lob/common/product-availability.model';
import { VehicleLookup, VehicleLookupRequest } from '../models/quote/lob/auto/vehicles/vehicle-lookup.model';
import { ProductService } from '../services/quote/core/quote-product.service';
import { SessionService } from '../services/core/session.service';
import { YearMakeModelService } from '../services/quote/core/quote-ymm.service';
import { VehicleService } from '../services/quote/core/quote-vehicle.service';
import { QuoteService } from '../services/quote/core/quote-quote.service';
import { FaqService } from '../services/faq/faq.service';
import { Quote }  from '../models/quote/quoter/quoter.model';
import { Vehicle } from '../models/quote/lob/auto/vehicles/vehicle.model';
import { FaqIntentName } from '../models/faq/faq.model';
import { PostalCodeService } from '../services/step-intent-postal.service';
import { PlatformService } from '../services/step-platform.service';
import { QuoterService } from '../services/step-intent-quoter.service';
import { AgeService } from '../services/step-intent-age.service';
import { LicenseService } from '../services/step-intent-license.service';
import { FAQService } from '../services/step-intent-faq.service';
import { KnowledgeBaseIntentService } from '../services/step-intent-kb.service';
import { YearMakeModelIntentService } from '../services/step-intent-ymm.service';
import { ErrorBuilderService } from '../services/core/error-response-builder.service';
import { GenderService } from '../services/step-intent-gender.service';
import { QuotePremiumService } from '../services/step-intent-quote-premium.service';
import { BaseRouter } from "./core/BaseRouter";
import { Guid } from "../util/Guid";
import { KnowledgeBaseService } from '../services/faq/core/knowledge-base-search.service';


@injectable()
@Controller('/api')
export class AlexaRouter extends BaseRouter implements interfaces.Controller{

  private service: ResponseBuilderService;
  private error: AlexaError;
  private giServiceProductService: ProductService;
  private sessionService: SessionService;
  private yearMakeModelService: YearMakeModelService;
  private vehicleService: VehicleService;
  private quoteService: QuoteService;
  private faqService:FaqService;
  private postalCodeService:PostalCodeService;
  private platformService:PlatformService;
  private quoterService:QuoterService;
  private licenseService:LicenseService;
  private ageService:AgeService;
  private faqIntentService:FAQService;
  private knowledgeBaseIntentService:KnowledgeBaseIntentService;
  private ymmIntentService:YearMakeModelIntentService;
  private errorBuilderService:ErrorBuilderService;
  private genderService:GenderService;
  private quotePremiumService:QuotePremiumService;
  private knowledgeBaseService: KnowledgeBaseService;

    constructor(){
      super();
      this.service = new ResponseBuilderService();
      this.giServiceProductService = new ProductService();
      this.sessionService = new SessionService();
      this.yearMakeModelService = new YearMakeModelService();
      this.vehicleService =  new VehicleService();
      this.quoteService = new QuoteService();
      this.faqService = new FaqService();
      this.postalCodeService = new PostalCodeService();
      this.platformService = new PlatformService();
      this.quoterService = new QuoterService();
      this.ageService = new AgeService();
      this.licenseService = new LicenseService();
      this.faqIntentService = new FAQService();
      this.knowledgeBaseIntentService = new KnowledgeBaseIntentService();
      this.ymmIntentService = new YearMakeModelIntentService();
      this.errorBuilderService = new ErrorBuilderService();
      this.genderService = new GenderService();
      this.quotePremiumService = new QuotePremiumService();
      this.knowledgeBaseService = new KnowledgeBaseService();
    }

    /**
     * POST method for voice api.
     * @param req Request
     * @param res Response
     * @param next next callback
     */
    @Post('/voice')
    private async giVoiceService(req: Request, res: Response, next: NextFunction) {      
      JarvisLogger.default.debug('start giVoiceService');
      try {
        var request = req.body.request;
        var session = req.body.session;
        var context = req.body.context;

        //get device Id
        var deviceId = context.System.device.deviceId;
        //get session attributes
        var sessionAttributes = session.attributes;
        JarvisLogger.default.debug('REQUEST======\n'+ JSON.stringify(req.body));
        JarvisLogger.default.debug('request.type === ' +  request.type);

        if(request.type === Type.RequestNames.SessionEndedRequest) {
          /**** ------------------------SessionEndedRequest */
          JarvisLogger.default.debug('request.intent.name === SessionEndedRequest');
          JarvisLogger.default.debug('Per the documentation, we do NOT send ANY response... I know, awkward');
          // Per the documentation, we do NOT send ANY response... I know, awkward.
          //TODO - session.destory() not working to find a better way.
          /**** End---------------------SessionEndedRequest */
        }
        
        if(request.type === Type.RequestNames.LaunchRequest) {
          /**** ------------------------LaunchRequest */
          JarvisLogger.default.debug('request.type === LaunchRequest');
          try {
            let responseBody = await this.platformService.getLaunchRequest(deviceId);
            res.json(responseBody);
          } catch (error) {
            JarvisLogger.default.error(AlexaRouter.name, error);
            //exeception
            let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
            res.json(unsupportedResponseBody);
          }
          /**** End---------------------LaunchRequest */          
        }else if(request.type === Type.RequestNames.IntentRequest) {
          JarvisLogger.default.debug('request.intent.name === '+ request.intent.name);
          JarvisLogger.default.debug('session.attributes === '+ session.attributes);
          
          if (request.intent.name === "AMAZON.HelpIntent") {
              /**** --------------------HelpIntent */
            JarvisLogger.default.debug('request.intent.name === AMAZON.HelpIntent'); 
              
              try {
                let responseBody = this.service.helpBuildResponse(sessionAttributes);
                res.json(responseBody);
              } catch (error) {
                  JarvisLogger.default.error(AlexaRouter.name, error);
                  //exeception
                  let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                  res.json(unsupportedResponseBody);
              }
            /**** End --------------------HelpIntent */
          } else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
            /**** --------------------StopIntent */
              JarvisLogger.default.debug('request.intent.name === AMAZON.StopIntent || AMAZON.CancelIntent');
              try {
                //build response
                let responseBody = this.service.stopCancelBuildResponse();
                res.json(responseBody);
              } catch (error) {
                  JarvisLogger.default.error(AlexaRouter.name, error);
                  //exeception
                  let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                  res.json(unsupportedResponseBody);
              }
              /**** End --------------------StopIntent */
            } else if(
            (request.intent.name === Type.CustomRequestNames.AutoQuote) &&
            (session.attributes === undefined)
          ) {
              /**** ------------------------AutoQuote one-shot */
              JarvisLogger.default.debug('request.intent.name === AutoQuote');
              JarvisLogger.default.debug('AutoQuote - one-shot');
              try {
                let responseBody = await this.quoterService.getQuoterIntent(deviceId);
                res.json(responseBody);
              } catch (error) {
                JarvisLogger.default.error(AlexaRouter.name, error);
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
              }
              /**** End---------------------AutoQuote one-shot */
          } else if(
            request.intent.name === Type.CustomRequestNames.AutoInsurance &&
            (session.attributes === undefined)
          ) {
              /**** ------------------------AutoInsurance one-shot */
              JarvisLogger.default.debug('request.intent.name === AutoInsurance');
              JarvisLogger.default.debug('AutoInsurance - one-shot'); 
              try {
                let responseBody = await this.faqIntentService.getFAQIntent(deviceId);
                res.json(responseBody);
              } catch (error) {
                JarvisLogger.default.error(AlexaRouter.name, error);
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
              }
              /**** End---------------------AutoInsurance one-shot */
          }else if(
            request.intent.name === Type.CustomRequestNames.AutoQuote &&
            !(session.attributes.journery === Type.CustomJourneyRequestNames.AutoInsurance)
          ) {
              /**** ------------------------AutoQuote*/
              JarvisLogger.default.debug('AutoQuote');
              JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
              try {
                let responseBody = await this.quoterService.getQuoterIntent(deviceId);
                res.json(responseBody);
              } catch (error) {
                JarvisLogger.default.error(AlexaRouter.name, error);
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
              }
              /**** End---------------------AutoQuote */
          }else if(
            request.intent.name === Type.CustomRequestNames.AutoInsurance &&
            !(session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote)
          ) {
              /**** ------------------------AutoInsurance*/
              JarvisLogger.default.debug('request.intent.name === AutoInsurance');
              JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
              try {
                let responseBody = await this.faqIntentService.getFAQIntent(deviceId);
                res.json(responseBody);
              } catch (error) {
                JarvisLogger.default.error(AlexaRouter.name, error);
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
              }
              /**** End---------------------AutoInsurance */
          } else if(
            request.intent.name === Type.CustomRequestNames.PostalCode && 
            session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
            session.attributes.category === Type.CustomIntentCategoryName.PostalCodeCategory
          ) {
              /**** ------------------------Postal Code */
              JarvisLogger.default.debug('request.intent.name === PostalCode');
              JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
              JarvisLogger.default.debug('Condition => \nrequest.intent.name === Type.CustomRequestNames.PostalCode && \nsession.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote && \nsession.attributes.category === Type.CustomIntentCategoryName.PostalCodeCategory \n' + 
              (request.intent.name === Type.CustomRequestNames.PostalCode && session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote && session.attributes.category === Type.CustomIntentCategoryName.PostalCodeCategory));

              let codeA = request.intent.slots.codeA.value;
              let codeB = request.intent.slots.codeB.value;
              let codeC = request.intent.slots.codeC.value;
              let codeD = request.intent.slots.codeD.value;
              let codeE = request.intent.slots.codeE.value;
              let codeF = request.intent.slots.codeF.value;

              JarvisLogger.default.debug('postal codes slots : '+ ' [codeA - ' + codeA + ' codeB - '+ codeB + ' codeC - '+ codeC + ' codeD - '+ codeD + ' codeE - '+ codeE + ' codeF - '+codeF + ']');
              //TODO - undefine check for codeA etc.
              let postalCode = codeA.charAt(0) + codeB.charAt(0) + codeC.charAt(0) + ' ' + codeD.charAt(0) + codeE.charAt(0) + codeF.charAt(0);
              JarvisLogger.default.debug('postal codes - '+ postalCode+ ' [codeA - ' + codeA + ' codeB - '+ codeB + ' codeC - '+ codeC + ' codeD - '+ codeD + ' codeE - '+ codeE + ' codeF - '+codeF + ']');
              let isValidPostalCode = this.postalCodeService.postalCodeValidator(postalCode);
              JarvisLogger.default.debug("AlexaRouter giVoiceService PostalCode : Is a valide postal code : " + isValidPostalCode);
              if(isValidPostalCode){      
                try {
                  JarvisLogger.default.debug("AlexaRouter giVoiceService PostalCode : validPostalCodeResponse");
                  let responseBody = await this.postalCodeService.validPostalCodeResponse(postalCode, sessionAttributes);
                  res.json(responseBody);
                } catch (error) {
                  JarvisLogger.default.error(AlexaRouter.name, error);
                  //exeception
                  let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                  res.json(unsupportedResponseBody);
                }
              }else{
                try {
                  JarvisLogger.default.debug("AlexaRouter giVoiceService PostalCode : notValidPostalCodeResponse");
                  let responseBody = await this.postalCodeService.notValidPostalCodeResponse(postalCode, sessionAttributes);
                  res.json(responseBody);
                } catch (error) {
                  JarvisLogger.default.error(AlexaRouter.name, error);
                  //exeception
                  let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                  res.json(unsupportedResponseBody);
                }
              }
              /**** End---------------------Postal Code */

          } else if(
            request.intent.name === Type.CustomRequestNames.YearMakeModel && 
            session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
            session.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory
          ) {
            /**** ---------------------Year/Make/Model */
              let yearSlot = request.intent.slots.year.value;
              let makeSlot = request.intent.slots.make.value;
              let modelSlot = request.intent.slots.model.value;

              JarvisLogger.default.debug("yearSlot : " +yearSlot + "makeSlot : " +makeSlot + "modelSlot : " +modelSlot );

              let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
              res.json(unsupportedResponseBody);

            /**** End---------------------Year/Make/Model */
          } else if(
            request.intent.name === Type.CustomRequestNames.VehicleYear &&
            session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
            session.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory
          ) {
              /**** ------------------------YMM - VehicleYear*/
              JarvisLogger.default.debug('request.intent.name === VehicleYear'); 
              JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
              JarvisLogger.default.debug('Condition => \nrequest.intent.name === Type.CustomRequestNames.VehicleYear && \nsession.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote && \nsession.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory \n' + 
              (request.intent.name === Type.CustomRequestNames.VehicleYear && session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote && session.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory));

              let vehicleYearSlot = request.intent.slots.vYear.value;
              JarvisLogger.default.debug("VehicleYear : " +vehicleYearSlot );
              try {
                let responseBody = await this.ymmIntentService.getVehicleYearIntent(vehicleYearSlot, sessionAttributes);
                res.json(responseBody);
              } catch (error) {
                JarvisLogger.default.error(AlexaRouter.name, error);
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
              }
              /**** End------------------------YMM - VehicleYear*/
            } else if(
            request.intent.name === Type.CustomRequestNames.VehicleMake &&
            session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
            session.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory
          ) {
              /**** ------------------------YMM - VehicleMake*/
              JarvisLogger.default.debug('request.intent.name === VehicleMake'); 
              JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
              JarvisLogger.default.debug('Condition => \nrequest.intent.name === Type.CustomRequestNames.VehicleMake && \nsession.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote && \nsession.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory \n' + 
              (request.intent.name === Type.CustomRequestNames.VehicleMake && session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote && session.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory));

              let vehicleMakeSlot = request.intent.slots.vMake.value;
              JarvisLogger.default.debug("VehicleMake : " +vehicleMakeSlot );
              try {
                let responseBody = await this.ymmIntentService.getVehicleMakeIntent(vehicleMakeSlot, sessionAttributes);
                res.json(responseBody);
              } catch (error) {
                JarvisLogger.default.error(AlexaRouter.name, error);
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
              }
              /**** ------------------------YMM - VehicleYear*/
            } else if(
            request.intent.name === Type.CustomRequestNames.VehicleModel &&
            session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
            session.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory
          ) {
              /**** ------------------------YMM - VehicleModel*/
              JarvisLogger.default.debug('request.intent.name === VehicleModel'); 
              JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
              JarvisLogger.default.debug('Condition => \nrequest.intent.name === Type.CustomRequestNames.VehicleModel && \nsession.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote && \nsession.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory \n' + 
              (request.intent.name === Type.CustomRequestNames.VehicleModel && session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote && session.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory));

              let vehicleModelSlot = request.intent.slots.vModel.value;
              JarvisLogger.default.debug("AlexaRouter giVoiceService VehicleModel : vehicleModelSlot : " +vehicleModelSlot);
              if(vehicleModelSlot){
                //set vehicle modle to session
                sessionAttributes.vehicleModel = vehicleModelSlot;
                //get vehicle year/make/model values
                let yearMakeModel = sessionAttributes.vehicleYear + ' ' + sessionAttributes.vehicleMake + ' ' + sessionAttributes.vehicleModel;
                JarvisLogger.default.debug("AlexaRouter giVoiceService VehicleModel : yearMakeModel : " +yearMakeModel);
                try {
                  let responseBody = await this.ymmIntentService.getVehicleModelIntent(vehicleModelSlot, sessionAttributes);
                  res.json(responseBody);
                } catch (error) {
                  JarvisLogger.default.error(AlexaRouter.name, error);
                  //exeception
                  let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                  res.json(unsupportedResponseBody);
                }
              }else{
                JarvisLogger.default.debug("Not vehicleModelSlot : " +vehicleModelSlot);
              }
              /**** END------------------------YMM - VehicleModel*/
          } else if(
            request.intent.name === Type.CustomRequestNames.GenderIntent &&
            session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
            session.attributes.category === Type.CustomIntentCategoryName.GenderCategory
          ) {
            /**** ------------------------Gender */
            JarvisLogger.default.debug('request.intent.name === GenderIntent'); 
            JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
            let genderSlot = request.intent.slots.Gender.value;
            JarvisLogger.default.debug('AlexaRouter giVoiceService GenderIntent : genderSlot '+ genderSlot);

             if(genderSlot){
               try {
                 JarvisLogger.default.debug('AlexaRouter giVoiceService GenderIntent genderService.getGenderIntent genderSlot '+ genderSlot);
                 let responseBody = await this.genderService.getGenderIntent(genderSlot, sessionAttributes);
                 res.json(responseBody);
               } catch (error) {
                  JarvisLogger.default.error(AlexaRouter.name, error);
                  //exeception
                  let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                  res.json(unsupportedResponseBody);
               }
             }else{
                JarvisLogger.default.error('AlexaRouter giVoiceService GenderIntent : Gender : null');
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
             }
            /**** End --------------------Gender */
          }else if(
            request.intent.name === Type.CustomRequestNames.UserConfirmation
          ) {

            /**** ------------------------Common confirmation intent for YES_NO slot */
            JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
            let confirmationSlot = request.intent.slots.confirmation.value;
            JarvisLogger.default.debug('AlexaRouter giVoiceService UserConfirmation : confirmation '+ confirmationSlot);
            
            if(
                session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
                session.attributes.category === Type.CustomIntentCategoryName.GenderCategory
            ) {
              //must belong to intent category GenderCategory
              JarvisLogger.default.debug('AlexaRouter giVoiceService (AutoQuote, UserConfirmation, GenderCategory) => quotePremiumService.reviewTermsIntent : sessionAttributes '+ JSON.stringify(sessionAttributes));
              //review quote premium confirmation
              let responseBody = await this.quotePremiumService.reviewTermsIntent(confirmationSlot, sessionAttributes);
              res.json(responseBody);    
            }else if(
              session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
              session.attributes.category === Type.CustomIntentCategoryName.AgeCategory
            ) {
              //must belong to intent category AgeCategory
              JarvisLogger.default.debug('AlexaRouter giVoiceService (AutoQuote, UserConfirmation, AgeCategory) => ageService.getAgeIntent : sessionAttributes '+ JSON.stringify(sessionAttributes));
              //review age confirmation
              let responseBody = await this.ageService.getAgeIntent(confirmationSlot, sessionAttributes);
              res.json(responseBody);    
            }else if(
              session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
              session.attributes.category === Type.CustomIntentCategoryName.YearMakeModelCategory
            ) {
              //must belong to intent category YearMakeModelCategory
              JarvisLogger.default.debug('AlexaRouter giVoiceService (AutoQuote, UserConfirmation, YearMakeModelCategory) => ymmIntentService.confirmYearMakeModelIntent : sessionAttributes '+ JSON.stringify(sessionAttributes));
              //review Year/Make/Model code confirmation
              let responseBody = await this.ymmIntentService.confirmYearMakeModelIntent(confirmationSlot, sessionAttributes);
              res.json(responseBody);     
            }else if(
              session.attributes.journery === Type.CustomJourneyRequestNames.AutoQuote &&
              session.attributes.category === Type.CustomIntentCategoryName.PostalCodeCategory
            ) {
              //must belong to intent category PostalCodeCategory
              JarvisLogger.default.debug('AlexaRouter giVoiceService (AutoQuote, UserConfirmation, PostalCodeCategory) => postalCodeService.confirmPostalCodeIntent : sessionAttributes '+ JSON.stringify(sessionAttributes));
              //review postal code confirmation
              let responseBody = await this.postalCodeService.confirmPostalCodeIntent(confirmationSlot, sessionAttributes);
              res.json(responseBody);      
            }else if(
              session.attributes.journery === Type.CustomJourneyRequestNames.AutoInsurance &&
              session.attributes.category === Type.CustomIntentCategoryName.KnowledgeBaseCategory
            ) {
              //must belong to intent category KnowledgeBaseCategory
              JarvisLogger.default.debug('AlexaRouter giVoiceService (AutoInsurance, UserConfirmation, KnowledgeBaseCategory) => knowledgeBaseService.confirmKnowledgeBaseQuestionIntent : sessionAttributes '+ JSON.stringify(sessionAttributes));
              //review question confirmation
              let responseBody = await this.knowledgeBaseService.confirmKnowledgeBaseQuestionIntent(confirmationSlot, sessionAttributes);
              res.json(responseBody);      
            }else {
              JarvisLogger.default.error('AlexaRouter giVoiceService UserConfirmation : UserConfirmation : invalid');
              //exeception
              let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
              res.json(unsupportedResponseBody);
            }
            /**** End------------------------Common confirmation intent for YES_NO slot */

          }else if(
            session.attributes.journery === Type.CustomJourneyRequestNames.AutoInsurance &&
            request.intent.name === Type.CustomRequestNames.CatchAllQuestions
          ) {
            /**** --------------------FAQ */
            JarvisLogger.default.debug('request.intent.name === FAQ'); 
            JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 

            try {
                let catchAllSlot = request.intent.slots.catchAll.value;
                JarvisLogger.default.debug('Catch all : '+ catchAllSlot); 
                let responseBody = await this.knowledgeBaseIntentService.getKnowledgeBaseService(catchAllSlot, sessionAttributes);
                res.json(responseBody);
              } catch (error) {
                JarvisLogger.default.error(AlexaRouter.name, error);
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
            }
            /**** End --------------------FAQ */
          } else {
              /**** --------------------No machine request/slot/state */
              JarvisLogger.default.debug('ELSE ========= No machine request/slot/state'); 
              JarvisLogger.default.debug('ELSE ========= session.attributes\n'+ JSON.stringify(session.attributes)); 
              let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
              res.json(unsupportedResponseBody);
              /**** End--------------------No machine request/slot/state */
          }
        }else {

            JarvisLogger.default.debug('request.intent.name === Unknown intent type'); 
            JarvisLogger.default.debug('\nintent : '+ request.intent.name + '\njournery :' + session.attributes.journery +  '\ncategory : ' + session.attributes.category); 
            
            try {
              let responseBody = this.service.mainMenuBuildResponse(session.attributes.deviceId);
              res.json(responseBody);
            } catch (error) {
                JarvisLogger.default.error(AlexaRouter.name, error);
                //exeception
                let unsupportedResponseBody = this.service.unsupportedBuildResponse(session.attributes.deviceId);
                res.json(unsupportedResponseBody);
            }
        }
      
    } catch (error) {
        JarvisLogger.default.error('===========Excpetion at root level of api.ts===========\n' + error);
        //const status = HttpStatus.INTERNAL_SERVER_ERROR;
        //const errorMessage = `{"version":"1.0","response":{"outputSpeech":{"type":"SSML","ssml":"<speak>Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as=\"telephone\">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?</speak>"},"shouldEndSession":false,"reprompt":{"outputSpeech":{"type":"SSML","ssml":"<speak>Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as=\"telephone\">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?</speak>"}}}}`;
        //res.status(status).json(JSON.parse(errorMessage));

        let options = new Type.Options();
        const cardSpeech = `Sorry I can't help you at the moment. Please call Aviva at 1-855-788-9090 or visit www.avivainsurance.ca for more information.`;
        options.speechText = `Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as="telephone">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?`;
        options.repromptText = `Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as="telephone">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?`;
        
        //create new session and re-initialize session state
        let sessionAttributes:Type.Attributes = new Type.Attributes();

        //reset session journey is not initiated
        sessionAttributes.journery = Type.CustomIntentInitalValues.NotInitiated;

        //reset session category is not initiated
        sessionAttributes.category = Type.CustomIntentInitalValues.NotInitiated;
        
        //set session with deviceId in session.
        sessionAttributes.deviceId = req.body.context.System.device.deviceId;

        //reset session with GUID to identify the stateless service interation.
        sessionAttributes.GUID = Guid.newGuid();

        //reset session postal code intent attempts to 0
        sessionAttributes.postalCodeIntentAttempts = 0;
        
        //reset session vechicle year intent attempts to 0
        sessionAttributes.vehicleYearIntentAttempts = 0;
        
        //reset session vehicle make intent attempts to 0
        sessionAttributes.vehicleMakeIntentAttempts = 0;
        
        //reset session vehicel model intent attempts to 0
        sessionAttributes.vehicleModelIntentAttempts = 0;

        //continue session
        options.endSession = false;

        options.attributes = sessionAttributes;
        JarvisLogger.default.debug('Excpetion followed by clear session and jump main menu : options '+ JSON.stringify(options));

        let responseBody = this.service.buildResponseWithCard(cardSpeech, options);
        res.json(responseBody);
    }

        JarvisLogger.default.debug('stop giVoiceService');
    }
}