import {Type, Exclude, plainToClass} from "class-transformer";

import { Coverage }        from "../../lob/common/coverage/coverage.model";
import { UWIssue }        from "../../lob/common/uwissue.model";
import { PropertyCoverage }  from "../../lob/property/property-coverage.model";
/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */
export class PropertyOfferedQuote {

	
	@Type(() => Coverage)
	listOfLineCoverages: Coverage[];
	
	@Type(() => PropertyCoverage)
	listOfDwellingCoverages: PropertyCoverage[];

	@Type(() => UWIssue)
	listOfUWIssues: UWIssue[];

}