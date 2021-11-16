import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import FormData from 'form-data'

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
    const formData = new FormData()
    
    if (req.file) {
        // TODO: Upload file to Inference API
        // formData.append("audio", req.file.buffer)
        formData.append("sexo", req.body.sexo)
        formData.append("idade", req.body.idade)
        formData.append("nivel_falta_de_ar", req.body.nivel_falta_de_ar)
    
        const spiraApiResponse = await axios.post("https://spira-api-demo.herokuapp.com/predict", formData)
        
        return res.status(200).json(`File uploaded`)
    }

    return res.status(400).json('No audio file sent')
}

export { getDrakeBestWrapper, getHome, getTable, postPredict }