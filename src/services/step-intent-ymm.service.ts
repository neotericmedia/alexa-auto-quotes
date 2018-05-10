import { NextFunction, Request, Response } from "express";
import * as Type from '../models/core/alexa.model';

import { JarvisLogger } from "../util/JarvisLogger";
import { ProductService } from '../services/quote/core/quote-product.service';
import { SessionService } from '../services/core/session.service';
import { ResponseBuilderService } from '../services/core/response-builder.service';

import { YearMakeModelService } from '../services/quote/core/quote-ymm.service';
import { VehicleService } from '../services/quote/core/quote-vehicle.service';
import { VehicleLookup, VehicleLookupRequest } from '../models/quote/lob/auto/vehicles/vehicle-lookup.model';
import { Vehicle } from '../models/quote/lob/auto/vehicles/vehicle.model';
import { TypeList, Pair } from "../models/quote/lob/common/typelist.model";
import { MetaDataVehicleYearService } from '../services/quote/core/quote-metadata-year.service';
import { MetaDataVehicleMakeService } from '../services/quote/core/quote-metadata-make.service';
import { MetaDataVehicleModelService } from '../services/quote/core/quote-metadata-model.service';
import { VehicleInfo } from '../models/quote/lob/auto/vehicles/vehicle-info.model';

/**
 * Intent Request - Year/Make/Model.
 */
export class YearMakeModelIntentService {

   private giServiceProductService: ProductService;
   private sessionService: SessionService;
   private builderService: ResponseBuilderService;
   private yearMakeModelService: YearMakeModelService;
   private vehicleService: VehicleService;
   private metaDataVehicleYearService: MetaDataVehicleYearService;
   private metaDataVehicleMakeService: MetaDataVehicleMakeService;
   private metaDataVehicleModelService: MetaDataVehicleModelService;

   constructor(){        
       this.giServiceProductService = new ProductService();
       this.sessionService = new SessionService();        
       this.builderService = new ResponseBuilderService();  
       this.yearMakeModelService = new YearMakeModelService(); 
       this.vehicleService = new VehicleService();   
       this.metaDataVehicleYearService = new MetaDataVehicleYearService();   
       this.metaDataVehicleMakeService = new MetaDataVehicleMakeService();
       this.metaDataVehicleModelService = new MetaDataVehicleModelService();
     }


     public async getYmmIntent(ymmSlot: string, sessionAttributes: Type.Attributes): Promise<Type.ResponseBody> {
        

        
        const mainMenuResponse = this.builderService.mainMenuBuildResponse(sessionAttributes.deviceId);
        return mainMenuResponse;

        /*let options = new Type.Options();
        const productCode = String(process.env.GI_PRODUCT_CODE);
        //call Year/Make/Model service using input
        let vehicleInfoResult = await this.yearMakeModelService.yearMakeModelSearch(ymmSlot);
        if(vehicleInfoResult.vehicleInfoList.length == 0){

            JarvisLogger.default.debug("YearMakeModel - ymmService - YYM : \n" +"Not able to find - lenght = 0");
            options.speechText = `Please tell me the 'Year' of your car. Say my 'Year' is`,
            options.repromptText = `Please tell me the 'Year' of your car. Say my 'Year' is`,
            options.endSession = false;

            return this.builderService.buildResponse(options);

        } else if(vehicleInfoResult.vehicleInfoList.length === 1){
            //map YYM 
            JarvisLogger.default.debug("YearMakeModel - ymmService - YYM : \n" +"Able to find - lenght = 1");
            let vehicleLookupRequest = new VehicleLookupRequest();
            vehicleLookupRequest.vehicleInfoResult = vehicleInfoResult;

            //to test locally
            if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
                JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
                const saveSession:Type.Attributes = await this.sessionService.getSession(); 
                vehicleLookupRequest.attribute = saveSession;
            }else{
                vehicleLookupRequest.attribute = sessionAttributes;
            }
            
            vehicleLookupRequest = this.vehicleService.mapYearMakeModel(vehicleLookupRequest);
            const vehicle:Vehicle = await this.vehicleService.getLookupRatingInfo(vehicleLookupRequest);

            options.speechText = "Are you at least 25 years old?",
            options.repromptText = "Are you at least 25 years old?",
            options.endSession = false;
            //updated session
            options.attributes = vehicleLookupRequest.attribute;
            //updated quote vehicle
            options.attributes.quote.quoteDraft.autoDraft.listOfVehicles[0] = vehicle;
            
            //to test locally
            if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
                JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
                this.sessionService.saveSession(options.attributes);
            }

            let responseBody = this.builderService.buildResponse(options);
            return responseBody;
                
        }else{
            JarvisLogger.default.debug("YearMakeModel - ymmService - YYM : \n" +"Able to find - lenght > 1");
            options.speechText = "Are you at least 25 years old?",
            options.repromptText = "Are you at least 25 years old?",
            options.endSession = false;

            //update session
            options.attributes = sessionAttributes

            return this.builderService.buildResponse(options);
        }*/
    }


