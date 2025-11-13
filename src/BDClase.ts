import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client: MongoClient;
let db: Db;

export const connectToMongoDB = async(): Promise<void> => {
    try{
        
        const urlMongo = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.CLUSTER}.jgonzys.mongodb.net/?appName=${process.env.CLUSTER}`;
        client = new MongoClient(urlMongo);
        await client.connect();
        db = client.db("DBClaseInicial");
        console.log("Conectado a mongo Maní!");


    }catch(err){
        console.error("Error al conectar a Mongo");
        process.exit(1);
    }
};

export const getDB = () : Db => db;
