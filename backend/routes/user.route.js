import express from "express";
import { createUser, getUsers, deleteUser, getUserById, updateUserById } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.delete("/:id", deleteUser);
router.get("/profile/:id", getUserById);
router.put("/profile/:id", updateUserById);


export default router;