    public async getVehicleYearIntent(vehicleYear: string, sessionAttributes: Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug("YearMakeModelIntentService - getVehicleYearIntent - "+ vehicleYear); 

        //maximum 3 attempts of vehicle year intent apptempts 
        if(sessionAttributes.vehicleYearIntentAttempts == 2){
            JarvisLogger.default.debug("YearMakeModelIntentService - getVehicleYearIntent maximum 3 attemps - jump to main menu");
            const mainMenuResponse = this.builderService.mainMenuBuildResponse(sessionAttributes.deviceId);
            return mainMenuResponse;
        }else{
            //update session with vehicle year intent apptempts increcmented by 1 
            sessionAttributes.vehicleYearIntentAttempts = sessionAttributes.vehicleYearIntentAttempts + 1;
        }

        const yearTypeList = await this.metaDataVehicleYearService.getVehicleYears();
        let vehYears: Pair[] = [];
        vehYears = yearTypeList.typeCodes;
        let index = yearTypeList.typeCodes.findIndex(item => item.value === vehicleYear);

        JarvisLogger.default.debug('YearMakeModelIntentService getVehicleYearIntent vehYears = vehicleYear - index = '+index + ' \n' + JSON.stringify(vehYears));

        let responseBody = this.builderService.vehicleYearBuildResponse(index, vehicleYear, sessionAttributes);
        return responseBody;
    
    }


    public async getVehicleMakeIntent(vehicleMake: string, sessionAttributes: Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug("YearMakeModelIntentService - getVehicleMakeIntent - "+ vehicleMake); 

        //maximum 3 attempts of vehicle make intent apptempts 
        if(sessionAttributes.vehicleMakeIntentAttempts == 2){
            JarvisLogger.default.debug("YearMakeModelIntentService - getVehicleMakeIntent maximum 3 attemps - jump to main menu");
            const mainMenuResponse = this.builderService.mainMenuBuildResponse(sessionAttributes.deviceId);
            return mainMenuResponse;
        }else {
            //update session with vehicle make apptempts increcmented by 1 
            sessionAttributes.vehicleMakeIntentAttempts = sessionAttributes.vehicleMakeIntentAttempts + 1;
        }
        const makeTypeList = await this.metaDataVehicleMakeService.getVehicleMakes(sessionAttributes.vehicleYear);
        let vehMakes: Pair[] = [];
        vehMakes = makeTypeList.typeCodes;
       
        let vehicleMakeValue  = vehicleMake.toUpperCase();
        let index = makeTypeList.typeCodes.findIndex(item => item.value === vehicleMakeValue);

        JarvisLogger.default.debug('YearMakeModelIntentService getVehicleMakeIntent vehicleMake ' + vehicleMakeValue + ' index = '+index + ' \nvehMakes =' + JSON.stringify(vehMakes));
        
        let responseBody = this.builderService.vehicleMakeBuildResponse(index, vehicleMakeValue, sessionAttributes);
        return responseBody;
    
    }


