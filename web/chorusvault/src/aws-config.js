export const awsConfig = {
    region: process.env.REACT_APP_AWS_REGION,
    cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      clientId: process.env.REACT_APP_COGNITO_CLIENT_ID
    }
  };