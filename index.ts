import axios from 'axios'
import express from 'express'
import homeRoutes from './routers/homeRouters'
import path from 'path'

const app = express()
const port = process.env.PORT || 80

// Sets EJS as view engine
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));

app.use(homeRoutes)

app.listen(port, () => console.log(`⚡️[server]: Server is running at https://localhost:${port}`))
