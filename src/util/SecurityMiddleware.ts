// the alexa API calls specify an HTTPS certificate that must be validated.
// the validation uses the request's raw POST body which isn't available from
// the body parser module. so we look for any requests that include a
// signaturecertchainurl HTTP request header, parse out the entire body as a
// text string, and set a flag on the request object so other body parser
// middlewares don't try to parse the body again
import { Request, Response, NextFunction } from 'express';

import { JarvisLogger } from './JarvisLogger';

const verifier = require('alexa-verifier')

/**
 * certificate validator express middleware for amazon echo.
 * @param req 
 * @param res 
 * @param next 
 */
export function requestVerifier(req: Request, res: Response, next: NextFunction): any {
  
    var signaturecertchainurl = req.headers.signaturecertchainurl;
    var signature = req.headers.signature;
    JarvisLogger.default.debug("!!Reqeust verifier start"); 
    JarvisLogger.default.debug("Reqeust req"); 
    JarvisLogger.default.debug("Reqeust signaturecertchainurl " + signaturecertchainurl);   
    JarvisLogger.default.debug("Reqeust signature " + signature); 
    verifier(signaturecertchainurl, signature, JSON.stringify(req.body), next);
    JarvisLogger.default.debug("!!Reqeust verifier done"); 
    next(); 
}


/**
 * Intercept to request HEADERS.
 */
export function requestHeaderMiddleware(req: Request, res: Response, next: NextFunction): any {
    JarvisLogger.default.debug("Reqeust HEADERS\n" + JSON.stringify(req.headers));  
    JarvisLogger.default.debug("Reqeust BODY\n" + JSON.stringify(req.body));  
    next();  
}

/*export function verifier(cert_url: string, signature: string, requestBody: any, callback: NextFunction) {
    if(!cert_url) {
        return process.nextTick(callback, 'missing certificate url')
    }

    if (!signature) {
        return process.nextTick(callback, 'missing signature')
    }
    if (!requestBody) {
        return process.nextTick(callback, 'missing request (certificate) body')
    }

    if (!validator.isBase64(signature)) {
        return process.nextTick(callback, 'invalid signature (not base64 encoded)')
    }
    next();  
}

// parse a certificate and check it's contents for validity
export function validateCertUri(cert_uri) {

    // constants
    const VALID_CERT_HOSTNAME   = 's3.amazonaws.com';
    const VALID_CERT_PATH_START = '/echo.api/';
    const VALID_CERT_PORT       = '443';

    if (cert_uri.protocol !== 'https:') {
        return 'Certificate URI MUST be https: ' + cert_uri;
    }
    if (cert_uri.port && (cert_uri.port !== VALID_CERT_PORT)) {
        return 'Certificate URI port MUST be ' + VALID_CERT_PORT + ', was: ' + cert_uri.port;
    }
    if (cert_uri.hostname !== VALID_CERT_HOSTNAME) {
        return 'Certificate URI hostname must be ' + VALID_CERT_HOSTNAME + ': ' + cert_uri.hostname;
    }
    if (cert_uri.path.indexOf(VALID_CERT_PATH_START) !== 0) {
        return 'Certificate URI path must start with ' + VALID_CERT_PATH_START + ': ' + cert_uri;
    }
    return true;
}*/

