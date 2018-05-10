import {Type, Exclude, plainToClass} from "class-transformer";

import { Vehicle }              from "../lob/auto/vehicles/vehicle.model";
import { Driver }               from "../lob/auto/drivers/driver.model";
import { Address }              from "../lob/common/address.model";
import { Account }              from "../lob/common/account.model";
import { Discount }             from "../lob/common/discount.model";
import { UWIssue }              from "../lob/common/uwissue.model";
import { AutoDraft }            from "./auto/auto-draft.model";
import { PropertyDraft }        from "./property/property-draft.model";
import { AutoOfferedQuote }     from "./auto/auto-offered-quote.model";
import { PropertyOfferedQuote } from "./property/property-offered-quote.model";
import { CoverageTerm }         from "../lob/common/coverage/coverage.model";

/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */

export class QuoteDraft {

	@Type(() => Account)
	accountHolder: Account;

	periodStartDate: Date;
	periodEndDate: Date;

	@Type(() => Address)
	policyAddress: Address;

	productCode: string;
	productName: string;
	offeringCode: string;
	campaignCode: string;
	affinityGroupCode: string;

	@Type(() => PropertyDraft)
	propertyDraft: PropertyDraft;

	@Type(() => AutoDraft)
	autoDraft: AutoDraft;

	@Type(() => Discount)
	listDiscounts: Discount[];

	uwCompany: string = "NUM_49_AC";

}



export class Offering {
	priority: number;
	codeIdentifier: string;
}


export class QuotingException {
	uwIssueCode: string;
	uwIssueDescription: string;
}


export class QuotePackage {
	quotes: QuoteInfo[] = [];

	addQuote(quote: Quote) {
	if (this.quotes.findIndex(qi => qi.quoteNumber === quote.quoteNumber ) < 0) {
		const qinfo = new QuoteInfo();
		qinfo.quoteNumber = quote.quoteNumber;
		qinfo.postalCode =  quote.quoteDraft.policyAddress.postalCode;
		qinfo.productCode = quote.quoteDraft.productCode;
		this.quotes.push(qinfo);
	}
	}

}


export class QuoteInfo {
	quoteNumber: string;
	postalCode: string;
	productCode: string;
}

export class Quoted {

	@Exclude()
	active: boolean = false;
	@Exclude()
	index: number;

	id: string;
	sorFlag: boolean;
	branchCode: string;
	branchName: string;
	isBaseOffering: boolean;
	isCustom: boolean;
	monthlyPremium: number;
	taxes: number;
	monthlyTaxes: number;
	termMonths: number;
	total: number;
	totalBeforeTaxes: number;
	policyPeriodStatus: string;
	priority: number;

	@Type(() => QuotingException)
	quotingBlocker: QuotingException;

	@Type(() => UWIssue)
	listOfUWIssues: UWIssue[];

	@Type(() => AutoOfferedQuote)
	autoOfferedQuote: AutoOfferedQuote;
	
	@Type(() => PropertyOfferedQuote)
	propertyOfferedQuote: PropertyOfferedQuote;

	@Type(() => CoverageTerm)
	coverageTerm: CoverageTerm;
}

export class Quote {

	isSubmitAgent: boolean;
	selectedQuotePublicID: string;
	quoteNumber: string;
	sessionUUID: string;
	createOfferings: boolean;
	createNewPeriodOfferingCode: string;
	
	@Type(() => Offering)
	avalailableOfferings: Offering[];

	@Type(() => QuoteDraft)
	quoteDraft: QuoteDraft;

	@Type(() => Quoted)
	listOfOfferedQuotes: Quoted[];


	/*getSelectedQuoted() : Quoted {
		if (!this.listOfOfferedQuotes)
			return null;

		return this.listOfOfferedQuotes.find(quoted => quoted.id === this.selectedQuotePublicID);
	}*/
}
