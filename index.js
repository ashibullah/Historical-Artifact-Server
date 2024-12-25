require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.listen(port, () => {
  console.log("Server is running on port: ", port);
})
const db_username = process.env.DB_USER;
const db_password = process.env.DB_PASS;

const uri = `mongodb+srv://${db_username}:${db_password}@cluster0.91k5x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Db and collection data

    const DB = client.db("Historical-Artifacts");
    const userColl = DB.collection("users");
    const artifactColl = DB.collection("artifacts");


    // Api Starts here 
    app.get("/artifacts", async (req,res)=>{
      const result = await artifactColl.find().toArray();
      res.send(result)
    })

    app.post("/artifacts/add", async(req ,res) =>{
      const artifact = req.body;
      try{
        const result = await artifactColl.insertOne(artifact);
        res.send('Successfully added artifact');
      }
      catch{
        res.status(401).send('error to add artifact')
      }
      

    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


run().catch(console.dir);
