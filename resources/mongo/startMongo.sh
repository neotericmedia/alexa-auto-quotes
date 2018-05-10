#!/bin/sh

mongod --port 27017 & 

sleep 10

#/usr/bin/mongod & 
#./importSeedData.sh

./setupMongo.sh
./importSeedData.sh

echo "****************   Shutting down mongo"

#Shutdown mongo
mongod --shutdown

sleep 10 
mongod --auth --port 27017
