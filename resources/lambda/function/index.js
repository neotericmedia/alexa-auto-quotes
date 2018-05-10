'use strict';

var http = require('http');

exports.handler = function(event, context) {
    
    try {

        if(process.env.NODE_DEBUG_EN) {
            console.log("Request : \n"+JSON.stringify(event,null,2));
        }
        

        var request = event.request;
        if(request.type === "LaunchRequest") {

            let options = {};
            
            options.speechText = "Welcome to Greeting skill. Using our skill you can greet your geusts.",
            options.repromptText = "Whom you want to greet? You can say for example, say hello to John.",
            options.endSession = false;

            context.succeed(buildResponse(options));

        }else if(request.type === "IntentRequest") {
            
            let options = {};

            if(request.intent.name === "HelloIntent") {

                let name = request.intent.slots.FirstName.value;

                options.speechText = "Hello " + name + ". ";
                options.speechText += getWish();

                getQuote(function(quote,err){
                    if(err){
                        context.fail(err);
                    }else{
                        options.speechText += quote;
                        options.endSession = true;            
                        context.succeed(buildResponse(options));
                    }
                });

            }else if (request.intent.name === "AMAZON.StopIntent" || request.intent.name === "AMAZON.CancelIntent") {
                context.succeed(buildResponse({
                speechText: "Good bye. ",
                endSession: true
                }));
            }else {
                throw "Unknown intent";
            }

        }else if(request.type === "SessionEndedRequest") {

        }else {
            throw "Unknown intent type";
        }
    } catch (error) {
        context.fail("Exception: "+ error);
    }


}

function getQuote(callback) {
    var url = "http://api.forismatic.com/api/1.0/json?method=getQuote&lang=en&format=json";
    var req = http.get(url, function(res){
        var body = "";
        
        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            body = body.replace(/\\/g,'');
            var quote = JSON.parse(body);
            callback(quote.quoteText);
        });
    });

    req.on('error', function(err) {
        callback('', err);
    });
}

function getWish() {
	var myDate = new Date();
	var hours = myDate.getUTCHours() - 8;
	if(hours < 0) {
		hours = hours + 24;
	}
	
	if(hours < 12) {
		return "Good morning.";
	}else if(hours < 18) {
		return "Good afternoon.";
	}else {
		return "Good evening. ";
	}
}

function buildResponse(options) {

    if(process.env.NODE_DEBUG_EN) {
        console.log("Response Options: \n"+JSON.stringify(options,null,2));
    }
    
	var response = {
		version: "1.0",
		response: {
			outputSpeech: {
				type: "PlainText",
				text: options.speechText
			},
			shouldEndSession: options.endSession
		}
	};
	
	if(options.repromptText) {
		response.response.reprompt = {
			outputSpeech: {
				type: "PlainText",
				text: options.repromptText

			}
		}
	};
    
    if(process.env.NODE_DEBUG_EN) {
        console.log("Response : \n"+JSON.stringify(response,null,2));
    }

	return response;
}