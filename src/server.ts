/**
 * Module dependencies.
 */
import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as helmet from 'helmet';
import { IHelmetContentSecurityPolicyConfiguration, IHelmetContentSecurityPolicyDirectives } from 'helmet';
import * as logger from "morgan";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo"; // (session)
import * as flash from "express-flash";
import * as path from "path";
import * as mongoose from "mongoose";
import "reflect-metadata";
import { Container } from "inversify";
import { interfaces, InversifyExpressServer, TYPE } from "inversify-express-utils";
import { JarvisLogger } from './util/JarvisLogger';
import { requestHeaderMiddleware, requestVerifier } from './util/SecurityMiddleware';
import * as i18n from "i18n";


i18n.configure({
	locales: ['en', 'fr'],
	cookie: '',
	directory: __dirname + '/locales'
});
// attach the Alexa verifier middleware for security fix
//var alexaVerifierMiddleware = require('alexa-verifier-middleware');
//import {alexaVerifierMiddleware} from './util/SecurityMiddleware';

// Load dotenv
require("dotenv").config();

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });
JarvisLogger.init();

/**
 * Controllers (route handlers).
 */

import { AlexaRouter } from "./controllers/api";

/**
 * Create server
 */

// set up container
const container = new Container();

const STATUS: string = 'status';

const router: any = undefined;

/**
 * API routes.
 */
container.bind<interfaces.Controller>(TYPE.Controller).to(AlexaRouter).whenTargetNamed("AlexaRouter");


const server = new InversifyExpressServer(container, router , { rootPath: "/aviva" });
server.setConfig((app) => {
	//Print all the request HEADERS
	//app.use(requestHeaderMiddleware);


	// attach the verifier middleware first because it needs the entire
	// request body, and express doesn't expose this on the request object
	//app.use(alexaVerifierMiddleware);

	app.use(bodyParser.urlencoded({
		extended: true
	}));

	let mongoDbUrl: string = "mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_SCHEMA;
	if (process.env.DB_AUTHENTICATION_REQUIRED === "Y") {
		mongoDbUrl = "mongodb://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@" +
		process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_SCHEMA;
	}
	const MongoStore = require("connect-mongo")(session);
	const sessionStore = new MongoStore({
		url: mongoDbUrl
	});
	const sessionOptions: any = {
		secret: process.env.EXPRESS_SECRET,
		saveUninitialized: true,
		// Session expiry time is set based on SESSION_EXPIRY_TIME. One hour is set by default 
		// if SESSION_EXPIRY_TIME is undefined or has value that cannot parsed into number
		cookie: { path: '/', httpOnly: false, secure: false, maxAge: parseInt((process.env.SESSION_EXPIRY_TIME || "3600000"), 10) || 3600000 },
		resave: false,
		store: sessionStore
	};

	//Helmet
	const helmetCSPConfiguration: IHelmetContentSecurityPolicyConfiguration = {};
	helmetCSPConfiguration.browserSniff = true;
	helmetCSPConfiguration.setAllHeaders = true;
	helmetCSPConfiguration.disableAndroid = true;

	const helmetCSPDirectives: IHelmetContentSecurityPolicyDirectives = {};
	// tslint:disable-next-line:quotemark
	helmetCSPDirectives.defaultSrc = ["'self'"];
	helmetCSPConfiguration.directives = helmetCSPDirectives;
	app.use(helmet());
	app.use(helmet.contentSecurityPolicy(helmetCSPConfiguration));

	app.use(session(sessionOptions));

	app.use(bodyParser.raw({limit: process.env.EXPRESS_BODY_PARSER_LIMIT}));
	app.use(bodyParser.urlencoded({limit: process.env.EXPRESS_BODY_PARSER_LIMIT, extended: true}));
	app.use(bodyParser.json({limit: process.env.EXPRESS_BODY_PARSER_LIMIT}));

	JarvisLogger.default.debug("===Before-Alex-Verifier===");
	//Print all the request HEADERS
	app.use(requestHeaderMiddleware);
	app.use(requestVerifier);
	JarvisLogger.default.debug("===After-Alex-Verifier====");
});


/**
 * Create Inversify Express server.
 */
const app = server.build();


/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(logger("dev"));
app.use(i18n.init);
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
	//TODO: Srinivas - middleware
	res.locals.user = req.user;
	res.locals.session = req.session;
	res.locals.greet = function(){
			//req and res are available here!
			return "hey there " + req.user.name;
	};
	next();
});


/**
 * Separate route is used by load balancer health check.
 */
app.get('/', function (req, res) {
  	const healthCheck = {"pong": "1.0"};
	res.json(healthCheck);
})

export default app;