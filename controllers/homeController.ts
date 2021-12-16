import { Request, Response, NextFunction } from "express";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Parser } from "json2csv";
import { collections } from "../util/database";
const shasum = require("shasum");

const getHome = (_req: Request, res: Response, _next: NextFunction) => {
    res.render("home/homePage");
};

const getTable = async (_req: Request, res: Response, _next: NextFunction) => {
    const inferenceList = await collections.inference.find().toArray();
    const audioList = await collections.audio.find().toArray();
    const inference_table_columns = [
        "Data",
        "Descrição",
        "Resultado",
        "Sexo",
        "Idade",
        "Nível falta de ar",
        "SHA-1 do áudio",
    ];
    const audio_table_columns = [
        "Data da primeira submissão",
        "Nome original do áudio",
        "Nome na última submissão",
        "SHA-1",
    ];

    res.render("home/table", {
        inferenceList: inferenceList,
        audioList: audioList,
        inference_table_columns: inference_table_columns,
        audio_table_columns: audio_table_columns,
    });
};

const test = async (_req: Request, res: Response, _next: NextFunction) => {
    const data = await collections.inference.find().toArray();

    res.send(data);
};

const getDataAsCSV = async (
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    let data;
    const tableName = req.params.tableName;
    const json2csvParser = new Parser({ header: true });

    if (tableName === "inference") {
        data = await collections.inference
            .find({})
            .project({ _id: 0 })
            .toArray();
    } else if (tableName === "audio") {
        data = await collections.audio.find({}).project({ _id: 0 }).toArray();
    }

    const csvData = json2csvParser.parse(data);
    const timestamp = Date.now();

    fs.writeFileSync(`resources/csv/${timestamp}.csv`, csvData);
    res.download(`resources/csv/${timestamp}.csv`, () =>
        unlinkFile("csv", `${timestamp}.csv`)
    );
};

const postPredict = async (req: Request, res: Response, next: NextFunction) => {
    if (
        req.file &&
        req.body.sexo &&
        req.body.idade &&
        req.body.nivel_falta_de_ar
    ) {
        try {
            const timestamp = (new Date()).toISOString()
            const formData = new FormData()
            
            const sex = req.body.sexo
            const age = req.body.idade
            const level =  req.body.nivel_falta_de_ar
            var description = ""

            if(req.body.descricao) {
                description = req.body.descricao
            }

            fs.writeFileSync(`resources/audio/${timestamp}.wav`, req.file.buffer)
            const stream = fs.createReadStream(`resources/audio/${timestamp}.wav`)

            formData.append("audio", stream)
            formData.append("sexo", sex)
            formData.append("idade", age)
            formData.append("nivel_falta_de_ar", level)

            // const spiraApiResponse = await axios.post("https://spira-api-demo.herokuapp.com/predict", formData, {
            const spiraApiResponse = await axios.post("http://127.0.0.1:5000/predict", formData, {
                headers: formData.getHeaders()
            })
            
            let audio_name = req.file.originalname
            const audio_file = fs.readFileSync(`resources/audio/${timestamp}.wav`)
            const sha1sum = shasum(audio_file)
            const result = spiraApiResponse.data.resultado

            const existing_audio = await collections.audio.findOne({"hash": `${sha1sum}`})
            if(!existing_audio) {
                collections.audio.insertOne({
                    date: `${timestamp}`,
                    original_name: `${audio_name}`,
                    recent_name: `${audio_name}`,
                    hash: `${sha1sum}`,
                });
            } else if (existing_audio.recent_name !== audio_name) {
                collections.audio.updateOne(
                    { hash: `${sha1sum}` },
                    { $set: { recent_name: `${audio_name}` } }
                );
            }

            collections.inference.insertOne({
                timestamp: `${timestamp}`,
                description: `${description}`,
                sex: `${sex}`,
                age: `${age}`,
                level: `${level}`,
                audio_hash: `${sha1sum}`,
                result: `${result}`,
            });

            unlinkFile("audio", `${timestamp}.wav`);

            if (req.body.isJSON && req.body.isJSON.toLowerCase() === "true") {
                return res.status(200).json({ resultado: result });
            }

            return res.status(200).render("home/result", { result: result });
        } catch (err: any) {
            return res.status(400).json({ error: String(err) });
        }
    }

    return res.status(400).json({ error: "No audio file sent" });
};

const unlinkFile = (dir: String, fileName: String) => {
    fs.unlink(`resources/${dir}/${fileName}`, (err) => {
        if (err) throw err;
        //console.log(`resources/audio/${timestamp}.wav was deleted`);
    });
};

export { getHome, getTable, getDataAsCSV, postPredict, test };
