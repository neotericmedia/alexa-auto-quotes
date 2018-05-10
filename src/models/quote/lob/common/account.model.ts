/**
 * Domain model for Personal Line Quoting and Services.
 * Object used to store Policy Address data.
 * @Author: Srinivas Rao (tcs_1979453)
 * Date: 8/1/2017
 * Time: 8:36 AM
 */

export class Account {
	
	id: string;
	accountNumber: string;
	affinityGroup: string;
	cellNumber: string;
	dateOfBirth: Date;
	displayName: string;
	emailAddress1: string;
	firstName: string;
	firstNameKanji: string;
	homeNumber: string;
	lastName: string;
	lastNameKanji: string;
	maritalStatus: string;
	middleName: string;
	particle: string;
	prefix: string;
	primaryPhoneType: string;
	suffix: string;
	workNumber: string;
	primaryLanguage: string;
	creditCheckConsent: boolean;
	marketingConsent: string;
	consentMessage: string;
	consentId: string;
}