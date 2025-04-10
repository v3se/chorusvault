# Achitecture

[User]
   ↓
[Frontend: React/Next.js]
   ↓
[API Gateway] ← Auth via [Cognito]
   ↓
[Lambda Functions] ← Reads/Writes to → [DynamoDB or RDS]
   ↓
[S3 for Audio Files] ← Direct Upload via Presigned URLs


ToDo:
- Update modules to be more modular.
- E.g. lamdba module should just deploy lambdas not upload_song lambda
- The metadata upload to dynamodb and generating the presigned url needs to be separate backends. e.g. if the upload fails; no entry in the db
- S3 partial uploads need to be automatically removed
- Add owners and collaborators to the dynamodb schema
- Use Cognito sub - JWT token as the UserID
