import {Type, Exclude, plainToClass} from "class-transformer";

import { Address }        from "./address.model";
import { Quote }  from "../../quoter/quoter.model";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */
export class ProductAvailability {

	@Type(() => Address)
	addressCompletion: Address;

	affinityGroupCode: string;
	availableInFuture: Date;
	isAvailable: boolean;
	availableRiskTypes: string[];
	// reason if unavailable
	reasonCode: string;
}

/**
 * Alexa sepcific models below
 */
export class ProductAvailabilityResponse {
	@Type(() => ProductAvailability)
	productAvailability: ProductAvailability;

	@Type(() => Quote)
	quote: Quote;

	gicookie: string[];
}