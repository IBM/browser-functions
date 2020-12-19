// Simple wrapper for fs calls to s3 - convenience over performance right now
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import config from "./config";

// Bucket Data
const REGION = "us-east-1";
const BUCKET_NAME = "code-cloud-files";

// Aspen Code Cloud User
const accessKeyId = config.awsAccessKeyId;
const secretAccessKey = config.awsSecretAccessKey;

const s3 = new S3Client({
  region: REGION,
  credentials: { accessKeyId, secretAccessKey },
});

const fileExists = async (s3Key:string) : Promise<boolean> =>  {
  try {
    const headObjectCommands = { Bucket: BUCKET_NAME, Key: s3Key };
    await s3.send(new HeadObjectCommand(headObjectCommands)); // TODO: check if this can return data if found
    return true;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
}

const readFile = async (s3Key:string) : Promise<Buffer> =>  {
  try {
    const readObjectCommands = { Bucket: BUCKET_NAME, Key: s3Key };
    const results = await s3.send(new GetObjectCommand(readObjectCommands));

    // Comes in as nodejs stream - https://nodejs.org/api/stream.html#stream_readable_streams
    const readStream = results.Body as Readable;
    const chunks = [];
    for await (const chunk of readStream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (err) {
    console.log("Error", err);
    throw err;
  }
}

const readFileAsString = async (s3Key:string) : Promise<string> => {
    const readable = await readFile(s3Key);
    return readable.toString("utf8");
}

const writeFile = async (s3Key:string, content: string) : Promise<void> => {
  try {
    const writeObjectParams = { Bucket: BUCKET_NAME, Key: s3Key, Body: content };
    await s3.send(new PutObjectCommand(writeObjectParams));
  } catch (err) {
    console.log("Error", err);
  }
}

const deleteFile = async (s3Key: string) : Promise<void> => {
  try {
    const deleteObjectParams = { Bucket: BUCKET_NAME, Key: s3Key };
    await s3.send(new DeleteObjectCommand(deleteObjectParams));
  } catch (err) {
    console.log("Error", err);
  }
};

// TODO: is there better way to simulate 'ls'? - see docs...
const listDirectoryContents = async (s3Prefix:string, immediateContentsOnly: boolean) => {
  try {
    const listObjectsParams = { Bucket: BUCKET_NAME, Prefix: s3Prefix };
    const results = await s3.send(new ListObjectsV2Command(listObjectsParams));
    if (results.Contents) {
      const allPaths = results.Contents.map(x => x.Key);
      if(!immediateContentsOnly) return allPaths;
      const immediateContents = [...new Set(allPaths.map(x => x.split("/")[0]))];
      return immediateContents;
    } else {
      return; // TODO: handle undefined / not found
    }
  } catch (err) {
    console.log("Error", err);
  }
};

export default {
  fileExists,
  readFile,
  readFileAsString,
  writeFile,
  deleteFile,
  listDirectoryContents
}