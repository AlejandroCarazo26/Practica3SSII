import { Router } from "express";
import { getDB } from "./BDClase";
import { ObjectId } from "mongodb";


const router = Router();
const coleccion = () => getDB().collection("Clase1");

router.get("/", async (req, res) =>{
    try{
        
        const page = Number(req.query?.page) || 1;
        const limit = Number(req.query?.limit) || 25;
        const skip = (page-1) * limit;

        //const queryYear = req.query?.year;
        //const newer = req.query.newer;
        //const publicationCountry = req?.query.country;

        //const albums = await coleccion().find(queryYear? { year: queryYear} : {}).toArray();
        //const albums = await coleccion().find(newer? { year: {$gt : newer}} : {}).toArray();
        //const albums = await coleccion().find(publicationCountry? { publicationCountry: {$gt : publicationCountry}} : {}).toArray();
        
        const albums = await coleccion().find().sort({year: 1}).skip(skip).limit(limit).toArray();
        res.json({
            info:{
                limit: limit,
                page: page
            },
            results: albums
        });
    }
    catch(err){
        res.status(404).json({error: "No hay maní"})
    }
});

router.post("/", async (req, res) =>{
    try{
        const result = await coleccion().insertOne(req.body);
        const idCreado = result.insertedId;
        const resultObject = await coleccion().findOne({_id: idCreado});
        res.status(201).json({
            mongoAck: result, 
            mongoObject: resultObject
        });
    }
    catch(err){
        res.status(404).json({error: "No has creado na"})
    }
});


router.post("/many", async(req, res) =>{
    try{
        const result = await coleccion().insertMany(req.body.albums);
        res.status(201).json(result);
    }
    catch(err){
        res.status(404).json({error: "No has creado na"})
    }
})


router.get("/:id", async(req, res)=>{
    try{
        const album = await coleccion().findOne({_id: new ObjectId(req.params.id)});
        album ? res.json(album) : res.status(404).json({message: "No se ha encontrado ningun album con este ID"})
        res.json(album);
    }
    catch(err){
        res.status(404).json({error: "La liaste"})
    }
});


router.put("/:id", async(petision, respuesta)=>{
    try{
        const result = await coleccion().updateOne({_id: new ObjectId(petision.params.id)}, {$set : petision.body})
        respuesta.json(result);
    }

    catch(err){
        respuesta.status(404).json({error: "No se ha actualizao na"})
    }
});


router.delete("/:id", async(req, res)=>{
    try{
        const result = await coleccion().deleteOne({_id: new ObjectId(req.params.id)});

        result && res.status(204).json({message: "Objeto con id: " + req.params.id + " se ha eliminado"});
    }
    
    catch(err){
        res.status(404).json({error: "No se ha eliminao na"})
    }
    
})


export default router;