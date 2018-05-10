import {Logger, LoggerInstance, LoggerOptions, transports} from "winston";

export const logger: LoggerInstance = new Logger( {
	exitOnError: false,
	level: "debug",
	transports: [
		new transports.Console(),
		new transports.File({ filename: "npm-debug.log" })
	]
} as LoggerOptions);
