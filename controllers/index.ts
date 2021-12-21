import { Request, Response, NextFunction } from "express";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Parser } from "json2csv";
import { getCollections } from '../util/database'
const shasum = require("shasum");

const getHome = (_req: Request, res: Response, _next: NextFunction) => {
    res.render("home/homePage");
};

const getTable = async (req: Request, res: Response, _next: NextFunction) => {
    // @ts-expect-error
    const collections = getCollections(req.app.mongoClient)
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

const getDataAsCSV = async (
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    let data;
    
    // @ts-expect-error
    const collections = getCollections(req.app.mongoClient)
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

    const csvData = json2csvParser.parse(data as Document[]);
    const timestamp = Date.now();

    fs.writeFileSync(`resources/csv-${timestamp}.csv`, csvData);
    res.download(`resources/csv-${timestamp}.csv`, () =>
        unlinkFile(`resources/csv-${timestamp}.csv`)
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
            // @ts-expect-error
            const collections = getCollections(req.app.mongoClient)
            const timestamp = new Date().toISOString()
            const formData = new FormData()

            const sex = req.body.sexo
            const age = req.body.idade
            const level =  req.body.nivel_falta_de_ar
            const description = req.body.descricao || ""
            const audioFilePath = `resources/audio-${timestamp}.wav`

            fs.writeFileSync(audioFilePath, req.file.buffer)
            const stream = fs.createReadStream(audioFilePath)

            formData.append("audio", stream)
            formData.append("sexo", sex)
            formData.append("idade", age)
            formData.append("nivel_falta_de_ar", level)

            const url = process.env.SPIRA_API_URL || ""
            const spiraApiResponse = await axios.post(url, formData, {
                headers: formData.getHeaders()
            })

            let audio_name = req.file.originalname
            const audio_file = fs.readFileSync(audioFilePath)
            const sha1sum = shasum(audio_file)
            const result = spiraApiResponse.data.resultado

            const existing_audio = await collections.audio.findOne({"hash": `${sha1sum}`})
            if (!existing_audio) {
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

            unlinkFile(audioFilePath);

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

const unlinkFile = (fileName: string) => {
    fs.unlink(fileName, (err) => {
        if (err) throw err;
    });
};

export { getHome, getTable, getDataAsCSV, postPredict };
