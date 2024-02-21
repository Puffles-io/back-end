const { Web3Storage, getFilesFromPath } = require("web3.storage");

// import { importDAG } from '@ucanto/core/delegation'
// import { CarReader } from '@ipld/car'
// import * as Signer from '@ucanto/principal/ed25519'
const path = require("path");

const fs = require("fs");
require("dotenv").config();
class IPFS {
  async createClient() {
    const principal = Signer.parse(process.env.WEB3_TOKEN);
    store = new StoreMemory();
    const client = await Client.create({ principal, store });
    // Add proof that this agent has been delegated capabilities on the space
    const proof = await parseProof(process.env.PROOF);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());
  }

  async uploadImage(fileblob) {
    return new Promise(async (resolve, reject) => {
      try {
        const file_extension = fileblob.originalname.split(".");

        const filename =
          Date.now().toString() + file_extension[file_extension.length - 1];

        const tempPath = path.join(__dirname, filename);
        fs.writeFileSync(tempPath, fileblob.buffer);

        const files = await filesFromPaths(tempPath);

        const client = await create();
        const directoryCid = await client.uploadDirectory(files);

        // const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
        // const file=await getFilesFromPath(tempPath)
        // const cid=await storage.put(file,{wrapWithDirectory:false})
        console.log("cid: ", directoryCid);
        fs.unlinkSync(tempPath);
        // resolve(cid)
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }
  async parseProof(data) {
    const { CarReader } = await import("@ipld/car");
    const { importDAG } = await import("@ucanto/core/delegation");

    const blocks = [];
    const reader = await CarReader.fromBytes(Buffer.from(data, "base64"));
    for await (const block of reader.blocks()) {
      blocks.push(block);
    }
    return importDAG(blocks);
  }
  async uploadFiles(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const ipfsClient = await import("ipfs-http-client");
        const ipfs = new ipfsClient.create({
          host: "localhost",
          port: 5001,
          protocol: "http",
        });
        let filePath = fs.readFileSync(
          "D:/Puffles/Backend/back-end/utils/files/39d8bc93-7c03-4155-9355-0fd07b5be970/Hello.txt"
        );
        let cid = await ipfs.add({ filePath: "Hello.txt", content: filePath });

        console.log(cid);
        //let files=await getFilesFromPath(`${tempPath}/`)
        // const storage=new Web3Storage({token:process.env.WEB3_TOKEN})
        // const cid=await storage.put(files,{wrapWithDirectory:false})

        //     let response={files:fs.readdirSync(`${tempPath}/`),cid:cid}
        //     fs.rmSync(tempPath,{recursive:true,force:true})
        //     resolve(response)
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }
  async uploadMetadata(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const tempPath = path.join(__dirname, "metadata", id);
        let files = await getFilesFromPath(`${tempPath}/`);
        const storage = new Web3Storage({ token: process.env.WEB3_TOKEN });
        const cid = await storage.put(files, { wrapWithDirectory: false });
        let response = { files: fs.readdirSync(`${tempPath}/`), cid: cid };
        fs.rmSync(tempPath, { recursive: true, force: true });
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteFiles(cid) {
    return new Promise(async (resolve, reject) => {
      try {
        const storage = new Web3Storage({ token: process.env.WEB3_TOKEN });
        await storage.delete(cid);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
  async uploadJson(data) {
    return new Promise(async (resolve, reject) => {
      try {
        let jsonArray = [data];
        const tempPath = path.join(__dirname, "json.json");
        fs.writeFileSync(tempPath, JSON.stringify(jsonArray));
        const storage = new Web3Storage({ token: process.env.WEB3_TOKEN });
        const file = await getFilesFromPath(tempPath);
        const cid = await storage.put(file, { wrapWithDirectory: false });
        fs.unlinkSync(tempPath);
        resolve(cid);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getJson(cid, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const storage = new Web3Storage({ token: process.env.WEB3_TOKEN });
        const jsonArray = await storage.get(cid);
        let blobs = await jsonArray.files();
        const blob = blobs[0];
        const arrayBuffer = await blob.arrayBuffer();

        // Convert the ArrayBuffer to a string
        const jsonString = Buffer.from(arrayBuffer).toString("utf8");
        console.log("jsonString: ", jsonString);
        let jsonData = JSON.parse(jsonString.toString());
        resolve(jsonData.find((obj) => obj.id == id));
      } catch (err) {
        reject(err);
      }
    });
  }
  async getJSON(cid) {
    return new Promise(async (resolve, reject) => {
      try {
        const storage = new Web3Storage({ token: process.env.WEB3_TOKEN });
        const jsonArray = await storage.get(cid);
        let blobs = await jsonArray.files();
        let array = [],
          urls = [];
        for (let i = 0; i < blobs.length; i++) {
          const blob = blobs[i];
          const arrayBuffer = await blob.arrayBuffer();
          const jsonString = Buffer.from(arrayBuffer).toString("utf8");
          const object = JSON.parse(jsonString);
          array[i] = object;
          urls[i] = object.image;
        }
        resolve({ array, urls });
      } catch (err) {
        reject(err);
      }
    });
  }
  async getJsonArray(cid) {
    return new Promise(async (resolve, reject) => {
      try {
        const storage = new Web3Storage({ token: process.env.WEB3_TOKEN });
        const jsonArray = await storage.get(cid);
        let blobs = await jsonArray.files();
        const blob = blobs[0];
        const arrayBuffer = await blob.arrayBuffer();

        // Convert the ArrayBuffer to a string
        const jsonString = Buffer.from(arrayBuffer).toString("utf8");
        console.log("jsonString: ", jsonString);
        resolve(JSON.parse(jsonString.toString()));
      } catch (err) {
        reject(err);
      }
    });
  }
  async updateJsonArray(cid, jsonArray) {
    return new Promise(async (resolve, reject) => {
      try {
        const storage = new Web3Storage({ token: process.env.WEB3_TOKEN });
        await storage.delete(cid);
        const tempPath = path.join(__dirname, "json.json");
        fs.writeFileSync(tempPath, JSON.stringify(jsonArray));
        const file = await getFilesFromPath(tempPath);
        const newCid = await storage.put(file, { wrapWithDirectory: false });
        fs.unlinkSync(tempPath);
        resolve(newCid);
      } catch (error) {
        reject(error);
      }
    });
  }

  async pushtoJson(cid, data) {
    try {
      const storage = new Web3Storage({ token: process.env.WEB3_TOKEN });
      const jsonArray = await storage.get(cid);
      let blobs = await jsonArray.files();
      const blob = blobs[0];
      const arrayBuffer = await blob.arrayBuffer();

      // Convert the ArrayBuffer to a string
      const jsonString = Buffer.from(arrayBuffer).toString("utf8");
      console.log("jsonString: ", jsonString);
      let jsonData = JSON.parse(jsonString);
      await storage.delete(cid);
      jsonData.push(data);
      const tempPath = path.join(__dirname, "json.json");
      fs.writeFileSync(tempPath, JSON.stringify(jsonData));
      const file = await getFilesFromPath(tempPath);
      const newCid = await storage.put(file, { wrapWithDirectory: false });
      fs.unlinkSync(tempPath);
      resolve(newCid);
    } catch (err) {
      reject(err);
    }
  }
}
module.exports = IPFS;
