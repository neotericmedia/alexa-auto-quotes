import * as fs from 'fs';
import * as path from 'path';
import { Logger, LoggerInstance, LoggerOptions, transports } from 'winston';
import * as cls from 'continuation-local-storage';
import { JARVIS_NAMESPACE, SESSION_ID, CORRELATION_ID } from './Constant';

export class JarvisLogger {

    public static default: LoggerInstance;
    public static guidewire: LoggerInstance;
    public static solr: LoggerInstance;
    public static db: LoggerInstance;
    // Default directory
    public static logDir: any = 'log';

    public static init() {
        if (process.env.LOG_DIR) {
            JarvisLogger.logDir = process.env.LOG_DIR;
        }
        if (!fs.existsSync(JarvisLogger.logDir)) {
            fs.mkdirSync(JarvisLogger.logDir);
        }
        JarvisLogger.default = JarvisLogger.createLoggerParams(process.env.DEFAULT_LOG_FILE, process.env.DEFAULT_LOG_TAG);
        JarvisLogger.guidewire = JarvisLogger.createLoggerParams(process.env.GUIDEWIRE_LOG_FILE, process.env.GUIDEWIRE_LOG_TAG);
        JarvisLogger.solr = JarvisLogger.createLoggerParams(process.env.SOLR_LOG_FILE, process.env.SOLR_LOG_TAG);
        JarvisLogger.db = JarvisLogger.createLoggerParams(process.env.DB_LOG_FILE, process.env.DB_LOG_TAG);
    }

    private static createLoggerParams(filename: any, tag: any) {
        if (!filename) {
            filename = process.env.DEFAULT_LOG_FILE;
        }

        if (!tag) {
            tag = process.env.DEFAULT_LOG_TAG;
        }
        return new Logger({
            exitOnError: false,
            level: process.env.DEFAULT_LOG_LEVEL,
            transports: [
                new transports.Console({ timestamp: true }),
                new transports.File({ filename: path.join(JarvisLogger.logDir, filename), timestamp: true, maxsize: process.env.LOG_FILE_SIZE })
            ],
            rewriters: [
                (level, msg, meta) => {
                    meta.Tag = tag;
                    const namespace = cls.getNamespace(JARVIS_NAMESPACE);
                    if (namespace) {
                        meta.SessionId = namespace.get(SESSION_ID);
                        meta.CorrelationId = namespace.get(CORRELATION_ID);
                    }
                    return meta;
                }
            ]
        } as LoggerOptions);
    }
}
