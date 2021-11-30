import express from 'express'
import favicon from 'serve-favicon'
import homeRoutes from './routers/homeRouters'
import path from 'path'
import { mongoConnect } from './util/database'

const app = express()
const port = process.env.PORT || 8000

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

app.use(favicon(path.join(__dirname, 'assets', 'favicon', 'spira.ico')))

// Sets EJS as view engine
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));

app.use(homeRoutes)

mongoConnect( () => {
    app.listen(port, () => console.log(`⚡️[server]: Server is running at https://localhost:${port}`))
})

