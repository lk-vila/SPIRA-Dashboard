import { Router } from 'express'
import { postPredict, getTable, getHome, getDataAsCSV, test } from '../controllers/homeController'
import multer from 'multer'

const router = Router()

const upload = multer({ storage: multer.memoryStorage() })

router.get('/', getHome)

router.get('/test', test)

router.get('/table', getTable)

router.get('/dump', getDataAsCSV)

router.post('/predict', upload.single('audio'),  postPredict)

export default router

