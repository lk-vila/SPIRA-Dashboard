import { MongoClient } from "mongodb";

const DB_NAME = "spira";
const COLL_INFERENCE = "inference";
const COLL_AUDIO = "audio";

const getCollections = (mongoClient: MongoClient) => {
    const db = mongoClient.db(DB_NAME)

    return {
        inference: db.collection(COLL_INFERENCE),
        audio: db.collection(COLL_AUDIO)
    }
}

export { getCollections }
