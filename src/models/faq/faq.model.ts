import * as mongoose from "mongoose";

const GET_ADDRESS = "GetAddress";
const AMAZON_HELP = "AMAZON.HelpIntent";

export class FaqIntentName {
public static readonly INTENT_NAME = ["Qa", "Qb", "Qc", "Qd", "Qe", "Qf", "Qg", "Qh", "Qi", "Qj", "Qk", "Ql", "Qn", "Qo", "Qp", "Qq", "Qr", "Qs", "Qt", "Qu"];
}

export class FaqModel {
	intent: string;
	value: string;
	answer: string;
}

const faqSchema = new mongoose.Schema({
	intent: String,
	value: String,
	answer: String
});

const FAQ = mongoose.model("FAQ", faqSchema);
export default FAQ;