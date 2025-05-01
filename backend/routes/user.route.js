import express from "express";
import { createUser, getUsers, deleteUser, getProviders } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.delete("/:id", deleteUser);
router.get("/providers", getProviders); // GET /api/providers


export default router;
