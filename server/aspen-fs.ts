import config from "./config";
import fs from "fs";
const fsPromises = fs.promises
import s3fs from "./s3fs";

const readFile = async (path:string) => {
  if(config.useS3) {
    return await s3fs.readFile(path);
  } else {
    return fs.readFileSync(path);
  }
};

const readdir = async (path: string) => {
  if(config.useS3) {
    return await s3fs.listDirectoryContents(path, true);
  } else {
    return await fsPromises.readdir(path)
  }
}

const writeFile = async (path: string, content: string) => {
  if (config.useS3) {
    await s3fs.writeFile(path, content); 
  } else {
    const splitPath = path.split("/");
    splitPath.pop();
    try {
      await fsPromises.access(splitPath.join('/'));
    } catch {
      await fsPromises.mkdir(splitPath.join('/'), { recursive: true });
    }
    await fsPromises.writeFile(path, content);
  }
}

const deleteFile = async (path: string) => {
  if (config.useS3) {
    await s3fs.deleteFile(path);
  } else {
    deleteFolderRecursive(path);
  }
}

function deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
      if(fs.lstatSync(path).isFile()) {
          fs.unlinkSync(path);
          return
      }
      fs.readdirSync(path).forEach(function(file,index){
          const curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
  }
};


export default {
  readFile,
  readdir,
  writeFile,
  deleteFile
}