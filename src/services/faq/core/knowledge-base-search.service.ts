import { NextFunction, Request, Response } from "express";
import HttpStatus = require('http-status-codes');

import { JarvisLogger } from "../../../util/JarvisLogger";
import { ResponseBuilderService } from '../../../services/core/response-builder.service';
import * as Type from "../../../models/core/alexa.model";
import { AlexaError } from '../../../util/AlexaError';

import { default as knowledgeBaseRes , KnowledgeBaseModel, SearchDocumentModel } from "../../../models/faq/knowledge-base.model";
var solr = require( 'solr-client' );


  let client = solr.createClient(process.env.DB_SOLR_HOST, process.env.DB_SOLR_PORT, process.env.DB_SOLR_CORE, '/solr');

  console.log(client);

  let query = client.createQuery()
    .q('intent:Qa')
    
export class KnowledgeBaseService {

    private builderService: ResponseBuilderService;

   constructor(){              
        this.builderService = new ResponseBuilderService(); 
   }
    
    public findAnswer(input: string, sessionAttributes: Type.Attributes): Promise<SearchDocumentModel> {   

        return new Promise<SearchDocumentModel>((resolve, reject) => {
            let query = client.createQuery().q(input);


            client.add({ id : 12, title_t : 'Hello' },function(err,obj){
                if(err){
                   console.log(err);
                }else{
                   console.log('Solr response:', obj);
                }
             });


            client.search( query, function ( err, obj ) {

                if (err) {
                    JarvisLogger.solr.error('KnowledgeBaseService : findAnswer - ERROR \n' + err)
                    reject(err);
                } else {
                    const searchDocumentModel  = new SearchDocumentModel();

                    console.log('OBJECT IS ' + ' ' + obj);
                    
                    if(obj && obj.response && obj.response.numFound > 0){
                        let value: string = obj.response.docs[0].value;            
                        let shortAnswer: string = obj.response.docs[0].shortAnswer;
                        JarvisLogger.solr.debug('KnowledgeBaseService : findAnswer obj (' + input + ' ) \n' + JSON.stringify(obj) ); 
                        JarvisLogger.solr.debug('KnowledgeBaseService : findAnswer  value '+ '(' + value + ' ) \n' ); 
                        JarvisLogger.solr.debug('KnowledgeBaseService : findAnswer  shortAnswer '+ '(' + shortAnswer + ' ) \n' ); 

                        searchDocumentModel._version_ = obj.response.docs[0]._version_;
                        searchDocumentModel.id = obj.response.docs[0].id;
                        searchDocumentModel.intent = obj.response.docs[0].intent;
                        searchDocumentModel.value = obj.response.docs[0].value;

                        //string comparison between input and value
                        function similar(a, b) {
                            var lengthA = a.length;
                            var lengthB = b.length;
                            var equivalency = 0;
                            var minLength = (a.length > b.length) ? b.length : a.length;    
                            var maxLength = (a.length < b.length) ? b.length : a.length;    
                            for(var i = 0; i < minLength; i++) {
                                if(a[i] == b[i]) {
                                    equivalency++;
                                }
                            }
                            var weight = equivalency / maxLength;
                            return (weight * 100) + "%";
                        }
                        //

                        let result: any = similar(input.toString(),searchDocumentModel.value.toString());
                        JarvisLogger.solr.debug('KnowledgeBaseService : findAnswer result \n' + result);

                        let resultNo = parseInt(result);
                        
                        if(resultNo <= 50) {
                            JarvisLogger.solr.debug('KnowledgeBaseService : findAnswer (resultNo <= 50) \n'+ resultNo + " is lower than 50% <br/>");
                            searchDocumentModel.shortAnswer = 'I could not find a response to your question. However, I see you are looking for ' + ' ' + obj.response.docs[0].value + '.' + 'I can help you with this. Would you like me to answer this question ?';                            
                            //not exact match question (50% >)
                            searchDocumentModel.matched = false;
                            //set alternate answer to the unmatched question.
                            searchDocumentModel.alternateAnswer = obj.response.docs[0].shortAnswer ; 
                            resolve(searchDocumentModel);                                                                        
                        }else{
                            JarvisLogger.solr.debug('KnowledgeBaseService : findAnswer (resultNo > 50) \n' + resultNo + " is higher than 50% <br/>");
                            searchDocumentModel.shortAnswer = obj.response.docs[0].shortAnswer ;     
                            //exact match of the question (50% <)  
                            searchDocumentModel.matched = true;                    
                            resolve(searchDocumentModel);                                                                        
                        }
                        JarvisLogger.solr.debug('KnowledgeBaseService : findAnswer \n' + JSON.stringify(obj) + '\n');
                    }else {
                        //not matching
                        JarvisLogger.default.debug('KnowledgeBaseIntentService getKnowledgeBaseService : findAnswer - No matching keywords');
                        searchDocumentModel.value = input;
                        searchDocumentModel.shortAnswer = `Sorry I didn't get your question. Would you like to ask another insurance question or get a quick auto quote ?`;
                        Promise.resolve(searchDocumentModel);

                    }
                    

                }
               
            });
            
        });
    
    }

    /**
     * Knowledge base question confirmation.
     * @param questionConfirm 
     */
    public async confirmKnowledgeBaseQuestionIntent(questionConfirm: string, sessionAttributes:Type.Attributes): Promise<Type.ResponseBody> {              
       JarvisLogger.solr.debug('KnowledgeBaseService confirmKnowledgeBaseQuestionIntent');
       let options = new Type.Options();
       let responseBody = new Type.ResponseBody();

       if (questionConfirm === 'yes') {
            JarvisLogger.solr.debug('KnowledgeBaseService confirmKnowledgeBaseQuestionIntent - YES ');
            let knowledgebaseAnswer = sessionAttributes.knowledgebaseAnswer;
            JarvisLogger.solr.debug('KnowledgeBaseService confirmKnowledgeBaseQuestionIntent - Yes - knowledgebaseAnswer ' + knowledgebaseAnswer);

            JarvisLogger.solr.debug('KnowledgeBaseIntentService getKnowledgeBaseService - (solrModel.matched == true)');
            let answer  = knowledgebaseAnswer + '. Would you like to ask another insurance question or get a quick auto quote ?';
            responseBody = this.builderService.clearSessionBuildResponse(sessionAttributes.deviceId, answer, answer);
            
        }else{

            JarvisLogger.solr.debug('KnowledgeBaseService confirmKnowledgeBaseQuestionIntent - NO ');
            //clear session and jump to main menu
            responseBody = this.builderService.mainMenuBuildResponse(sessionAttributes.deviceId);
        }

        return responseBody;
     }


}