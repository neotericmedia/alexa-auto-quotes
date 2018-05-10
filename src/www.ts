import * as debugModule from "debug";
import * as http from "http";
import app from "./server";
import { JarvisLogger } from './util/JarvisLogger';
import cluster = require("cluster");

const debug = debugModule("node-express-typescript:server");

// Get port from environment and store in Express.
const port = normalizePort(process.env.NODE_PORT || "9000");
app.set("port", 9000);
const server = http.createServer(app);

if (process.env.NODE_ENABLE_CLUSTER === 'Y') {
  // Enable cluster before binding port.
  startNodeCluster();
} else {
  bindServer(app);
}
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any): number | string | boolean {
  const portVal = parseInt(val, 10);

  if (isNaN(portVal)) {
    // named pipe
    return val;
  }

  if (portVal >= 0) {
    // port number
    return portVal;
  }

  return false;
}

function bindServer(app) {
  // create server and listen on provided port (on all network interfaces).
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}

// From https://www.sitepoint.com/how-to-create-a-node-js-cluster-for-speeding-up-your-apps/
/**
 * Function to start Node Cluster using the Cluster module.
 */
function startNodeCluster() {
  if (cluster.isMaster) {

    JarvisLogger.default.info('**** NODE CLUSTER ENABLED ****=');
    const numWorkers = require('os').cpus().length;

    JarvisLogger.default.info('Master cluster setting up ' + numWorkers + ' workers...');

    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    cluster.on('online', (worker) => {
      JarvisLogger.default.info('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', (worker, code, signal) => {
      JarvisLogger.default.info('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
      JarvisLogger.default.info('Starting a new worker');
      cluster.fork();
    });
  } else {
    bindServer(app);
  }
}

/** Global Exception Handler, so that we log the stacktrace */
process.on('uncaughtException', (err) => {
  JarvisLogger.default.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
  JarvisLogger.default.error('Uncaught exception log', err.stack);
  process.exit(1);
});

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      JarvisLogger.default.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      JarvisLogger.default.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;

  JarvisLogger.default.info('Process(' + process.pid + ') ' + 'Listening on ' + bind);
}