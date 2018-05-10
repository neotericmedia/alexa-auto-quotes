#!/bin/bash
echo "Alexa Intent Request - LaunchRequest"
sh ./testScript.1.sh
sleep 2
echo "Alexa Intent Request FAQ - Qa"
sh ./testFaqScript.1.sh
sleep 2
echo "Alexa Intent Request FAQ - Qb"
sh ./testFaqScript.2.sh
sleep 2
echo "Alexa Intent Request FAQ - Qc"
sh ./testFaqScript.3.sh
sleep 2
echo "Alexa Intent Request - SessionEndedRequest"
sh ./testScript.6.sh