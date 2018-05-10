import {Type, Exclude, plainToClass} from "class-transformer";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */

export class Vehicle {

	@Exclude()
	active: boolean = false;
	@Exclude()
	valid: boolean = true;
	@Exclude()
	index: number;

	id: string;
	annualMileage: number;
	commutingMiles: number;
	make: string;
	model: string;
	year: number;
	vehiclePurchaseDate: Date;
	primaryUse: string;
	name: string;
	vin: string;
	costNew: number;
	displayName: string;
	leaseOrRent: boolean;
	lengthOfLease: string;
	license: string;
	licenceState: string;
	antiTheftDevice: string;
	winterTiresInstalled: boolean;
	licensePlate: string;
	ratingFactors1: string;
	ratingFactors2: string;
	ratingPostalCode: string;
	ratingProvince: string;
	collRateGroup: string;
	compRateGroup: string;
	dcpdRateGroup: string;
	accidentBenefitRateGroup: string;
	carCode: string;
	vehicleNum: number;
	vehicleType: string;
	vehicleClassType: string;
	engineSize: number;
	abs: string;
	msrp: number;
	engineDisplacement: string;
	is3WheeledATV: boolean;
	businessUse: boolean;
	// @Exclude()
	length: string;
	modelID: string;
	isOriginalOwner: boolean;
	vehilcePurchaseCondition: string;
	businessUsePercentage: number;
	isException: boolean;
	isMCYException: boolean;
	brandNewValue: number;
}
