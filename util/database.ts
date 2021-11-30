import * as mongodb from "mongodb";

let db: mongodb.Db;

const collections: any = {};

const MONGODB_URI = "mongodb://root:12345@localhost:27017/";

const DBNAME = "test";

const COLLECTION_NAME_INFERENCE = "inference";
const COLLECTION_NAME_AUDIO = "audio";

const MongoClient = new mongodb.MongoClient(MONGODB_URI);

const mongoConnect = async (callback: () => void) => {
    try {
        await MongoClient.connect();

        db = MongoClient.db(DBNAME);
        console.log("db created!");
        const inferenceCollection: mongodb.Collection = db.collection(
            COLLECTION_NAME_INFERENCE
        );
        const audioCollection: mongodb.Collection = db.collection(
            COLLECTION_NAME_AUDIO
        );
        collections.inference = inferenceCollection;
        collections.audio = audioCollection;
        callback();
    } catch (e) {
        console.error(e);
    }
};

// const mongoConnect = (callback: () => void) => {
//     MongoClient.connect(MONGODB_URI)
//     .then( client => {
//         console.log('Connected');
//         db = client.db();
//         callback();
//     })
//     .catch( error => {
//         console.log(error);
//         throw error;
//     })
// }

// const getDb = () => {
//     if(db){
//         return db;
//     }
//     throw 'No database found';
// }

export { mongoConnect, collections };
//
