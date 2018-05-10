import {Type, Exclude, plainToClass} from "class-transformer";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */

export class VehicleInfo {
	
	year: string;
	make: string;
	model: string;
	modelID: string;
	engineDisplacement: string;
	engineStroke: string;
	length: string;
	motorhomeClassification: string;
	abs: string;
	msrp: number;
	classType: string;
	carCode: string;
	isException: boolean;

}	


export class VehicleInfoResult {
	
	vehicleType: string;

	@Type(() => VehicleInfo)
	vehicleInfoList: VehicleInfo[];

}