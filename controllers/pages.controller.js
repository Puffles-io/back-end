const DatabaseHelper = require("../models/nft.model");
const error = require("../services/errorFormater");
const S3 = require("../utils/s3");
exports.pages = async (req, res) => {
  return new Promise(async function (resolve, reject) {
    try {
      if (
        !Boolean(
          req.body.artwork_id ||
            req.body.Url_string ||
            req.body.theme ||
            req.body.bg_image
        )
      ) {
        res.status(200).json({ status: false, message: "Missing details" });
      } else {
        let result = await S3.prototype.uploadImage(req.body.bg_image);
        req.body.bg_image = result.location;
        req.body.filename = result.filename;
        const params = {
          TableName: "puffles",
          Item: {
            PK: `ADR#${req.user.address}`,
            SK: `ART#${req.body.artwork_id}`,
            ip: req.body.ip,
            bg_image: result.body.bg_image,
            filename: result.filename,
            url_string: req.body.Url_string,
            theme: req.body.theme,
            timestamp: new Date(),
          },
        };
        await DatabaseHelper.prototype.addItem(params);
        res
          .status(200)
          .json({ status: true, message: "Page saved successfully" });
      }
    } catch (err) {
      error(err, req);
      res.status(500).json({ message: "Error: " + err.toString() });
    }
  });
};
exports.update_uri = async (req, res) => {
  return new Promise(async function (resolve, reject) {
    try {
      if (!Boolean(req.body.artwork_id)) {
        res.json(200).json({ status: false, message: "Missing id value" });
      } else {
        const params = {
          TableName: "puffles",
          Key: {
            PK: `ADR#${req.user.address}`,
            SK: `PGE#${req.body.artwork_id}`,
          },
        };
        let page = await DatabaseHelper.prototype.getItem(params);
        if (page.Items.length) {
          res.status(200).json({ status: true, page: page[0] });
        } else {
          res.status(200).json({ status: false, page: null });
        }
      }
    } catch (err) {
      console.log(err);
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  });
};
exports.get_page = async (req, res) => {
  return new Promise(async function (resolve, reject) {
    try {
      if (!Boolean(req.body.id)) {
        res.json(200).json({ status: false, message: "Missing id value" });
      } else {
        const params = {
          TableName: "puffles",
          Key: {
            PK: `ADR#${req.user.address}`,
            SK: `PGE#${req.body.artwork_id}`,
          },
        };
        let page = await DatabaseHelper.prototype.getItem(params);
        if (page === undefined) {
          res
            .status(200)
            .json({
              status: false,
              message: "Artwork with given id doesn't exist",
            });
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
          res.status(200).json({ status: false, page: null });
        }
      }
    } catch (err) {
      console.log(err);
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  });
};
