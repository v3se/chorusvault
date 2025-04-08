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
- Start frontend development
- Setup dev environment. Check out localstack