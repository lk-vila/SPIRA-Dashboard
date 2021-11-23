import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

const getDrakeBestWrapper = (req: Request , res: Response, next: NextFunction) => {
    res.send('Drake best wrapper')
}

const getHome = (req: Request , res: Response, next: NextFunction) => {
    res.render('home/homePage')
}

const getTable = (req: Request , res: Response, next: NextFunction) => {
    res.render('home/table')
}

const postPredict = async (req: Request , res: Response, next: NextFunction) => {
    if (req.file) {
        try {
            const file_name = Date.now().toString()
            const formData = new FormData()

            fs.writeFileSync(`resources/audio/${file_name}.wav`, req.file.buffer)
            
            formData.append("audio", fs.createReadStream(`resources/audio/${file_name}.wav`))
            formData.append("sexo", req.body.sexo)
            formData.append("idade", req.body.idade)
            formData.append("nivel_falta_de_ar", req.body.nivel_falta_de_ar)

            const spiraApiResponse = await axios.post("https://spira-api-demo.herokuapp.com//predict", formData, {
                headers: formData.getHeaders()
            })

            fs.unlink(`resources/audio/${file_name}.wav`, (err) => {
                if (err) throw err;
                //console.log(`resources/audio/${file_name}.wav was deleted`);
            });

            return res.status(200).json({'resultado': spiraApiResponse.data.resultado})
        } catch (err) {
            return res.status(400).json('error : '+err)
        }
    }

    return res.status(400).json('No audio file sent')
}

export { getDrakeBestWrapper, getHome, getTable, postPredict }