import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("All goods !");
});

export default router;
