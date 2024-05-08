const {
  writeFile,
  writeMetadata,
  base64ToBlob,
  base64ToFileBlob,
} = require("../utils/utils");
const error = require("../services/errorFormater");
const S3 = require("../utils/s3");
const IPFS = require("../utils/ipfs");
const fs = require("fs");
const fsextra = require("fs-extra");
const Database = require("../models/nft.model");
const { uuid } = require("uuidv4");
const path = require("path");

exports.upload_v1 = async (req, res) => {
  return new Promise(async function (resolve, reject) {
    try {
      if (!Boolean(req.body.artwork_id)) {
        let id = writeFile(req.file, uuid());
        res.status(200).json({ status: true, id: id });
      } else {
        let id = writeFile(req.file, req.body.artwork_id);
        res.status(200).json({ status: true, id: id });
      }
      // let {cid,filename}= await uploadImage(req.body.file_url);
      // let metadata={title:req.body.title,description:req.body.description,cid:cid,detailed_reveal:req.body.detailed_reveal,filename:filename}
      // let metadata_url=await uploadJSON(metadata)
      // let nft=new NFT({cid:metadata_url,address:req.user.address,ip:req.connection.remoteAddress,title:req.body.title})
      // await nft.save()
      // res.status(200).json({status:true,message:"NFT saved successfully"})
    } catch (err) {
      console.log("error: ", err);
      error(err, req);
      res.status(500).json({ message: "Error: " + err.toString() });
    }
  });
};

exports.metadataUrls = async (req, res) => {
  if (!Boolean(req.body.metadataUrls)) {
    res.status(200).json({ status: false, message: "Missing metadata urls" });
  } else {
    let id = uuid();
    const params = {
      TableName: "puffles",
      Item: {
        PK: `ADR#${req.user.address}`,
        SK: `ART#${id}`,
        metadataUrls: req.body.metadataUrls,
        timestamp: new Date().toISOString(),
        ip: req.connection.remoteAddress,
      },
    };
    await Database.prototype.addItem(params);
    res.status(200).json({ status: true, id: id });
  }
};
exports.uploadtoIPFS = async (req, res) => {
  try {
    console.log("req body", req.body);
    if (!Boolean(req.body.id)) {
      res.status(200).json({ status: false, message: "Missing artwork id" });
    } else {
      const parentDirectory = path.join(
        __dirname,
        "..",
        "utils",
        "files",
        req.body.id
      );
      if (fs.existsSync(parentDirectory)) {
        let files = await IPFS.prototype.uploadFiles(req.body.id);
        const params = {
          TableName: "puffles",
          Item: {
            PK: `ADR#${req.user.address}`,
            SK: `ART#${req.body.id}`,
            filenames: files.files,
            cid: files.cid,
            timestamp: new Date().toISOString(),
            ip: req.connection.remoteAddress,
          },
        };
        await Database.prototype.addItem(params);
        fsextra.removeSync(parentDirectory);
        res
          .status(200)
          .json({ status: true, message: "Artworks uploaded successfully" });
      } else {
        res
          .status(200)
          .json({ status: false, message: "Artwork doesnt exist for this id" });
      }
    }
  } catch (err) {
    res.status(200).json({ status: false, message: err.toString() });
  }
};
exports.title = async (req, res) => {
  try {
    if (!Boolean(req.body.artwork_id)) {
      res
        .status(200)
        .json({ status: false, message: "Please send Artwork ID" });
    } else {
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };
      let nft = await Database.prototype.getItem(params);
      if (nft === undefined) {
        res.status(200).json({
          status: true,
          message: "Artwork with given id doesnt exist",
        });
      } else {
        let updateExpression = "";
        let expressionAttributeNames = {};
        let expressionAttributeValues = {};
        if (Object.keys(nft.Item.delayed_reveal).length == 0) {
          updateExpression =
            "set #title=:title,#URI=:URI,#URI_status=:URI_status,#is_revealed=:is_revealed";
          expressionAttributeNames = {
            "#title": "title",
            "#URI": "URI",
            "#URI_status": "URI_status",
            "#is_revealed": "is_revealed",
          };
          expressionAttributeValues = {
            ":title": req.body.title,
            ":URI": req.body.title.toLowerCase().replace(/\s/g, ""),
            ":URI_status": true,
            ":is_revealed": false,
          };
        } else {
          updateExpression =
            "set #title=:title,#URI=:URI,#URI_status=:URI_status,#delayed_reveal=:delayed_reveal";
          expressionAttributeNames = {
            "#title": "title",
            "#URI": "URI",
            "#URI_status": "URI_status",

            "#delayed_reveal": "delayed_reveal",
          };
          expressionAttributeValues = {
            ":title": req.body.title,
            ":URI": req.body.title.toLowerCase().replace(/\s/g, ""),
            ":URI_status": true,

            ":delayed_reveal": req.body.delayed_reveal,
          };
        }
        const updatedParams = {
          TableName: "puffles",
          Key: {
            PK: `ADR#${req.user.address}`,
            SK: `ART#${req.body.artwork_id}`,
          },
          updateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        };
        await Database.prototype.updateItems(updatedParams);
        res.status(200).json({
          status: true,
          message: req.body.artwork_id,
          URI: req.body.title.toLowerCase().replace(/\s/g, ""),
        });
      }
    }
  } catch (err) {
    res.status(500).json({ message: "Err" + err });
  }
};

