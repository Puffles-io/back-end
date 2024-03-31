const fs = require("fs");
class File {
  async URLAppend(req, res) {
    try {
      console.log(req.body)
      if (
        !!!req.body.hasOwnProperty("jsonFiles") ||
        !!!req.body.hasOwnProperty("nftUrls")
      ) {
        res.status(200).json({ status: false, message: "Missing Data" });
      } else {
        let jsonFiles = [];
        for (let i = 0; i < req.body.jsonFiles.length; i++) {
          let string=Buffer.from(req.body.jsonFiles[i],'base64').toString('utf-8')
          let jsonObject = JSON.parse(string);
          jsonObject["image"] = req.body.nftUrls[i];
          jsonFiles.push(jsonObject);

          //req.body.jsonFiles[i].image = req.body.nftUrls[i];
        }
        res.json(200).json({ status: 200, message: jsonFiles });
      }
    } catch (err) {
      console.log(err);
      res.status(200).json({ status: false, message: "Server Error" });
    }
  }
}
module.exports = File;
