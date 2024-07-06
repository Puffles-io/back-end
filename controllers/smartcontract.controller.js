const DatabaseHelper = require("../models/nft.model");
const error = require("../services/errorFormater");
exports.smartcontract = async (req, res) => {
  return new Promise(async function (resolve, reject) {
    try {
      if (
        !Boolean(
          req.body.sale_date ||
            req.body.name ||
            req.body.token_symbol ||
            req.body.total_supply ||
            req.body.price ||
            req.body.max_token_per_wallet ||
            req.body.recipient_address ||
            req.body.artwork_id
        )
      ) {
        res.status(200).json({ status: false, message: "Missing Credentials" });
      } else {
        req.body.wallet_address = req.user.address;
        const params = {
          TableName: "puffles",
          Item: {
            PK: `ADR#${req.user.address}`,
            SK: `SMC#${req.body.artwork_id}`,
            ip: req.body.ip,
            wallet_address: req.user.address,
            sale_date: req.body.sale_data,
            token_symbol: req.body.token_symbol,
            total_supply: req.body.total_supply,
            price: req.body.price,
            max_token_per_wallet: req.body.max_token_per_wallet,
            recipient_address: req.body.recipient_address,
            timestamp: new Date(),
          },
        };
        await DatabaseHelper.prototype.addItem(params);
        res
          .status(200)
          .json({ status: true, message: "Smart Contract saved successfully" });
      }
    } catch (err) {
      error(err, req);
      res.status(500).json({ message: "Error: " + err.toString() });
    }
  });
};
exports.get_address = async (req, res) => {
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
        let address = await DatabaseHelper.prototype.matchItem(params);
        console.log(address.Items[0]);
        if (address === undefined) {
          res.status(200).json({
            status: false,
            message: "Artwork with given id does not exist",
          });
        } else if (address.Items.length) {
          res.status(200).json({ status: true, message: address.Items[0] });
        } else {
          res.status(200).json({
            status: false,
            message: "Artwork with given title does not exist",
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: false, message: "Server Error" });
    }
  });
};
exports.get_contract = async (req, res) => {
  return new Promise(async function (resolve, reject) {
    try {
      if (!Boolean(req.body.id)) {
        res.status(200).json({ status: false, message: "Missing id" });
      } else {
        const params = {
          TableName: "puffles",
          Key: {
            PK: `ADR#${req.user.address}`,
            SK: `SMC#${req.body.id}`,
          },
        };
        let contract = await DatabaseHelper.prototype.getItem(params);
        if (contract === undefined) {
          res.status(200).json({ status: true, contract: null });
        } else {
          res.status(200).json({ status: false, contract: contract.Items });
        }
      }
    } catch (err) {
      error(err, req);
      res.status(500).json({ message: "Server Error" });
    }
  });
};
