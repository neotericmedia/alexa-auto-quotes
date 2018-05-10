import {Type, Exclude, plainToClass} from "class-transformer";

import { PriorClaim} 	from "../common/priorclaim.model";
/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */

export class IClarifyReport {
	iClarifyGUID: string;
	iClarifyImageReportUrl: string;
	iClarifyLocationId: string;
	iClarifyOrderDate: Date;
	iClarifyPDFReportUrl: string;
	iClarifyPreferenceID: string;
	iClarifyResponseCode: string;

}

export class PerilScoreReport {
	perilScore: string[];
	perilScoreAccuracyCode: string[];
	perilType: string[];
}
export class Dwelling {

	structureType: string;
	yearBuilt: number;
	constructionType: string;
	primaryHeatingDevice: string;
	primaryHeatingFuelType: string;
	oilTankLocation: string;
	oilTankYearBuilt: number;
	fireProtection: string;
	alarmTypeCode: string;
	waterAlarm: string;
	sumpPumpType: string;
	replacementCost: number;
	roofType: string;
	finishedBasement: boolean;
	roofUpgradeYear: number;
	heatingUpgradeYear: number;
	hasBackwaterValve: boolean;
	plumbingUpgradeYear: number;
	wiringUpgradeYear: number;
	personalPropertyLimit: number;
	hasSepticTank: boolean;
	percentFinished: string;
	hasBasement: string;
	sewerBackupTerritoryCode: string;

	hasPriorClaims: boolean; // ApplicantInfo
	claimsLast5Years: number; // ApplicantInfo
	previousInsurance: boolean; // ApplicantInfo

	smokersInHousehold: boolean;
	hasInterestedParty: boolean;
	carAndHomeDiscountOptional: boolean;
	timeWithPreviousInsurer: string; // ApplicantInfo
	yearsResident: string; // ApplicantInfo

	photoUrl: string;

	ratingFactor1: string;
	ratingFactor2: string;
	squareFootage: number;
	bathroomNumber: string;
	kitchenNumber: string;
	storiesNumber: string;
	foundationType: string;

	@Type(() => PriorClaim)
	priorClaims: PriorClaim[];

	@Type(() => IClarifyReport)
	iClarifyReport: IClarifyReport;

	@Type(() => PerilScoreReport)
	perilScoreReport: PerilScoreReport;
	
}
