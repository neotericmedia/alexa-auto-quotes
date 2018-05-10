import { NextFunction, Request, Response } from "express";
import * as request from "request";

import { JarvisLogger } from "../../../util/JarvisLogger";
import { VehicleInfoResult, VehicleInfo } from "../../../models/quote/lob/auto/vehicles/vehicle-info.model";
import { Quote }  from "../../../models/quote/quoter/quoter.model";
import { SessionService } from "../../../services/core/session.service";

/**
 * REST web service connector to GI-Service Year/Make/Model.
 */
export class YearMakeModelService {

	/** Common configuration properties. */
	private config: ConfigProperties;
	private localSessionService: SessionService;

	/** Constructor to initialize configuration. */
	constructor() {
		this.initConfig();
		this.localSessionService = new SessionService();
	}

	/**
	 * Invokes check Year/Make/Model invocking GI service.
	 */
	public async yearMakeModelSearch(searchTerm: string): Promise<VehicleInfoResult> {
		const self = this;
		return new Promise<VehicleInfoResult>((resolve, reject) => {
			if (!searchTerm || searchTerm.length < 1) {
				JarvisLogger.guidewire.error('Empty input. Terminated Year/Make/Model request.');
				reject(new Error("Empty input. Terminated Year/Make/Model request."));
			}
			const opts = self.reqOptions(searchTerm);
			
			request(opts, (err, res, body) => {
				if (err) {
					reject(err);
				} else {
					const bodyData = JSON.parse(body);
					
					resolve(bodyData);
				}
			});
		});
	}

	
	/** Initialize settings read from env properties once. */
	private initConfig() {
		const cfg: ConfigProperties = {} as ConfigProperties;
		this.config = cfg;
		
		// Use env properties
		cfg.method = "GET";

		// Remove needless slashes before uri concatenation
		const host = String(process.env.GI_SERVICE_HOST);
		const path = String(process.env.GI_YEAR_MAKE_MODEL_SEARCH_PATH);
		cfg.host = host ? host.replace(/(\/)$/, "") : host;
		cfg.path = path ? path.replace(/^\//, "") : path;
		cfg.uri = cfg.host + "/" + cfg.path;
	}

	/** Construct headers for rate request. */
	private reqHeaders(reqData: any) {
		const reqHeaders = {
			"User-Agent": "node",
			"Accept": "application/json",
			"Accept-Encoding": "none",
			"Content-Type": "application/json"
		};
		return reqHeaders;
	}

	/** Construct options for rate request. */
	private reqOptions(searchTerm: string): any {
		const hdrs = this.reqHeaders(searchTerm);
		const opts = {
			uri: this.config.uri + encodeURIComponent(searchTerm),
			method: this.config.method,
			headers: hdrs
		};

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

