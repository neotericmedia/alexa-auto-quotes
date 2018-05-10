import {Type, Exclude, plainToClass} from "class-transformer";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */

export class Address {
	addressLine1: string;
	addressLine1Kanji: string;
	addressLine2: string;
	addressLine2Kanji: string;
	addressLine3: string;
	addressType: string;
	aptOrSuiteNo: string;
	city: string;
	cityKanji: string;
	country: string;
	displayName: string;
	isAutofilled: boolean;
	postalCode: string;
	id: string;
	state: string;
	streetList: string[];

	@Exclude()
	streetAddress: string;

	@Exclude()
	isAddressValid: boolean; // TRUE after address valid called

	@Exclude()
	addressChanged: boolean; // FALSE by default -- TRUE after postal code modal submit
}
