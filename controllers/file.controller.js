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
        for (let i = 0; i < req.body.jsonFiles.length; i++) {
          try {
            const jsonString = atob(req.body.jsonFiles[i]);
    
            // Parse JSON string to JavaScript object
            const jsonObject = JSON.parse(jsonString);
            console.log(jsonObject)
            jsonObject["image"] = req.body.nftUrls[i];
            jsonFiles.push(jsonObject);
          } catch (parseErr) {
            console.log("Error parsing JSON file:", parseErr);
            // Handle parse error if needed
          }
        }
        res.status(200).json({ status: 200, message: jsonFiles });
      }
    } catch (err) {
      console.log(err);
      res.status(200).json({ status: false, message: "Server Error" });
    }
  }
  
}
module.exports = File;
