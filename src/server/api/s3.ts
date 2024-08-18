import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_KEY_ID;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey as string,
    secretAccessKey: secretKey as string,
  },
});

const randomImageName = (bytes = 32) => randomBytes(bytes).toString("hex");

export const getFileURL = async (imageName: string) => {
  const params = {
    Bucket: bucketName,
    Key: imageName,
  };

  const command = new GetObjectCommand(params);
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return url;
};

export const uploadFile = async (media: {
  buffer: string;
  mimetype: string;
}) => {
  const buffer = Buffer.from(media.buffer, "base64");

  // Check file size (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (buffer.length >= maxSize) {
    throw new TRPCError({
      code: "PAYLOAD_TOO_LARGE",
      message: "File size must be less than 5MB",
    });
  }

  const imageName = randomImageName();

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: buffer,
    ContentType: media.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);
  return imageName;
};

export const deleteFile = async (imageName: string) => {
  const params = {
    Bucket: bucketName,
    Key: imageName,
  };

  const command = new DeleteObjectCommand(params);
  return await s3.send(command);
};
