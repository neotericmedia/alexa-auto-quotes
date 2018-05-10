import {Type, Exclude, plainToClass} from "class-transformer";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */
export class Coverage {
	id: string;
	coverageAmount: number;
	coverageCategoryCode: string;
	description: string;
	name: string;
	required: boolean;
	selected: boolean;
	code: string;
	priority: number;    
	excludedRiskTypes: string[];

	@Type(() => CoverageTerm)
	listOfCoverageTerms: CoverageTerm[];
}


export class CoverageTerm {
	
	chosenCoverageTerm: string;
	chosenCoverageTermValue: string;
	directValue: number;
	name: string;
	coveragePatternCode: string;
	updated: boolean;
	valueType: string;
	ascendingBetter: boolean;

	@Type(() => CoverageTermOption)
	listOfCoverageTermOptions: CoverageTermOption[];

}

export class CoverageTermOption {
	
	code: string;
	maxValue: number;
	name: string;
	value: number;
}