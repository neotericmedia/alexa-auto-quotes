import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as cls from 'continuation-local-storage';

import { JarvisLogger } from './JarvisLogger';

/** Intercept to request HEADERS. */
export function requestHeaderMiddleware(req: Request, res: Response, next: NextFunction): any {
    JarvisLogger.default.debug("Reqeust HEADERS\n" + JSON.stringify(req.headers));  
    next();  
}
