import { getApp }  from './app'
import { MongoClient }  from "mongodb"

const PORT = process.env.PORT || 8000;
const user = process.env.MONGO_INITDB_ROOT_USERNAME
const pass = process.env.MONGO_INITDB_ROOT_PASSWORD
const protocol = process.env.MONGO_PROTOCOL || "mongodb"
const at = process.env.MONGO_AT || "db:27017/"
const MONGODB_URI = `${protocol}://${user}:${pass}@${at}`;

async function main() {
    const mongoClient = await MongoClient.connect(MONGODB_URI);

    const app = getApp({ mongoClient })

    app.listen(PORT, () =>
        console.log(
            `⚡️ [server]: Server is running at https://localhost:${PORT}`
        )
    );
}

main()