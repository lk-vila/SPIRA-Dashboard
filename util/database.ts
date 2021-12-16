const { MongoClient } = require("mongodb");

const collections: any = {};

const MONGODB_URI = "mongodb://root:12345@localhost:27017/";
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
