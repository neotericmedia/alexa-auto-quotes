#!/bin/bash
echo "Alexa Intent Request - LaunchRequest"
sh ./1-launch-request.sh
sleep 2
echo "Alexa Intent Request - AutoQuote"
sh ./2-auto-quote-intent.sh
sleep 2
echo "Alexa Intent Request - PostalCode"
sh ./3-postal-code-valid-intent.sh
sleep 2
echo "Alexa Intent Request - ReviewPostalCode"
sh ./3-postal-code-review-intent.sh
sleep 2
echo "Alexa Intent Request - VechicleYear"
sh ./4-vehicle-year-intent.sh
sleep 2
echo "Alexa Intent Request - VechicleMake"
sh ./4-vehicle-make-intent.sh
sleep 2
echo "Alexa Intent Request - VehicleModel"
sh ./4-vehicle-model-intent.sh
sleep 2
echo "Alexa Intent Request - ReviewYearMakeModel"
sh ./4-vehicle-year-make-model-review-intent.sh
sleep 6
echo "Alexa Intent Request - Age"
sh ./5-age-yes-intent.sh
sleep 6
echo "Alexa Intent Request - SessionEndedRequest"
sh ./testScript.6.sh
