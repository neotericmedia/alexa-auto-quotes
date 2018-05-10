import {Type, Exclude, plainToClass} from "class-transformer";

import { Vehicle }        from "./vehicle.model";
import { VehicleInfoResult } from "./vehicle-info.model";
import * as Alexa from "../../../../../models/core/alexa.model";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */


export class VehicleLookup {
	@Type(() => Vehicle)
	vehicle: Vehicle;

	effectiveDate: Date;
	lineOfBusiness: string;
	uwCompany: string;
}

/**
 * Alexa specific model
 */
export class VehicleLookupRequest {

	@Type(() => VehicleInfoResult)
	vehicleInfoResult: VehicleInfoResult;
	
	@Type(() => VehicleLookup)
	vehicleLookup: VehicleLookup;

	@Type(() => Alexa.Attributes)
	attribute: Alexa.Attributes;
}