exports.handler = async (event) => {
  // Handle preflight OPTIONS request (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',  // Allow all origins
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',  // Allow necessary methods
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // Allow necessary headers
        'Access-Control-Max-Age': '3600',  // Cache preflight response for 1 hour
      },
    };
  }

  // Continue handling your regular POST request
  console.log("Received event:", JSON.stringify(event, null, 2));
  const tableName = process.env.DYNAMODB_TABLE;
  const bucketName = process.env.S3_BUCKET_NAME;
  let body;
  
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (e) {
    console.error("Invalid JSON body:", e);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON body" }),
      headers: {
        'Access-Control-Allow-Origin': '*',  // Allow all origins
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',  // Allow necessary methods
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // Allow necessary headers
      },
    };
  }
  
  const { song_name, version, timestamp } = body;

  let validTimestamp;
  try {
    if (isValidDate(timestamp)) {
      validTimestamp = new Date(timestamp).toISOString();
    } else {
      validTimestamp = new Date().toISOString();
      console.log(`Invalid timestamp provided: ${timestamp}, using current time instead`);
    }
  } catch (e) {
    validTimestamp = new Date().toISOString();
    console.log(`Error processing timestamp: ${e.message}, using current time instead`);
  }

  // Generate a unique song ID, e.g., using UUID or any unique identifier
  const song_id = `song-${Date.now()}`;  // Here, we use the timestamp to generate a unique ID for the song

  const songMetadata = {
    song_id,
    song_name,
    uploaded_at: validTimestamp,
    s3_object_key: `${song_id}.mp3`,
    version: version || "v1",
    timestamp: validTimestamp
  };

  const { PutCommand } = require("@aws-sdk/lib-dynamodb");
  const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

  const ddbClient = new DynamoDBClient();
  const docClient = DynamoDBDocumentClient.from(ddbClient);
  const s3Client = new S3Client({ region: process.env.AWS_REGION });

  try {
    // Save the metadata to DynamoDB
    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: songMetadata
    }));
    console.log('Song metadata saved to DynamoDB');
    
    // Generate the presigned URL for uploading the song to S3
    const s3Key = `${song_id}.mp3`;
    const presignedUrl = await generatePresignedUrl(bucketName, s3Key, s3Client, PutObjectCommand, getSignedUrl);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Song metadata saved!",
        presigned_url: presignedUrl
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',  // Allow all origins
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',  // Allow necessary methods
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // Allow necessary headers
      },
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing the request", error: err.message }),
      headers: {
        'Access-Control-Allow-Origin': '*',  // Allow all origins
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',  // Allow necessary methods
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // Allow necessary headers
      },
    };
  }
};

// Validate if the timestamp is a valid date
const isValidDate = (dateInput) => {
  if (!dateInput) return false;
  
  try {
    if (typeof dateInput === 'number' || !isNaN(Number(dateInput))) {
      const timestamp = Number(dateInput);
      if (timestamp > 1000000000 && timestamp < 10000000000) {
        return true;
      }
      if (timestamp > 1000000000000 && timestamp < 10000000000000) {
        return true;
      }
      return false;
    }
    
    const parsedDate = new Date(dateInput);
    return !isNaN(parsedDate.getTime());
  } catch (e) {
    return false;
  }
};

// Generate a presigned URL for S3
const generatePresignedUrl = async (bucketName, s3Key, s3Client, PutObjectCommand, getSignedUrl) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (err) {
    console.error("Error generating presigned URL", err);
    throw err;
  }
};
