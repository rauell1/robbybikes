require('dotenv').config({ path: '.env.local' });
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

(async () => {
  const s3 = new S3Client({
    forcePathStyle: true,
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const bucket = process.env.NEON_OBJECT_STORAGE_BUCKET || 'assets';
  console.log('Testing upload to bucket:', bucket);
  const key = 'test/test-' + Date.now() + '.txt';

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from('Neon storage test OK'),
      ContentType: 'text/plain',
    })
  );
  console.log('Upload OK! Key:', key);

  const getRes = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  console.log('Get OK! Status:', getRes.$metadata.httpStatusCode);

  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  console.log('Delete OK! Cleaned up test object.');
})().catch((err) => {
  console.error('Neon storage test error:', err);
  process.exit(1);
});
