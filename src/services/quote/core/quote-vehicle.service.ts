import { NextFunction, Request, Response } from "express";
import * as request from "request";

import { JarvisLogger } from "../../../util/JarvisLogger";
import { VehicleInfoResult, VehicleInfo } from "../../../models/quote/lob/auto/vehicles/vehicle-info.model";
import { Vehicle } from "../../../models/quote/lob/auto/vehicles/vehicle.model";
import { VehicleLookup, VehicleLookupRequest } from "../../../models/quote/lob/auto/vehicles/vehicle-lookup.model";
import { Quote }  from "../../../models/quote/quoter/quoter.model";
import { SessionService } from "../../../services/core/session.service";
import * as Type from "../../../models/core/alexa.model";

/**
 * REST web service connector to GI-Service to invoke vehicle service.
 */
export class VehicleService {

	/** Common configuration properties. */
	private config: ConfigProperties;
	private localSessionService: SessionService;
	/** Constructor to initialize configuration. */
	constructor() {
		this.initConfig();
		this.localSessionService = new SessionService();
	}

	/**
	 * Invokes check Year/Make/Model invocking GI service.
	 */
	public async getLookupRatingInfo(vehicleLookupRequest: VehicleLookupRequest): Promise<Vehicle> {
		JarvisLogger.guidewire.debug('VehicleService getLookupRatingInfo'); 
		const self = this;

		return new Promise<Vehicle>((resolve, reject) => {
			if (!vehicleLookupRequest || vehicleLookupRequest.vehicleInfoResult.vehicleInfoList.length < 1) {
				JarvisLogger.guidewire.error('Empty input. Terminated Vehicle lookup request.');
				reject(new Error("Empty input. Terminated Vehicle lookup request."));
			}
			// TODO: update vechicle separate method
			const opts = self.reqOptions(vehicleLookupRequest);
			
			request(opts, (err, res, body) => {
				if (err) {
					reject(err);
				} else {
					const responseVehicle = JSON.parse(body);                   
					const updatedVehicle: Vehicle = this.mapRatingInfo(responseVehicle, vehicleLookupRequest.attribute.quote.quoteDraft.autoDraft.listOfVehicles[0]);				
					resolve(updatedVehicle);
				}
			});
		});
	}

	
	/** Initialize settings read from env properties once. */
	private initConfig() {
		const cfg: ConfigProperties = {} as ConfigProperties;
		this.config = cfg;
		
		// Use env properties
		cfg.method = "POST";

		// Remove needless slashes before uri concatenation
		const host = String(process.env.GI_SERVICE_HOST);
		const path = String(process.env.GI_RATING_INFO_AUTO_PATH);
		cfg.host = host ? host.replace(/(\/)$/, "") : host;
		cfg.path = path ? path.replace(/^\//, "") : path;
		cfg.uri = cfg.host + "/" + cfg.path;
	}

	/** Construct headers for rate request. */
	private reqHeaders(gicookie: string[]) {
		const reqHeaders = {
			"User-Agent": "node",
			"Accept": "application/json",
			"Accept-Encoding": "none",
			"Content-Type": "application/json",
			"cookie": gicookie
		};
		return reqHeaders;
	}

	/** Construct options for rate request. */
	private reqOptions(vehicleLookupRequest: VehicleLookupRequest): any {

		const vehicleLookup: VehicleLookup = new VehicleLookup();
		vehicleLookup.vehicle = vehicleLookupRequest.attribute.quote.quoteDraft.autoDraft.listOfVehicles[0];
		vehicleLookup.vehicle.ratingPostalCode = vehicleLookupRequest.attribute.quote.quoteDraft.policyAddress.postalCode;
		vehicleLookup.vehicle.ratingProvince = vehicleLookupRequest.attribute.quote.quoteDraft.policyAddress.state;
		vehicleLookup.effectiveDate = vehicleLookupRequest.attribute.quote.quoteDraft.periodStartDate;
		vehicleLookup.lineOfBusiness = vehicleLookupRequest.attribute.quote.quoteDraft.productCode;
		vehicleLookup.uwCompany = vehicleLookupRequest.attribute.quote.quoteDraft.uwCompany;

		const hdrs = this.reqHeaders(vehicleLookupRequest.attribute.gicookie);
		const opts = {
			uri: this.config.uri,
			method: this.config.method,
			headers: hdrs,
			body: JSON.stringify(vehicleLookup)
		};

		return opts;
	}

	/**
	 * Map Rating info
	 * @param quote
	 * @param productAvailability 
	 */
	private mapRatingInfo(sourceVehicle: Vehicle, targetVehicle: Vehicle): Vehicle {

		targetVehicle.ratingFactors1 = sourceVehicle.ratingFactors1;
		targetVehicle.ratingFactors2 = sourceVehicle.ratingFactors2;
		targetVehicle.collRateGroup = sourceVehicle.collRateGroup;
		targetVehicle.compRateGroup = sourceVehicle.compRateGroup;
		targetVehicle.dcpdRateGroup = sourceVehicle.dcpdRateGroup;
		targetVehicle.accidentBenefitRateGroup = sourceVehicle.accidentBenefitRateGroup;
		targetVehicle.carCode = sourceVehicle.carCode;
		targetVehicle.msrp = sourceVehicle.msrp;
		targetVehicle.abs = sourceVehicle.abs;
		targetVehicle.engineSize = sourceVehicle.engineSize;
		targetVehicle.isMCYException = sourceVehicle.isMCYException;
		targetVehicle.vehicleClassType = sourceVehicle.vehicleClassType;  
		
		return targetVehicle;
	}

	public mapYearMakeModel(vehicleLookupRequest: VehicleLookupRequest): VehicleLookupRequest {
		JarvisLogger.guidewire.debug('VehicleService mapYearMakeModel'); 
		const vehicleInfo: VehicleInfo = vehicleLookupRequest.vehicleInfoResult.vehicleInfoList[0];
		JarvisLogger.guidewire.debug('VehicleService mapYearMakeModel vehicleInfo' + JSON.stringify(vehicleInfo)); 
		JarvisLogger.guidewire.debug('VehicleService mapYearMakeModel vehicleLookupRequest.attribute' + JSON.stringify(vehicleLookupRequest.attribute)); 
		const quote: Quote = vehicleLookupRequest.attribute.quote;
		JarvisLogger.guidewire.debug('VehicleService mapYearMakeModel quote' + JSON.stringify(quote)); 
		quote.quoteDraft.autoDraft.listOfVehicles[0].make = vehicleInfo.make;
		quote.quoteDraft.autoDraft.listOfVehicles[0].model = vehicleInfo.model;
		quote.quoteDraft.autoDraft.listOfVehicles[0].year = parseInt(vehicleInfo.year);
		vehicleLookupRequest.attribute.quote = quote;
		JarvisLogger.guidewire.debug('VehicleService mapYearMakeModel vehicleLookupRequest' + JSON.stringify(vehicleLookupRequest)); 
		return vehicleLookupRequest;
	}
}


/** Type for configuration properties. */
interface ConfigProperties {
	host: string;
	path: string;
	uri: string;
	method: string;
	gicookie: string;
}

