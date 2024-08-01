const S3 = require("../utils/s3");
const IPFS = require("../utils/ipfs");
const DatabaseHelper = require("../models/nft.model");

class DeleteNft {
  async removeNft(req, res) {
    try {
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };
      let artworks = await DatabaseHelper.prototype.getItem(params);
      console.log(artworks);
      if (artworks === undefined) {
        res
          .status(200)
          .json({ status: false, message: "Artwork doesn't exist" });
      } else {
        if (artworks.Item.hasOwnProperty("placeholder_image")) {
          S3.prototype.deleteImage(artworks.Item.placeholder_image);
        }
        if (artworks.Item.hasOwnProperty("thumbnail")) {
          S3.prototype.deleteImage(artworks.Item.thumbnail);
        }
        if (artworks.Item.hasOwnProperty("bg")) {
          S3.prototype.deleteImage(artworks.Item.bg);
        }

        await DatabaseHelper.prototype.deleteItem(params);

        res
          .status(200)
          .json({ status: true, message: "files deleted successfully" });
      }
    } catch (err) {
      console.log(err);

      res.status(200).json({message:"server error"});
    }
  }
  async deletePlaceholderImage(req, res) {
    try {
      const params = {
        TableName: "puffles",
        Key: {
          PK: `ADR#${req.user.address}`,
          SK: `ART#${req.body.artwork_id}`,
        },
      };
      let artworks = await DatabaseHelper.prototype.getItems(params);
      if (artworks === undefined) {
        res
          .status(200)
          .json({ status: false, message: "Artwork doesn't exist" });
      } else {
        if (
          artworks.Items.hasOwnProperty(placeholder_image) &&
          artworks.Items.placeholder_image != ""
        ) {
          S3.prototype.deleteImage(artworks.Items.placeholder_image);
          const updatedParams = {
            TableName: "puffles",
            Key: {
              PK: `ADR${req.user.address}`,
              SK: `ART${req.body.artwork_id}`,
            },
            UpdateExpression:
              "set #placeholder_image=:placeholder_image,#placeholder_fileurl=:filenames",
            ExpressionAttributeNames: {
              "#placeholder_image": "placeholder_image",
              "#placeholder_fileurl": "placeholder_fileurl",
            },
            ExpressionAttributeValues: {
              ":placeholder_image": "",
              ":filenames": "",
            },
          };
          await DatabaseHelper.prototype.updateItems(updatedParams);
          res.status(200).json({
            status: true,
            message: "Placeholder Image deleted successfully",
          });
        } else {
          res.status(200).json({
            status: false,
            message:
              "Artwork does not contain Placeholder Image deleted successfully",
          });
        }
      }
    } catch (err) {
      res.status(500).send("internal server error");
    }
  }
}
module.exports = DeleteNft;
