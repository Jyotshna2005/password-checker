const express = require("express");
const router = express.Router();
const {
  checkPassword,
  getHistory,
  updateHistory,
  replaceHistory
} = require("../controllers/passwordController");

router.post("/check", checkPassword);
router.get("/history", getHistory);
router.patch("/history/:id", updateHistory);
router.put("/history/:id", replaceHistory);

module.exports = router;
