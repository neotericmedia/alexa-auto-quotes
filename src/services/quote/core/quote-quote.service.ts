import { NextFunction, Request, Response } from "express";
import * as request from "request";

import { JarvisLogger } from "../../../util/JarvisLogger";
import { Quote }  from "../../../models/quote/quoter/quoter.model";
import { SessionService } from "../../../services/core/session.service";
import * as Type from "../../../models/core/alexa.model";


/**
 * REST web service connector to GI-Service Quote.
 */
export class QuoteService {

	/** Common configuration properties. */
	private config: ConfigProperties;
	private localSessionService: SessionService;

	/** Constructor to initialize configuration. */
	constructor() {
		this.initConfig();
		this.localSessionService = new SessionService();
	}

	/**
	 * Invokes check product avaliablity on service.
	 */
	public async saveQuote(attributes: Type.Attributes): Promise<Quote> {
		const self = this;
		return new Promise<Quote>((resolve, reject) => {

			const host = String(process.env.GI_SERVICE_HOST);
			const path = String(process.env.GI_QUOTE_SAVE_PATH);
			const uri = host + path;
			const opts = self.reqOptions(uri, attributes);            
			request(opts, (err, res, body) => {
				if (err) {
					JarvisLogger.guidewire.error("QuoteService saveQuote response : ERROR " + err);
					reject(err);
				} else {
					JarvisLogger.guidewire.debug("QuoteService saveQuote response :" + body);
					const quote = JSON.parse(body);
					resolve(quote);
				}
			});
		});
	}

	/**
	 * Invokes check product avaliablity on service.
	 */
	public async quoteQuote(attributes: Type.Attributes): Promise<Quote> {
		const self = this;
		return new Promise<Quote>((resolve, reject) => {

			const host = String(process.env.GI_SERVICE_HOST);
			const path = String(process.env.GI_QUOTE_QUOTE_PATH);
			const uri = host + path;
			const opts = self.reqOptions(uri, attributes);            
			request(opts, (err, res, body) => {
				if (err) {
					reject(err);
				} else {
					JarvisLogger.guidewire.debug("QuoteService quote quote response :" + body);
					const quote = JSON.parse(body);
					resolve(quote);
				}
			});
		});
	}
	
	/** Initialize settings read from env properties once. */
	private initConfig() {
		const cfg: ConfigProperties = {} as ConfigProperties;
		this.config = cfg;
		
		// Use env properties
		cfg.method = "POST";

		// Remove needless slashes before uri concatenation
		const host = String(process.env.GI_SERVICE_HOST);
		const path = String(process.env.GI_RATING_INFO_AUTO_PATH);
		cfg.host = host ? host.replace(/(\/)$/, "") : host;
		cfg.path = path ? path.replace(/^\//, "") : path;
		cfg.uri = cfg.host + "/" + cfg.path;
	}

	/** Construct headers for rate request. */
	private reqHeaders(gicookie: string[]) {
		const reqHeaders = {
			"User-Agent": "node",
			"Accept": "application/json",
			"Accept-Encoding": "none",
			"Content-Type": "application/json",
			"cookie": gicookie
		};
		
		JarvisLogger.guidewire.debug('reqHeaders '+ JSON.stringify(reqHeaders));

		return reqHeaders;
	}

	/** Construct options for rate request. */
	private reqOptions(uri: string, attributes: Type.Attributes): any {
		const hdrs = this.reqHeaders(attributes.gicookie);
		const opts = {
			uri: uri,
			method: this.config.method,
			headers: hdrs,
			timeout : 2000000,
			body: JSON.stringify(attributes.quote)
		};
		JarvisLogger.guidewire.debug('reqOptions ', opts);
		return opts;
	}

}


/** Type for configuration properties. */
interface ConfigProperties {
	host: string;
	path: string;
	uri: string;
	method: string;
	gicookie: string;
}