exports.sortTitle = async (req, res) => {
  try {
    const params = {
      TableName: "puffles",
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `ADR#${req.user.address}`,
      },
    };
    let results = await Database.prototype.getItems(params);
    if (results === undefined) {
      res
        .status(200)
        .json({ status: false, message: "User does not have any collections" });
    } else {
      if (req.body.order == "INCREASING") {
        results.Items = results.Items.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);

          // Compare the dates and return the result
          return dateA - dateB;
        });
      } else if (req.body.order == "DECREASING") {
        results.Items = results.Items.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);

          return dateB - dateA; // Compare in descending order (latest to earliest)
        });
      }

      if (Boolean(req.body.title)) {
        results.Items = results.Items.filter(
          (obj) =>
            obj.title &&
            obj.title.toLowerCase().includes(req.body.title.toLowerCase())
        );
      }
      res.status(200).json({ status: true, results: results.Items });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ status: false, message: "Server error occurred" });
  }
};

exports.artByID = async (req, res) => {
  try {
    if (!Boolean(req.body.artwork_id)) {
      res.status(200).json({ status: false, message: "Missing data" });
    } else {
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };
      let results = await Database.prototype.getItem(params);
      if (results === undefined) {
        res.status(200).json({
          status: false,
          message: "Artwork with given ID doesn't exist",
        });
      } else {
        res.status(200).json({ status: true, message: results.Item });
      }
    }
  } catch (err) {
    res.status(500).json({ status: false, message: err });
  }
};

exports.uploadThumbnail = async (req, res) => {
  try {
    if (!Boolean(req.body.artwork_id)) {
      res.status(200).json({ status: false, message: "Missing data" });
    } else {
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };
      let results = await Database.prototype.getItem(params);
      if (results === undefined) {
        res
          .status(200)
          .json({ status: false, message: "Artwork id doesn't exist" });
      }
      if (!req.body.thumbnail.image.length && !req.body.bg.image.length) {
        res.status(200).json({
          status: true,
          message: "Neither thumbnail nor bg image was sent",
        });
      } else {
        let thumbnail = null;
        let bg = null;
        if (req.body.thumbnail.image.length) {
          let file = base64ToFileBlob(
            req.body.thumbnail.image,
            `image.${req.body.thumbnail.type}`
          );
          let filedata = await S3.prototype.uploadImage(file);
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #thumbnail=:thumbnail",
            ExpressionAttributeNames: {
              "#thumbnail": "thumbnail",
            },
            ExpressionAttributeValues: {
              ":thumbnail": filedata.filename,
            },
          };
          await Database.prototype.updateItems(updatedParams);
          thumbnail = filedata.location;
        }
        if (req.body.bg.image.length) {
          let file = base64ToFileBlob(
            req.body.bg.image,
            `image.${req.body.bg.type}`
          );
          let filedata = await S3.prototype.uploadImage(file);
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #bg=:bg",
            ExpressionAttributeNames: {
              "#bg": "bg",
            },
            ExpressionAttributeValues: {
              ":bg": filedata.filename,
            },
          };
          await Database.prototype.updateItems(updatedParams);
          bg = filedata.location;
        }
        res.status(200).json({ status: true, thumbnail: thumbnail, bg: bg });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ status: false, message: "Internal server error" });
  }
};

