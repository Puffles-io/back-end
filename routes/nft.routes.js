const NFTController = require("../controllers/nft.controller");
const passport = require("passport");
const multer = require("multer");
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });
module.exports = (app) => {
  app.post(
    "/upload_v1",
    passport.authenticate("jwt", { session: false }),
    upload.single("file"),
    NFTController.upload_v1
  ),
    app.post(
      "/title",
      passport.authenticate("jwt", { session: false }),
      NFTController.title
    ),
    app.post(
      "/placeholder",
      passport.authenticate("jwt", { session: false }),
      upload.single("file"),
      NFTController.placeholder_image
    );
  app.post(
    "/metadata",
    passport.authenticate("jwt", { session: false }),
    upload.single("file"),
    NFTController.metadata
  );
  app.post(
    "/metadataUpload",
    passport.authenticate("jwt", { session: false }),
    NFTController.metadataUpload
  );
  app.get(
    "/get_nfts",
    passport.authenticate("jwt", { session: false }),
    NFTController.get_nfts
  );
  app.post(
    "/IPFSupload",
    passport.authenticate("jwt", { session: false }),
    NFTController.uploadtoIPFS
  );
  app.post("/whitelist_by_URI", NFTController.whitelistByURI);
  app.post(
    "/art_by_ID",
    passport.authenticate("jwt", { session: false }),
    NFTController.artByID
  );
  app.post(
    "/metadataUrls",
    passport.authenticate("jwt", { session: false }),
    NFTController.metadataUrls
  );
  app.post(
    "/sortTitle",
    passport.authenticate("jwt", { session: false }),
    NFTController.sortTitle
  );
  app.post(
    "/uploadThumbnail",
    passport.authenticate("jwt", { session: false }),
    NFTController.uploadThumbnail
  );
};
