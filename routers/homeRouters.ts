import { Router } from 'express'
import multer from 'multer'
import { getDrakeBestWrapper, postPredict, getTable } from '../controllers/homeController'

const router = Router()

const upload = multer({ storage: multer.memoryStorage() })

router.get('/wrapper', getDrakeBestWrapper)

router.get('/table', getTable)

router.post('/predict', upload.single('audio_file'),  postPredict)

export default router