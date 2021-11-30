import { Router } from "express";
import { postPredict, getTable, getHome } from "../controllers/homeController";
import multer from "multer";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getHome);

router.get("/table", getTable);

router.post("/predict", upload.single("audio"), postPredict);

export default router;
