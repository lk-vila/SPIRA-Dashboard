const { MongoClient } = require("mongodb");

const collections: any = {};

const user = process.env.MONGO_INITDB_ROOT_USERNAME
const pass = process.env.MONGO_INITDB_ROOT_PASSWORD
const protocol = process.env.MONGO_PROTOCOL || "mongodb"
const at = process.env.MONGO_URL || "db:27017/"
const MONGODB_URI = `${protocol}://${user}:${pass}@${at}`;
const DBNAME = "test";
const COLLECTION_NAME_INFERENCE = "inference";
const COLLECTION_NAME_AUDIO = "audio";

const mongoConnect = async (callback: () => void) => {
    try {
        const connection = await MongoClient.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            wtimeoutMS: 1000,
        });

        const db = connection.db(DBNAME);

        const inferenceCollection = db.collection(COLLECTION_NAME_INFERENCE);
        const audioCollection = db.collection(COLLECTION_NAME_AUDIO);

        collections.inference = inferenceCollection;
        collections.audio = audioCollection;

        callback();
    } catch (e) {
        console.error(e);
    }
};

export { mongoConnect, collections };
