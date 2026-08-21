import { Router } from "express";
import { StorageController } from "./storage.controller";

const router = Router();
const controller = new StorageController();

router.get("/photos", controller.getPhotos);

export default router;