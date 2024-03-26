const express = require("express");
const router = express.Router();
const passport = require("passport");
const File = require("../controllers/file.controller");
router.post(
  "/urlappend",
  passport.authenticate("jwt", { session: false }),
  File.prototype.URLAppend
);
module.exports = router;
