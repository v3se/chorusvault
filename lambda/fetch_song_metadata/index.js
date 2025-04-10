const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

exports.handler = async (event) => {
  // Handle preflight OPTIONS request (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',  // Allow all origins
        'Access-Control-Allow-Methods': 'OPTIONS, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  }

  // Handle the GET request to fetch all song metadata
  if (event.httpMethod === 'GET') {
    const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

    try {
      // Scan the table for all items (songs)
      const params = {
        TableName: process.env.DYNAMODB_TABLE, // Your DynamoDB table name
        // Optionally add a FilterExpression to limit the result if necessary
      };

      const command = new ScanCommand(params);
      const data = await dynamoDbClient.send(command);

      // Return all song metadata
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Metadata fetched successfully.',
          items: data.Items,  // Return all song metadata
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',  // Allow all origins
          'Access-Control-Allow-Methods': 'OPTIONS, GET',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      };
    } catch (err) {
      console.error("Error fetching song metadata", err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error fetching song metadata',
          error: err.message,
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',  // Allow all origins
          'Access-Control-Allow-Methods': 'OPTIONS, GET',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      };
    }
  }

  // Handle unsupported HTTP methods
  return {
    statusCode: 405,
    body: JSON.stringify({
      message: 'Method Not Allowed',
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  };
};
