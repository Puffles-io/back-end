const fs = require("fs");
class File {
  async URLAppend(req, res) {
    try {
      if (
        !!!req.body.hasOwnProperty("jsonFiles") ||
        !!!req.body.hasOwnProperty("nftUrls")
      ) {
        res.status(200).json({ status: false, message: "Missing Data" });
      } else {
        let jsonFiles = [];
        for (let i = 0; i < req.body.jsonFiles; i++) {
          let jsonFile = fs.readFileSync(req.body.jsonFiles[i]);
          let jsonObject = JSON.parse(jsonFile);
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
