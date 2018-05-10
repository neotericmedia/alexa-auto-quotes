import { NextFunction, Request, Response } from "express";
import * as request from "request";

import { JarvisLogger } from "../../../util/JarvisLogger";
import { ProductAvailability, ProductAvailabilityResponse }  from "../../../models/quote/lob/common/product-availability.model";
import { Quote }  from "../../../models/quote/quoter/quoter.model";
import { SessionService } from "../../../services/core/session.service";

//TODO - to be DELETED -srini
/**
 * REST web service connector to GI-Service Product Avaliablity.
 */
export class ProductService {

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
	public async productAvailablity(productCode: string, postalCode: string): Promise<ProductAvailabilityResponse> {
		const self = this;
		return new Promise<ProductAvailabilityResponse>((resolve, reject) => {
			if (!postalCode || postalCode.length < 1) {
				reject(new Error("Empty input. Terminated Guidewire request for product availabilty."));
			}
			const opts = self.reqOptions(productCode, postalCode);
			
			request(opts, (err, res, body) => {
				if (err) {
					JarvisLogger.guidewire.error("ProductAvailability productAvailablity ERROR \n:" + err);
					reject(err);
				} else {
					// const bodyData = JSON.parse(body);
					JarvisLogger.guidewire.debug("ProductAvailability response :" + body);

					// let productAvailability = new ProductAvailability();
					// productAvailability = JSON.parse(body);

					const productAvailabilityResponse  = new ProductAvailabilityResponse();
					productAvailabilityResponse.productAvailability = JSON.parse(body);

					if (res.headers[String(process.env.GI_COOKIE_NAME)]) {
						// JarvisLogger.guidewire.debug('ProductAvailability res.headers :'+res.headers[String(process.env.GI_COOKIE_NAME)])
						const cookies = res.headers[String(process.env.GI_COOKIE_NAME)][0].split(";");
						productAvailabilityResponse.gicookie = cookies[0];
					}
					resolve(productAvailabilityResponse);
				}
			});
		});
	}