exports.placeholder_image = async (req, res) => {
  try {
    if (!Boolean(req.body.artwork_id)) {
      res.status(200).json({ status: false, message: "Missing data" });
    } else {
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };
      let results = await Database.prototype.getItem(params);
      if (results === undefined) {
        res
          .status(200)
          .json({ status: false, message: "Artwork id doesn't exist" });
      } else {
        if (
          results.Items.hasOwnProperty(placeholder_image) &&
          results.Items.placeholder_image != ""
        ) {
          S3.prototype.deleteImage(results.Items.placeholder_image);
        }
        let filedata = await S3.prototype.uploadImage(req.file);
        const updatedParams = {
          TableName: "puffles",
          Key: {
            PK: `ADR#${req.user.address}`,
            SK: `ART#${req.body.artwork_id}`,
          },
          UpdateExpression:
            "set #placeholder_image=:placeholder_image,#placeholder_fileurl=:placeholder_fileurl",
          ExpressionAttributeNames: {
            "#placeholder_image": "placeholder_image",
            "#placeholder_fileurl": "placeholder_fileurl",
          },
          ExpressionAttributeValues: {
            ":placeholder_image": filedata.filename,
            ":placeholder_fileurl": filedata.location,
          },
        };
        await Database.prototype.updateItems(updatedParams);
        res
          .status(200)
          .json({ status: true, message: "placeholder image saved" });
      }
    }
  } catch (err) {
    res.status(500).json({ status: false, message: "Err: " + err });
  }
};
exports.metadata = async (req, res) => {
  try {
    const params = {
      TableName: "puffles",
      Key: {
        PK: `ADR#${req.user.address}`,
        SK: `ART#${req.body.artwork_id}`,
      },
    };
    let results = await Database.prototype.getItem(params);
    if (results === undefined) {
      res
        .status(200)
        .json({ status: false, message: "Artwork id doesn't exist" });
    } else {
      writeMetadata(req.file, req.body.artwork_id);
      res.status(200).json({ status: true, message: "Saved Metadata files" });
    }
  } catch (err) {
    res.staus(500).json({ status: false, message: "Err: " + err });
  }
};
exports.metadataUpload = async (req, res) => {
  try {
    if (!Boolean(req.body.artwork_id)) {
      res.status(200).json({ status: false, message: "Missing artwork id" });
    } else {
      const parentDirectory = path.join(
        __dirname,
        "..",
        "utils",
        "metadata",
        req.body.artwork_id
      );
      if (fs.existsSync(parentDirectory)) {
        const params = {
          TableName: "puffles",
          Key: {
            PK: `ADR#${req.user.address}`,
            SK: `ART#${req.body.artwork_id}`,
          },
        };
        let results = await Database.prototype.getItem(params);
        if (results === undefined) {
          res.status(200).json({
            status: false,
            message: "Files with given artwork id doesn't exist",
          });
        } else {
          let filedata = fs.readdirSync(parentDirectory);
          for (let i = 0; i < filedata.length; i++) {
            const filepath = path.join(parentDirectory, filedata[i]);
            if (path.extname(filedata[i]) === ".json") {
              const data = fs.readFileSync(filepath, "utf8");
              const jsonData = JSON.parse(data);
              jsonData.image = `https://${results.Item.cid}.ipfs.dweb.link/${results.Item.filenames[i]}`;
              const modifiedData = JSON.stringify(jsonData, null, 2);
              // Write the modified data back to the file synchronously
              const parts = filepath.split(".");
              fs.writeFileSync(parts[0], modifiedData, "utf8");
              fs.unlinkSync(filepath);
            }
          }
          let files = await IPFS.prototype.uploadMetadata(req.body.artwork_id);
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #metadata=:metadata",
            ExpressionAttributeNames: { "#metadata": "metadata" },
            ExpressionAttributeValues: { ":metadata": files.cid },
          };
          await Database.prototype.updateItems(updatedParams);

          // fsextra.removeSync(parentDirectory)
          res.status(200).json({
            status: true,
            message: "Metadata uploaded successfully",
            cid: files.cid,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, message: "Server Error" + err });
  }
};
exports.get_nfts = async (req, res) => {
  return new Promise(async function (resolve, reject) {
    try {
      const params = {
        TableName: "puffles",
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
          ":pk": `ADR#${req.user.address}`,
        },
      };
      let nfts = await Database.prototype.getItems(params);
      console.log("metadata: ", nfts);
      if (nfts === undefined) {
        res.status(200).json({ status: true, artwork: [] });
      } else {
        nfts.Items.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        res.status(200).json({ status: true, artwork: nfts.Items });
      }
    } catch (err) {
      error(err, req);
      console.log("Err: ", err);
      res.status(500).json({ message: "Err: " + err });
    }
  });
};
exports.whitelistByURI = async (req, res) => {
  return new Promise(async function (resolve, reject) {
    try {
      if (!Boolean(req.body.title)) {
        res.status(200).json({ status: false, message: "Missing title" });
      } else {
        const params = {
          TableName: "puffles", // Replace with your table name
          FilterExpression: "URI = :URI",
          ExpressionAttributeValues: {
            ":URI": req.body.URI,
          },
        };
        let address = await Database.prototype.matchItem(params);
        if (address === undefined) {
          res.status(200).json({
            status: false,
            message: "Artwork with given id does not exist",
          });
        } else {
          res
            .status(200)
            .json({ status: true, message: address.Items[0].whitelist });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: false, message: "Server Error" });
    }
  });
};
