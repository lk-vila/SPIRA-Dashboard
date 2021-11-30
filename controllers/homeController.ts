import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { Parser } from 'json2csv'
import { collections } from '../util/database'

const shasum = require('shasum')

const getHome = (req: Request , res: Response, next: NextFunction) => {
    res.render('home/homePage')
}

const getTable = async (req: Request , res: Response, next: NextFunction) => {
    const inferenceList = await collections.inference.find().toArray()
    //console.log(inferenceList)
    res.render('home/table', {
            inferenceList: inferenceList
        }
    );
}

const test = async (req: Request , res: Response, next: NextFunction) => { 
    const data = await collections.inference.find().toArray()

    res.send(data)
}

const getDataAsCSV = async (req: Request , res: Response, next: NextFunction) => {
    const json2csvParser = new Parser({ header: true })
    const data = await collections.inference.find({}).project({ _id : 0}).toArray()
    const csvData = json2csvParser.parse(data)
    const timestamp = Date.now()

    fs.writeFileSync(`resources/csv/${timestamp}.csv`, csvData)
    res.download(`resources/csv/${timestamp}.csv`, () => unlinkFile('csv', `${timestamp}.csv`))
}

const postPredict = async (req: Request , res: Response, next: NextFunction) => {
    //console.log(req.body)
    console.log(req.file)
    if (req.file && req.body.sexo && req.body.idade && req.body.nivel_falta_de_ar) {
        try {
            const timestamp = (new Date()).toISOString()
            const formData = new FormData()
            
            const sex = req.body.sexo
            const age = req.body.idade
            const level =  req.body.nivel_falta_de_ar


            fs.writeFileSync(`resources/audio/${timestamp}.wav`, req.file.buffer)
            const stream = fs.createReadStream(`resources/audio/${timestamp}.wav`)

            formData.append("audio", stream)
            formData.append("sexo", sex)
            formData.append("idade", age)
            formData.append("nivel_falta_de_ar", level)

            const spiraApiResponse = await axios.post("https://spira-api-demo.herokuapp.com//predict", formData, {
                headers: formData.getHeaders()
            })
            
            let original_name = req.file.originalname
            const audio_file = fs.readFileSync(`resources/audio/${timestamp}.wav`)
            const sha1sum = shasum(audio_file)
            const result = spiraApiResponse.data.resultado

            const existing_audio = await collections.audio.findOne({"hash": `${sha1sum}`})
            if(!existing_audio){
                collections.audio.insertOne({
                    hash: `${sha1sum}`,
                    original_name: `${original_name}`
                })
            } 
            else {
                original_name = existing_audio.original_name
            }
            

            collections.inference.insertOne({
                timestamp: `${timestamp}`,
                audio_name: `${original_name}`,
                sex: `${sex}`,
                age: `${age}`,
                level: `${level}`,
                result: `${result}`
            })
            
            
            unlinkFile('audio', `${timestamp}.wav`)

            return res.status(200).json({'resultado': result})
        } catch (err) {
            return res.status(400).json('error : '+err)
        }
    }

    return res.status(400).json('The request is incomplete')
}

const unlinkFile = (dir: String, fileName: String) => {
    fs.unlink(`resources/${dir}/${fileName}`, (err) => {
        if (err) throw err;
        //console.log(`resources/audio/${timestamp}.wav was deleted`);
    });
}

export { getHome, getTable, getDataAsCSV, postPredict, test }