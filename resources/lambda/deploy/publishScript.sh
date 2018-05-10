\rm -rf lambda_upload.zip
zip -r lambda_upload.zip ../function/index.js
aws lambda update-function-code --function-name GreetingsSkill --zip-file fileb://lambda_upload.zip --profile alexaskill