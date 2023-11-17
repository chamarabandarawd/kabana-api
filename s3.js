// import 'dotenv/config';
// import * as fs from 'fs';
// import AWS from 'aws-sdk';



// const bucketName = process.env.AWS_BUCKET_NAME
// const region = process.env.AWS_BUCKET_REGION
// const accessKeyId = process.env.AWS_ACCESS_KEY
// const secretAccessKey = process.env.AWS_SECRET_KEY


// const s3= new S3 ({
//     region,
//     accessKeyId,
//     secretAccessKey
// })

// // upload file to s3

// const uploadFile = (file) => {
//     const fileStream = fs.createReadStream(file.path);

//     const uploadParams = {
//         Bucket: bucketName,
//         Body: fileStream,
//         Key: file.filename
//     };

//     return s3.upload(uploadParams).promise();
// };

// export {uploadFile}


// // download file from s3
