// src/aws-service.js
import AWS from 'aws-sdk';
import { awsConfig } from './aws-config';

// Set the AWS region using aws-config.js
AWS.config.update({
  region: awsConfig.region,
});

// Initialize Cognito service
const cognito = new AWS.CognitoIdentityServiceProvider();

// Example function to handle Cognito user login (just an example)
export const loginUser = (username, password) => {
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: awsConfig.cognito.clientId, // You should add the client ID in aws-config.js
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  return cognito.initiateAuth(params).promise();
};

// You can add more AWS service-related functions here