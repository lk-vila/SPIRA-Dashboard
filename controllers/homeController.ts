import { Request, Response, NextFunction } from "express";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { collections } from "../util/database";
import { ObjectId } from "mongodb";
const shasum = require("shasum");

const getHome = (req: Request, res: Response, next: NextFunction) => {
    res.render("home/homePage");
};

const getTable = async (req: Request, res: Response, next: NextFunction) => {
    const inferenceList = await collections.inference.find().toArray();
    res.render("home/table", {
        inferenceList: [inferenceList],
    });
};

const postPredict = async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
        try {
            const timestamp = Date.now().toString();
            const formData = new FormData();

            const sex = req.body.sexo;
            const age = req.body.idade;
            const level = req.body.nivel_falta_de_ar;

            fs.writeFileSync(`/tmp/${timestamp}.wav`, req.file.buffer);

            const stream = fs.createReadStream(`/tmp/${timestamp}.wav`);

            formData.append("audio", stream);
            formData.append("sexo", sex);
            formData.append("idade", age);
            formData.append("nivel_falta_de_ar", level);

            const spiraApiResponse = await axios.post(
                "https://spira-api-demo.herokuapp.com//predict",
                formData,
                {
                    headers: formData.getHeaders(),
                }
            );

            let original_name = req.file.originalname;
            const audio_file = await fs.readFileSync(`/tmp/${timestamp}.wav`);
            const sha1sum = shasum(audio_file);
            const result = spiraApiResponse.data.resultado;

            const existing_audio = await collections.audio.findOne({
                hash: `${sha1sum}`,
            });
            if (!existing_audio) {
                collections.audio.insertOne({
                    hash: `${sha1sum}`,
                    original_name: `${original_name}`,
                });
            } else {
                original_name = existing_audio.original_name;
            }

            collections.inference.insertOne({
                timestamp: `${timestamp}`,
                audio_name: `${original_name}`,
                sex: `${sex}`,
                age: `${age}`,
                level: `${level}`,
                result: `${result}`,
            });

            fs.unlink(`/tmp/${timestamp}.wav`, (err) => {
                if (err) throw err;
                //console.log(`/tmp/${timestamp}.wav was deleted`);
            });

            return res.status(200).json({ resultado: result });
        } catch (err) {
            console.log(err);
            return res.status(400).json("error : " + err);
        }
    }

    return res.status(400).json("No audio file sent");
};

export { getHome, getTable, postPredict };
