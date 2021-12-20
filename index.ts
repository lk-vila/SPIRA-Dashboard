import { getApp }  from './app'
import { MongoClient }  from "mongodb"

const PORT = process.env.PORT || 3491;
const MONGODB_URI = 'mongodb://localhost:27017/spira'

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