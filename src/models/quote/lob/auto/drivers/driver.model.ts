import {Type, Exclude, plainToClass} from "class-transformer";

import { MVRIncident } from "../../common/mvr-incident.model";
import { PriorClaim} from "../../common/priorclaim.model";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */

export class Driver {

	@Exclude()
	type: string = "Driver";
	@Exclude()
	active: boolean = false;
	@Exclude()
	index: number;
	@Exclude()
	valid: boolean = true;


	id: string;
	dateOfBirth: Date;
	gender: string;
	driverNumber_AC: number;

	// listOfLicenseClasses
	completedTrainingIn3Years: boolean = false;
	dateCompletedTrainingClass: Date;

	// For rider
	completedRiderTrainingIn3Years: boolean = false;
	dateCompletedRiderTrainingClass: Date; 

	numberOfConvictionInLast3Years: number = 0;

	firstName: string;
	lastName: string;
	emailAddress: string;

	@Type(() => MVRIncident)
	mvrIncidents: MVRIncident[];
	@Type(() => PriorClaim)
	priorClaims: PriorClaim[];
	numberOfClaimsAtFault: number = 0;
	marketingOptIn: boolean;
	canceledForNonPayLast3Years: boolean;

	@Type(() => LicenceClass)
	listOfLicenceClasses: LicenceClass[];

	timeWithPreviousInsurer: string;
	yearsOfPriorInsurance: number;
	// multiVehicleDiscount: boolean;
	carAndHomeDiscountNamedInsured: boolean;
	hadLicenceSuspension: boolean;
	hadPriorInsurance: boolean;
	
	// Motorcycle driving history
	hadContinuousMotorcycleInsurance: boolean = false;
	continuousMotorcycleInsuranceSince: Date;
	hadPriorMotorcycleInsurance: boolean;

	phoneNumber: string;
	primaryPhoneType: string;
	firstLicenceDate: Date;
	firstMotorcycleLicenceDate: Date;
	maritalStatus: string;
	licenceState: string;
	
	isPrimaryDriver(): boolean {
		return this.driverNumber_AC === 1;
	}
}



export class LicenceClass {

	licenceTypeClass: string;
	dateLicense: Date;

}