    public async getVehicleModelIntent(vehicleModel: string, sessionAttributes: Type.Attributes): Promise<Type.ResponseBody> {
        JarvisLogger.default.debug("YearMakeModelIntentService - getVehicleModelIntent vehicleModel - "+ vehicleModel); 

        //maximum 3 attempts of vehicle model intent apptempts 
        if(sessionAttributes.vehicleModelIntentAttempts == 2){
            JarvisLogger.default.debug("YearMakeModelIntentService - getVehicleModelIntent maximum 3 attemps - jump to main menu");
            const mainMenuResponse = this.builderService.mainMenuBuildResponse(sessionAttributes.deviceId);
            return mainMenuResponse;
        }else {
            //update session with vehicle model apptempts increcmented by 1 
            sessionAttributes.vehicleModelIntentAttempts = sessionAttributes.vehicleModelIntentAttempts + 1;
        }

        let options = new Type.Options();

        let vehicleModelValue = vehicleModel.toUpperCase();
        //update session with vehicle model
        sessionAttributes.vehicleModel = vehicleModelValue;
        //all valid year, make & model session values
        if(
            (typeof sessionAttributes.vehicleYear != 'undefined' && sessionAttributes.vehicleYear) && 
            (typeof sessionAttributes.vehicleMake != 'undefined' && sessionAttributes.vehicleMake) && 
            (typeof sessionAttributes.vehicleModel != 'undefined' && sessionAttributes.vehicleModel)
        ){
            JarvisLogger.default.debug('YearMakeModelIntentService - getVehicleModelIntent Yeam/Make/Model of car is VALID - '+ ' [vehicleYearSlot - ' + sessionAttributes.vehicleYear + ' vehicleMakeSlot - '+ sessionAttributes.vehicleMake  + ' vehicleModelSlot - '+ sessionAttributes.vehicleModel + ']');
            //construct Year/Make/Model
            let yearMakeModelValue = sessionAttributes.vehicleYear + ' ' + sessionAttributes.vehicleMake + ' ' + sessionAttributes.vehicleModel;
            //update session with vehicle year/make/model
            sessionAttributes.yearMakeModel = yearMakeModelValue;

            JarvisLogger.default.debug('YearMakeModelIntentService - getVehicleModelIntent Yeam/Make/Model of car is - '+ yearMakeModelValue+ ' [vehicleYearSlot - ' + sessionAttributes.vehicleYear + ' vehicleMakeSlot - '+ sessionAttributes.vehicleMake  + ' vehicleModelSlot - '+ sessionAttributes.vehicleModel + ']');

            //check if valid Year/Make/Model with Guidewire.
            const vehicleModelInfo = await this.metaDataVehicleModelService.getVehicleModelInfo(sessionAttributes.vehicleYear, sessionAttributes.vehicleMake);
            let vehModels: VehicleInfo[] = [];
            //by default vehicle not found.
            let vehicleFound = false;
            //to capture defaulted year/make/model.
            let defaultYearMakeModel = ''; 
            vehModels = vehicleModelInfo.vehicleInfoList;

            //check if uppercse model matches one of the result
            for(var item of vehModels) {
                 if(item.model.indexOf(vehicleModelValue) >= 0){
                    JarvisLogger.default.debug('YES - Model Matched - item.model ' + item.model + ' vehicleModelValue ' + vehicleModelValue + ' item = ' + JSON.stringify(item));
                    //get the first matched model.
                    vehicleFound = true;
                    //IMPORTANT NOTE: get the first matched model and default with this vehicle info.
                    //defaulted Year/Make/Model
                    defaultYearMakeModel = item.year + ' ' + item.make + ' '+ item.model;
                    JarvisLogger.default.debug('YES - Model Matched - Year/Make/Model -' + defaultYearMakeModel);
                    break;
                }
            }
            
            if (vehicleFound) {
                
                JarvisLogger.default.debug('====Year/Make/Model of car is GUIDEWIRE VALID===\nDefaulted Year/Make/Model Value - ' +  defaultYearMakeModel + '\nProvided Year/Make/Model Value -'+ yearMakeModelValue);

                let vehicleInfoResult = await this.yearMakeModelService.yearMakeModelSearch(defaultYearMakeModel); 
                JarvisLogger.default.debug('vehicleInfoResult.vehicleInfoList - \n' + vehicleInfoResult.vehicleInfoList);   
                console.log('vehicleInfoResult.vehicleInfoList.length - ' + vehicleInfoResult.vehicleInfoList.length);  
                        
                if (vehicleInfoResult.vehicleInfoList.length > 0) {
                    //TODO - lenght==1 and length >0
                    //map YYM 
                    JarvisLogger.default.debug("YearMakeModel - ymmService - YYM : \n" +"Able to find - lenght = 1");
                    let vehicleLookupRequest = new VehicleLookupRequest();
                    vehicleLookupRequest.vehicleInfoResult = vehicleInfoResult;

                    //to test locally
                    if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
                        JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
                        const saveSession:Type.Attributes = await this.sessionService.getSession(); 
                        vehicleLookupRequest.attribute = saveSession;
                        JarvisLogger.default.debug("vehicleLookupRequest.attribute : \n" +JSON.stringify(vehicleLookupRequest.attribute));
                    }else{
                        vehicleLookupRequest.attribute = sessionAttributes;
                        JarvisLogger.default.debug("vehicleLookupRequest.attribute : \n" +JSON.stringify(vehicleLookupRequest.attribute));
                    }
                    
                    vehicleLookupRequest = this.vehicleService.mapYearMakeModel(vehicleLookupRequest);
                    JarvisLogger.default.debug('YearMakeModelIntentService - getVehicleModelIntent vehicleLookupRequest ' + JSON.stringify(vehicleLookupRequest));
                    //lookup vehicle based on year/make/model
                    const vehicle:Vehicle = await this.vehicleService.getLookupRatingInfo(vehicleLookupRequest);
                    
                    //override current session with latest data
                    sessionAttributes = vehicleLookupRequest.attribute;
                    //updated quote vehicle
                    sessionAttributes.quote.quoteDraft.autoDraft.listOfVehicles[0] = vehicle;
                    //updated session with defaulted year/make/model
                    sessionAttributes.defaultYearMakeModel = defaultYearMakeModel;
                    //retun resposne for vehicle found
                    return this.builderService.vehicleModelFoundBuildResponse(sessionAttributes);


                } else {
                    JarvisLogger.default.debug('YearMakeModelIntentService - getVehicleModelIntent Yeam/Make/Model of car is NOT VALID - '+ yearMakeModelValue+ ' [vehicleYearSlot - ' + sessionAttributes.vehicleYear + ' vehicleMakeSlot - '+ sessionAttributes.vehicleMake  + ' vehicleModelSlot - '+ sessionAttributes.vehicleModel + ']');
                    //retun resposne for vehicle not found
                    return this.builderService.vehicleModelNotFoundBuildResponse(yearMakeModelValue, sessionAttributes);
                }

            }else {
                
                JarvisLogger.default.debug('YearMakeModelIntentService - getVehicleModelIntent Yeam/Make/Model of car is NOT a GUIDEWIRE VALID - '+ yearMakeModelValue+ ' [vehicleYearSlot - ' + sessionAttributes.vehicleYear + ' vehicleMakeSlot - '+ sessionAttributes.vehicleMake  + ' vehicleModelSlot - '+ sessionAttributes.vehicleModel + ']');
                //retun resposne for vehicle not found
                return this.builderService.vehicleModelNotFoundBuildResponse(yearMakeModelValue, sessionAttributes);
            }


        } else {
            JarvisLogger.default.debug('YearMakeModelIntentService - getVehicleModelIntent Yeam/Make/Model of car is NOT VALID - '+ ' [vehicleYearSlot - ' + sessionAttributes.vehicleYear + ' vehicleMakeSlot - '+ sessionAttributes.vehicleMake  + ' vehicleModelSlot - '+ sessionAttributes.vehicleModel + ']');
            //retun resposne for invalid vehicle
            return this.builderService.vehicleModelNotFoundBuildResponse('', sessionAttributes);
        }

            
    
    }

    /**
     * Year/Make/Model confirmation.
     * @param yearMakeModelConfirmation 
     */
    public async confirmYearMakeModelIntent(yearMakeModelConfirmation: string, sessionAttributes:Type.Attributes): Promise<Type.ResponseBody> {              
       
       let options = new Type.Options();

       if (yearMakeModelConfirmation === 'yes') {
            JarvisLogger.default.debug("YearMakeModelIntentService - (yearMakeModelConfirmation == yes) : \n" +"Year/Make/Model is confirmed by User");
            
            let responseBody = this.builderService.confirmYesYearMakeModelBuildResponse(sessionAttributes);

            //to test locally
            if(String(process.env.NODE_TEST_LOCAL) == 'Y'){
                JarvisLogger.default.debug('NODE_TEST_LOCAL is Y');
                this.sessionService.saveSession(responseBody.sessionAttributes);
            }

            return responseBody;
        }else{
            
            JarvisLogger.default.debug("YearMakeModelIntentService - (yearMakeModelConfirmation == no) : \n" +"Year/Make/Model is not confirmed by User");
            //vechicle not matching
            let responseBody = this.builderService.confirmNoYearMakeModelBuildResponse(sessionAttributes);
            return responseBody;
        }
     }

}