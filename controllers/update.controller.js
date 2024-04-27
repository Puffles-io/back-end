const DataRefine = require("../services/DataRefine.service");
const S3 = require("../utils/s3");
const { updatedata } = require("../utils/utils");
const IPFS = require("../utils/ipfs");
const error = require("../services/errorFormater");
const DatabaseHelper = require("../models/nft.model");
class Update {
  async NFT(req, res) {
    try {
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };

      if (!Boolean(req.body.artwork_id)) {
        res.status(200).json({ status: false, message: "missing data" });
      } else {
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results === undefined) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          let files = await IPFS.prototype.uploadFiles(req.body.artwork_id);
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #cid=:cid,#filenames=:filenames",
            ExpressionAttributeNames: {
              "#cid": "cid",
              "#filenames": "filenames",
            },
            ExpressionAttributeValues: {
              ":cid": files.cid,
              ":filenames": files.files,
            },
          };
          await DatabaseHelper.prototype.updateItems(updatedParams);
          res
            .status(200)
            .json({ status: true, message: "Artwork updated successfully" });
        }
      }
    } catch (err) {
      console.log("Error: ", err);
      error(err, req);
      res.status(500).send("Server error");
    }
  }
  async Address_Saledate(req, res) {
    try {
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };
      if (!Boolean(req.body.artwork_id)) {
        res.status(200).json({ status: false, message: "missing data" });
      } else {
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results === undefined) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          if (req.body.hasOwnProperty("address")) {
            console.log(
              `ADR#${req.user.address}`,
              `ART#${req.body.artwork_id}`
            );
            const updatedParams = {
              TableName: "puffles",
              Key: {
                PK: `ADR#${req.user.address}`,
                SK: `ART#${req.body.artwork_id}`,
              },
              UpdateExpression:
                "set #address=:address,#mint_structure=:mint_structure,#chain=:chain,#revenue_split_address=:revenue_split_address,#revenue_shares=:revenue_shares,#mint_structure_type=:mint_structure_type",
              ExpressionAttributeNames: {
                "#address": "address",
                "#mint_structure": "mint_structure",
                "#chain": "chain",
                "#revenue_split_address": "revenue_split_address",
                "#revenue_shares": "revenue_shares",
                "#mint_structure_type": "mint_structure_type",
              },
              ExpressionAttributeValues: {
                ":address": req.body.address,
                ":mint_structure": req.body.mint_structure,
                ":chain": req.body.chain,
                ":revenue_split_address": req.body.revenue_split_address,
                ":revenue_shares": req.body.revenue_shares,
                ":mint_structure_type": req.body.mint_structure_type,
              },
            };
            await DatabaseHelper.prototype.updateItems(updatedParams);
            res.status(200).json({
              status: true,
              message: "Artwork Title updated successfully",
            });
          } else {
            const updatedParams = {
              TableName: "puffles",
              Key: {
                PK: `ADR#${req.user.address}`,
                SK: `ART#${req.body.artwork_id}`,
              },
              UpdateExpression:
                "set #sale=:sale,#mint_structure=:mint_structure,#chain=:chain,#revenue_split_address=:revenue_split_address,#revenue_shares=:revenue_shares,#mint_structure_type=:mint_structure_type",
              ExpressionAttributeNames: {
                "#sale": "sale_date",
                "#mint_structure": "mint_structure",
                "#chain": "chain",
                "#revenue_split_address": "revenue_split_address",
                "#revenue_shares": "revenue_shares",
                "#mint_structure_type": "mint_structure_type",
              },
              ExpressionAttributeValues: {
                ":sale": req.body.sale_date,
                ":mint_structure": req.body.mint_structure,
                ":chain": req.body.chain,
                ":revenue_split_address": req.body.revenue_split_address,
                ":revenue_shares": req.body.revenue_shares,
                ":mint_structure_type": req.body.mint_structure_type,
              },
            };
            await DatabaseHelper.prototype.updateItems(updatedParams);
            res.status(200).json({
              status: true,
              message: "Artwork Sale Date updated successfully",
            });
          }
        }
      }
    } catch (err) {
      console.log("Error: ", err);
      error(err, req);
      res.status(500).send("Server error");
    }
  }

  async Page(req, res) {
    try {
      var UpdateExpression = "";
      var ExpressionAttributeNames = {};
      var ExpressionAttributeValues = {};
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };
      let page = DatabaseHelper.prototype.getItem(params);

      const data = DataRefine.prototype.removeNullData(req.body);
      if (data.bg_image) {
        if (
          page.Items[0].hasOwnProperty("filename") &&
          page.Items[0].filename != ""
        ) {
          await S3.prototype.deleteImage(page.filename);
        }
        let result = await S3.prototype.uploadImage(data.bg_image);
        data.filename = result.filename;
        data.bg_image = result.location;
      }
      if (Object.keys(data).length == 2) {
        for (const [key, value] of Object.entries(data)) {
          if (key == "id") {
            continue;
          } else {
            UpdateExpression = `set #${key}=:${key}`;
            ExpressionAttributeNames[`#${key}`] = `${key}`;
            ExpressionAttributeValues[`:${key}`] = value;
          }
        }
      } else if (Object.keys(data).length == 1) {
        res.status(200).json({ status: true, message: "No data to update" });
      } else {
        for (const [key, value] of Object.entries(data)) {
          if (key == "id") {
            continue;
          } else if (!UpdateExpression.includes("set")) {
            UpdateExpression = `set #${key}=:${key}`;
          } else {
            UpdateExpression += `,#${key}=:${key}`;
          }
          ExpressionAttributeNames[`#${key}`] = `${key}`;
          ExpressionAttributeValues[`:${key}`] = value;
        }
      }
      const updatedParams = {
        TableName: "puffles",
        Key: { PK: `ADR#${req.user.address}`, SK: `PGE#${req.body.id}` },
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
      await DatabaseHelper.prototype.updateItems(updatedParams);

      res
        .status(200)
        .json({ status: true, message: "Page updated successfuly" });
    } catch (err) {
      error(err, req);
      res.status(200).json({ message: "Server Error" });
    }
  }

  async SmartContract(req, res) {
    try {
      if (!Boolean(req.body.id)) {
        res.status(200).json({ status: false, message: "Missing data" });
      } else {
        const data = DataRefine.prototype.removeNullData(req.body);
        const params = {
          TableName: "puffles",
          Key: {
            PK: `ADR#${req.user.address}`,
            SK: `SMC#${data.id}`,
          },
        };
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results.Items.length == 0) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          var UpdateExpression = "";
          var ExpressionAttributeNames = {};
          var ExpressionAttributeValues = {};
          for (const [key, value] of Object.entries(data)) {
            if (key == "id") {
              continue;
            } else if (!UpdateExpression.includes("set")) {
              UpdateExpression = `set #${key}=:${key}`;
            } else {
              UpdateExpression += `,#${key}=:${key}`;
            }
            ExpressionAttributeNames[`#${key}`] = `${key}`;
            ExpressionAttributeValues[`:${key}`] = value;
          }
          const updatedParams = {
            TableName: "puffles",
            Key: { PK: `ADR#${req.user.address}`, SK: `SMC#${req.body.id}` },
            UpdateExpression: UpdateExpression,
            ExpressionAttributeNames: ExpressionAttributeNames,
            ExpressionAttributeValues: ExpressionAttributeValues,
          };
          await DatabaseHelper.prototype.updateItems(updatedParams);

          res
            .status(200)
            .json({ status: true, message: "Page updated successfuly" });
        }
      }
    } catch (err) {
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  }
  async Theme(req, res) {
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
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results === undefined) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #theme=:theme",
            ExpressionAttributeNames: { "#theme": "theme" },
            ExpressionAttributeValues: { ":theme": req.body.theme },
          };
          await DatabaseHelper.prototype.updateItems(updatedParams);

          res
            .status(200)
            .json({ status: true, message: "Theme updated successfuly" });
        }
      }
    } catch (err) {
      console.log(err);
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  }
  async Whitelist(req, res) {
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
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results === undefined) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #whitelist=:whitelist",
            ExpressionAttributeNames: { "#whitelist": "whitelist" },
            ExpressionAttributeValues: { ":whitelist": req.body.whitelist },
          };
          await DatabaseHelper.prototype.updateItems(updatedParams);

          res
            .status(200)
            .json({ status: true, message: "Whitelist updated successfuly" });
        }
      }
    } catch (err) {
      console.log(err);
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  }
  async activePhase(req, res) {
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
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results === undefined) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #active_phase=:active_phase",
            ExpressionAttributeNames: { "#active_phase": "active_phase" },
            ExpressionAttributeValues: {
              ":active_phase": req.body.active_phase,
            },
          };
          await DatabaseHelper.prototype.updateItems(updatedParams);

          res.status(200).json({
            status: true,
            message: "Active Phase updated successfuly",
          });
        }
      }
    } catch (err) {
      console.log(err);
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  }
  async List(req, res) {
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
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results === undefined) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #list=:list",
            ExpressionAttributeNames: { "#list": "list" },
            ExpressionAttributeValues: { ":list": req.body.list },
          };
          await DatabaseHelper.prototype.updateItems(updatedParams);

          res
            .status(200)
            .json({ status: true, message: "List updated successfuly" });
        }
      }
    } catch (err) {
      console.log(err);
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  }
  async Page_Description(req, res) {
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
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results === undefined) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR#${req.user.address}`,
              SK: `ART#${req.body.artwork_id}`,
            },
            UpdateExpression: "set #page_description=:page_description",
            ExpressionAttributeNames: {
              "#page_description": "page_description",
            },
            ExpressionAttributeValues: {
              ":page_description": req.body.page_description,
            },
          };
          await DatabaseHelper.prototype.updateItems(updatedParams);

          res.status(200).json({
            status: true,
            message: "Page Description updated successfuly",
          });
        }
      }
    } catch (err) {
      console.log(err);
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  }
  async URI(req, res) {
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
        let results = await DatabaseHelper.prototype.getItem(params);
        if (results === undefined) {
          res
            .status(200)
            .json({ status: false, message: "Artwork doesn't exist" });
        } else {
          const URIparams = {
            TableName: "puffles",
            FilterExpression: "URI = :uri",
            ExpressionAttributeValues: {
              ":uri": req.body.URI,
            },
          };
          let results = await DatabaseHelper.prototype.matchItem(URIparams);
          console.log({ results });
          if (results.Count) {
            res.status(200).json({ status: false });
          } else {
            const updatedParams = {
              TableName: "puffles",
              Key: {
                PK: `ADR#${req.user.address}`,
                SK: `ART#${req.body.artwork_id}`,
              },
              UpdateExpression: "set #URI=:URI,#URI_status=:URI_status",
              ExpressionAttributeNames: {
                "#URI": "URI",
                "#URI_status": "URI_status",
              },
              ExpressionAttributeValues: {
                ":URI": req.body.URI,
                ":URI_status": true,
              },
            };
            await DatabaseHelper.prototype.updateItems(updatedParams);

            res
              .status(200)
              .json({ status: true, message: "URI updated successfuly" });
          }
        }
      }
    } catch (err) {
      console.log(err);
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  }
}
module.exports = Update;
