import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../controllers/admin/user.admin.controller.js";

const router = express.Router();


// GET /api/admin/users
router.get("/", getAllUsers);
// GET /api/admin/users/user_id
router.get("/:id", getUserById);
// PUT /api/admin/users/user_id
// {
//   "email": "XXXX"
// }
router.put("/:id", updateUser);
// DELETE /api/admin/users/user_id
router.delete("/:id", deleteUser);

export default router;
