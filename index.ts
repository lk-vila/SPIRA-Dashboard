import axios from 'axios'
import express from 'express'
import fs from 'fs'
import FormData from 'form-data'
import multer from 'multer'

const app = express()
const port = process.env.PORT || 80
const upload = multer({ storage: multer.memoryStorage()  })

app.get('/', () => console.log("Drake best wrapper"))

app.post('/predict', upload.single('audio_file'), async (req, res) => {
  
    const formData = new FormData()

    formData.append("audio", new Blob([req.file.buffer]))
    //formData.append("audio", req.body.file.buffer, req.body.file.originalname)
    formData.append("sexo", req.body.sexo)
    formData.append("idade", req.body.idade)
    formData.append("nivel_falta_de_ar", req.body.nivel_falta_de_ar)

    const spiraApiResponse = await axios.post("https://spira-api.herokuapp.com/predict", formData)
    
    res.status(200).json(`File uploaded`)
})

app.post('/predictv2', async (req, res) => {
  

    
    formData.append("audio", new Blob(, ))
    //formData.append("audio", req.body.file.buffer, req.body.file.originalname)
    formData.append("sexo", req.body.sexo)
    formData.append("idade", req.body.idade)
    formData.append("nivel_falta_de_ar", req.body.nivel_falta_de_ar)

    const spiraApiResponse = await axios.post("https://spira-api.herokuapp.com/predict", formData)
    
    res.status(200).json(`File uploaded`)
})

app.listen(port, () => console.log(`⚡️[server]: Server is running at https://localhost:${port}`))
