import { Router } from 'express'
import multer from 'multer'
import { getDrakeBestWrapper, postPredict, getTable, getHome } from '../controllers/homeController'

const router = Router()

const upload = multer({ storage: multer.memoryStorage() })

router.get('/', getHome)

router.get('/wrapper', getDrakeBestWrapper)

router.get('/table', getTable)

router.post('/predict', upload.single('audio'),  postPredict)

export default router