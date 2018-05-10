import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import { injectable } from 'inversify';
import { All, Controller, Get, interfaces, Post, Put } from 'inversify-express-utils';
import { AlexaError } from '../../util/AlexaError';

/**
 * This is the base class for all the Routers
 * Any common logic for all the Routers
 * should be specified here.
 */
type HttpMethodType = 'GET' | 'POST' | 'DELETE' | 'PUT';

@injectable()
export class BaseRouter implements interfaces.Controller {

    private status: string = 'status';

    /**
     * Sends the error message to the device
     * 
     * @param res - express response
     * @param err - AlexaError
     * @param status - optional param. Default is HttpStatus.INTERNAL_SERVER_ERROR
     */
    public sendError(res: express.Response, err: AlexaError, status?: number) {
        const errorMessage = `{"version":"1.0","response":{"outputSpeech":{"type":"SSML","ssml":"<speak>Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as=\"telephone\">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?</speak>"},"shouldEndSession":false,"reprompt":{"outputSpeech":{"type":"SSML","ssml":"<speak>Sorry I can't help you at the moment. Please call Aviva at <say-as interpret-as=\"telephone\">1-855-788-9090</say-as> or visit aviva insurance dot C A for more information. Would you like to get a quick auto insurance quote or ask a question ?</speak>"}}}}`;
        status = JSON.parse(err.message)[this.status];
        if (!status) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        res.status(status).json(JSON.parse(err.message));

    }

    
}
