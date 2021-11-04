import express from 'express'

const app = express()
const port = 8000

app.get('/', () => console.log("Drake best wrapper"))

app.listen(port, () => console.log(`⚡️[server]: Server is running at https://localhost:${port}`))
