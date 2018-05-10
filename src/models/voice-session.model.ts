import * as mongoose from "mongoose";
import {Type, Exclude, plainToClass} from "class-transformer";

export class VoiceModel {
	response: string;
	request: string;
	session: string;
    sessionAttributes: string;
    /* Request device ID */
    deviceId : string;
    /* Quote Id */
    quoteId: string
    /* GUID to identify the stateless service interation */
    GUID: string;
} 

const voiceSchema = new mongoose.Schema({
	response: String,
	request: String,
	session: String,
    sessionAttributes: String,
    deviceId: String,
    quoteId: String,
    GUID: String
});
	

const Voice = mongoose.model("Voice", voiceSchema);
export default Voice;