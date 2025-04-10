// GET Presigned URL Lambda
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

exports.handler = async (event) => {
  // Handle preflight OPTIONS request (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  }

  const bucketName = process.env.S3_BUCKET_NAME; // Your S3 bucket name
  const { song_id } = JSON.parse(event.body);  // Assuming song_id is passed in the request body
  const s3Key = `${song_id}.mp3`;  // File name in S3

  const s3Client = new S3Client({ region: process.env.AWS_REGION });

  try {
    // Generate a presigned URL for GET operation (for downloading or streaming)
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Valid for 1 hour

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Presigned URL generated successfully.',
        presigned_url: url, // Send the presigned URL in response
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',  // Allow all origins
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  } catch (err) {
    console.error("Error generating presigned URL for GET", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error generating presigned URL for GET',
        error: err.message,
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',  // Allow all origins
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  }
};
