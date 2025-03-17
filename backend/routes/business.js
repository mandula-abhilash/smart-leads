import express from "express";
import { fetchBusinesses } from "../controllers/businessController.js";

const router = express.Router();

router.get("/search", fetchBusinesses);

export default router;
