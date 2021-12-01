import * as mongodb from "mongodb";

export const collections: any = {};

const MONGODB_URI = "mongodb://root:12345@localhost:27017/";
const DBNAME = "test";
const COLLECTION_NAME_INFERENCE = "inference";
const COLLECTION_NAME_AUDIO = "audio";

export const mongoConnect = async (callback: () => void) => {
    try {
        const mongoClient = new mongodb.MongoClient(MONGODB_URI);
        await mongoClient.connect();

        const db = mongoClient.db(DBNAME);

        const inferenceCollection = db.collection(COLLECTION_NAME_INFERENCE);
        const audioCollection = db.collection(COLLECTION_NAME_AUDIO);

        collections.inference = inferenceCollection;
        collections.audio = audioCollection;

        callback();
    } catch (e) {
        console.error(e);
    }
};
