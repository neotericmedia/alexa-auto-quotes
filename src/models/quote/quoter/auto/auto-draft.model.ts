import {Type, Exclude, plainToClass} from "class-transformer";

import { Vehicle }        from "../../lob/auto/vehicles/vehicle.model";
import { Driver }         from "../../lob/auto/drivers/driver.model";
import { VehicleDriver }  from "../../lob/auto/vehicle-driver.model";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */

export class AutoDraft {

	@Type(() => Driver)
	listOfDrivers: Driver[];
	
	@Type(() => Vehicle)
	listOfVehicles: Vehicle[];

	@Type(() => VehicleDriver)
	listOfVehicleDriverAssignments: VehicleDriver[];

}