	public async getInitialQuote(productCode: string, postalCode: string): Promise<ProductAvailabilityResponse> {

		const productAvailabilityResponseValue = new ProductAvailabilityResponse();

		
		const productAvailabilityResponse: ProductAvailabilityResponse = await this.productAvailablity(productCode, postalCode);
		JarvisLogger.guidewire.debug('ProductService getInitialQuote productAvailabilityResponse.productAvailability.isAvailable : '+ productAvailabilityResponse.productAvailability.isAvailable);
		JarvisLogger.guidewire.debug('ProductService getInitialQuote productAvailabilityResponse : '+ JSON.stringify(productAvailabilityResponse));
		
		
			// kickout for product not avaliable
			if (productAvailabilityResponse.productAvailability.isAvailable == false) {
				JarvisLogger.guidewire.debug("productAvailability.isAvailable :" + "kickout for product not avaliable :\n" + productAvailabilityResponse.productAvailability.isAvailable);
				throw new Error("Product is not avaliable in this postal code : " + postalCode); 
			}
			// kickout for product is avalible but state is non-ontario
			if ((productAvailabilityResponse.productAvailability.isAvailable == true) && !(productAvailabilityResponse.productAvailability.addressCompletion.state.indexOf("ON")  > -1)) {
				JarvisLogger.guidewire.error("ProductService getInitialQuote productAvailability error : kickout for product is avalible but state is non-ontario \n" + JSON.stringify(productAvailabilityResponse.productAvailability));
				throw new Error("Product is not avaliable in this postal code : " + postalCode +  " provience : " + productAvailabilityResponse.productAvailability.addressCompletion.state); 	
			}

			// kickout for product is avalible in state ontario but no avalible risktype
			if (
				(productAvailabilityResponse.productAvailability.isAvailable == true) && 
				!(productAvailabilityResponse.productAvailability.addressCompletion.state.indexOf("ON")  > -1) &&
				(productAvailabilityResponse.productAvailability.availableRiskTypes.length == 0)
			) {
				JarvisLogger.guidewire.error("ProductService getInitialQuote productAvailability error : kickout for product is avalible in state ontario but no avalible risk type\n" + JSON.stringify(productAvailabilityResponse.productAvailability));
				throw new Error("Product is not avaliable in this postal code : " + postalCode +  " provience : " + productAvailabilityResponse.productAvailability.addressCompletion.state); 	
			}

			// kickout for product is avalible in state ontario but not avalible risktype auto
			if (
				(productAvailabilityResponse.productAvailability.isAvailable == true) && 
				!(productAvailabilityResponse.productAvailability.addressCompletion.state.indexOf("ON")  > -1) &&
				(productAvailabilityResponse.productAvailability.availableRiskTypes.length > 0) &&
				!(productAvailabilityResponse.productAvailability.addressCompletion.state.indexOf("ON")  > -1)
			) {
				JarvisLogger.guidewire.error("ProductService getInitialQuote productAvailability error : kickout for product is avalible in state ontario but no avalible risk type auto \n" + JSON.stringify(productAvailabilityResponse.productAvailability));
				throw new Error("Product is not avaliable in this postal code : " + postalCode +  " provience : " + productAvailabilityResponse.productAvailability.addressCompletion.state); 	
			}

			// check for product code is auto, state is ontario and is avaliable
			if (
				productAvailabilityResponse.productAvailability.isAvailable == true &&
				(productAvailabilityResponse.productAvailability.availableRiskTypes.indexOf("auto")  > -1) &&
				(productAvailabilityResponse.productAvailability.addressCompletion.state.indexOf("ON")  > -1)
			) {
				JarvisLogger.guidewire.debug("product is availability for postal code" + postalCode + " and for provience ontario only!");
				
				// set default quote object with defaulted values
				let quote: Quote = await this.localSessionService.getDefaultQuote();
				JarvisLogger.guidewire.debug("product is availability for postal code" + postalCode + " and for provience ontario only - default quote from Json file "+  JSON.stringify(quote));
				// map product availabilty to quote
				quote = this.mapProductAvailability(quote, productAvailabilityResponse.productAvailability);
				
				// assing the updated default default quote to product avallabilty response
				productAvailabilityResponse.quote = quote;

				// return product availability response
				return productAvailabilityResponse;
			}
		

		return productAvailabilityResponseValue;
	}
	
	/** Initialize settings read from env properties once. */
	private initConfig() {
		const cfg: ConfigProperties = {} as ConfigProperties;
		this.config = cfg;
		
		// Use env properties
		// cfg.rateSoapAction = String(process.env.RATABASE_SOAPACTION);
		cfg.method = "GET";
		// cfg.followAllRedirects = true;

		// Remove needless slashes before uri concatenation
		const host = String(process.env.GI_SERVICE_HOST);
		const path = String(process.env.GI_AVAILABILTY_CHECK_PATH);
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

		JarvisLogger.guidewire.debug('ProductService reqHeaders', reqHeaders);
		return reqHeaders;
	}

	/** Construct options for rate request. */
	private reqOptions(productCode: string, postalCode: string): any {
		const hdrs = this.reqHeaders(postalCode);
		const opts = {
			uri: this.config.uri + encodeURIComponent(productCode + "_" + postalCode),
			method: this.config.method,
			headers: hdrs,
			// body: reqData
		};
		JarvisLogger.guidewire.debug('ProductService reqOptions', opts);
		return opts;
	}

	/**
	 * Map rating information.
	 */
	private mapProductAvailability(quote: Quote, productAvailability: ProductAvailability): Quote {
		quote.quoteDraft.policyAddress.postalCode = productAvailability.addressCompletion.postalCode;
		quote.quoteDraft.policyAddress.state = productAvailability.addressCompletion.state;
		quote.quoteDraft.policyAddress.country = productAvailability.addressCompletion.country;
		quote.quoteDraft.policyAddress.city = productAvailability.addressCompletion.city;
		quote.quoteDraft.policyAddress.streetList = productAvailability.addressCompletion.streetList;
		quote.quoteDraft.productCode = String(process.env.GI_PRODUCT_CODE);
		quote.quoteDraft.periodStartDate = new Date();
		return quote;
		
	
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

