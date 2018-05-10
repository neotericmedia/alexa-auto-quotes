import * as mongoose from "mongoose";

export class SearchDocumentModel {
	intent: string;	
	value: string;
	shortAnswer: string;
	id: string;
	_version_: string;
	matched: boolean;
	alternateAnswer: string;
}

export class KnowledgeBaseModel {
	intent: string;	
	response: string;
}

const knowledgeSchema = new mongoose.Schema({
	intent: String,
	response: String
});

const knowledgeBaseRes = mongoose.model("knowledgeBaseRes", knowledgeSchema);
export default knowledgeBaseRes;