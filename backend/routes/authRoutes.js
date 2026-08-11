const express = require("express");
const { signup, login, logout, profile } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/register", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", profile);

module.exports = router;
