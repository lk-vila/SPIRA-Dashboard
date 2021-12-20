import express from "express";
import favicon from "serve-favicon";
import path from "path";
import multer from "multer";
import { MongoClient } from "mongodb";
import {
    postPredict,
    getTable,
    getHome,
    getDataAsCSV,
} from "./controllers";

type AppContext = {
    mongoClient: MongoClient
}

function getApp ({ mongoClient }: AppContext) {
    const app = express();
    const upload = multer({ storage: multer.memoryStorage() });

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(favicon(path.join(__dirname, "assets", "favicon", "spira.ico")));

    // Sets EJS as view engine
    app.set("view engine", "ejs");
    app.set("views", "views");
    app.use(express.static(path.join(__dirname, "public")));

    // @ts-expect-error
    app.mongoClient = mongoClient;

    app.get("/",getHome);
    app.get("/table", getTable);
    app.get("/dump/:tableName", getDataAsCSV);
    app.post("/predict", upload.single("audio"), postPredict);

    return app
}

export { getApp };
