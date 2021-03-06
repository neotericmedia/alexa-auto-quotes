import { NextFunction, Request, Response } from "express";
import * as request from "request";

import { JarvisLogger } from "../../../util/JarvisLogger";
import { VehicleInfoResult, VehicleInfo } from "../../../models/quote/lob/auto/vehicles/vehicle-info.model";
import { Quote }  from "../../../models/quote/quoter/quoter.model";
import { SessionService } from "../../../services/core/session.service";
import { TypeList, Pair } from "../../../models/quote/lob/common/typelist.model";

/**
 * REST web service connector to GI-Service Metadata Year search.
 */
export class MetaDataVehicleYearService {

	/** Common configuration properties. */
	private config: ConfigProperties;
	private localSessionService: SessionService;

	/** Constructor to initialize configuration. */
	constructor() {
		this.initConfig();
		this.localSessionService = new SessionService();
	}

	/**
	 * Invokes check Metadata year list invocking GI service.
	 */	
	public async getVehicleYears(): Promise<TypeList> {
		const self = this;
		return new Promise<TypeList>((resolve, reject) => {
			const opts = self.reqOptions();			
			request(opts, (err, res, body) => {
				if (err) {
					JarvisLogger.guidewire.error('MetaDataVehicleYearService getVehicleYears ERROR ' + err);
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
		const path = String(process.env.GI_VEHICLE_YEAR_SEARCH_PATH);
		cfg.host = host ? host.replace(/(\/)$/, "") : host;
		cfg.path = path ? path.replace(/^\//, "") : path;
		cfg.uri = cfg.host + "/" + cfg.path;
	}

	/** Construct headers for request without paramters. */
	private reqHeaders() {
		const reqHeaders = {
			"User-Agent": "node",
			"Accept": "application/json",
			"Accept-Encoding": "none",
			"Content-Type": "application/json"
		};
		return reqHeaders;
	}

	/** Construct options for request with no input. */
	private reqOptions(): any {
		const hdrs = this.reqHeaders();
		const opts = {
			uri: this.config.uri,
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
	// followAllRedirects: boolean;
	// rateSoapAction: string;
	gicookie: string;
}

