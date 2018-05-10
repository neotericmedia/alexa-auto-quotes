import { Type, Exclude, plainToClass } from "class-transformer";

import { Coverage }   from "../../common/coverage/coverage.model";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */
export class VehicleCoverage {
	id: string;
	vehicleNum: number;
	vehicleType: string;
	vehicleName: string;    

	@Type(() => Coverage)
	listOfCoverages: Coverage[];
	
	vehiclePremium: number;
	make: string;
	model: string;
	year: string;

	getSelectedCoverages(): Coverage[] {
		if (this.listOfCoverages !== undefined) {
			return this.listOfCoverages.filter(cov => cov.selected == true); 
		}
		return [];
	}

}