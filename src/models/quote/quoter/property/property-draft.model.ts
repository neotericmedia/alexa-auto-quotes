import {Type, Exclude, plainToClass} from "class-transformer";

import { Dwelling } from "./../../lob/property/dwelling.model";
import { Address }        from "../../lob/common/address.model";
/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */
export class PropertyDraft {
	
	@Type(() => Dwelling)
	propertyDwelling: Dwelling;
	propertyAddress: Address;
	propertyRiskType: string;
	// SY only
	isPrimaryLocation: boolean;
	lapseOrCanceledPolicy: boolean;

	@Exclude()
	preQualificationQuestion: boolean;

	// Putting this here for now...
	// Credit
	overTwoYears: boolean;

}