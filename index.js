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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Db and collection data

    const DB = client.db("Historical-Artifacts");
    const userColl = DB.collection("users");
    const artifactColl = DB.collection("artifacts");


    // Api Starts here 
    app.get("/artifacts", async (req, res) => {
      const result = await artifactColl.find().toArray();
      res.send(result)
    })

    app.get('/', async (req, res) => {
      res.send("Server is running okay");
    })

    app.get('/artifacts/featured', async (req, res) => {
      try {
        const query =[

          {
            $addFields: {
              likeCount: { $size: "$likedBy" } // 
            }
          },
          {
            $limit: 6
          },
          {
            $sort: { likeCount: -1 }
          }
        ]
        const result = await artifactColl.aggregate(query).toArray();

        res.status(200).json(result);
      } catch (error) {
        console.error("Error fetching sorted artifacts:", error);
        res.status(500).json({ message: "Server error", error });
      }
    })


    app.get("/artifacts/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      try {
        const query = { _id: new ObjectId(id) };
        const result = await artifactColl.findOne(query);
        res.send(result)
      }
      catch (err) {
        req.status(500).send("cant find Data")
      }
    })
    app.get("/artifacts/user/:email", async (req, res) => {
      const email = req.params.email;
      try {
        const query = {
          "addedBy.email": email
        }
        const result = await artifactColl.find(query).toArray()
        res.send(result);
      } catch (err) {
        req.status(500).send("cant find Data")
      }
    })



    app.patch("/like/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.body.email;
      console.log(id, email)
      try {
        const query = { _id: new ObjectId(id) };
        const target = {
          $addToSet:
          {
            likedBy: email
          }
        }
        const result = await artifactColl.updateOne(query, target);

        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: 'Product not found or already liked' });
        }

        return res.status(200).json({ message: 'Product liked successfully' });
      }

      catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
      }
    })


    app.patch("/unlike/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.body.email;
      try {
        const query = { _id: new ObjectId(id) };
        const target = {
          $pull:
          {
            likedBy: email
          }
        }
        const result = await artifactColl.updateOne(query, target);

        if (result.modifiedCount === 0) {
          return res.status(404).json({ message: 'Product not found or already liked' });
        }

        return res.status(200).json({ message: 'Product unliked successfully' });
      }

      catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
      }
    })

    app.post("/artifacts/add", async (req, res) => {
      const artifact = req.body;
      try {
        const result = await artifactColl.insertOne(artifact);
        res.send('Successfully added artifact');
      }
      catch {
        res.status(401).send('error to add artifact')
      }

    })
    app.put("/update/artifact/:id", async (req, res) => {
      const id = req.params.id;
      const artifact = req.body;
      const query = { _id: new ObjectId(id) }
      const options = { upsert: false };
      const updateDoc = { $set: artifact };
      try {
        const result = await artifactColl.updateOne(query, updateDoc, options);
        if (result.matchedCount === 0) {
          return res.status(404).send('Artifact not found');
        }
        res.send('Successfully Updated artifact');
      }
      catch {
        res.status(401).send('error to add artifact')
      }
    })


    app.get('/artifacts/likedBy/:email', async (req, res) => {
      const email = req.params.email;
      const query = { likedBy: email };
      try {

        const result = await artifactColl.find(query).toArray();
        res.send(result);

      } catch (err) {
        return res.status(500).json({ message: 'Server error', error: err });
      }
    })

    app.delete('/artifacts/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      try {
        const result = await artifactColl.deleteOne(query);

        if (result.deletedCount === 1) {
          res.status(200).send("Artifact Deleted")
        } else {
          res.status(404).send("Artifact not found");
        }
      } catch (error) {
        console.error("Error deleting artifact:", error);
        res.status(500).json({ message: "Server error", error });
      }
    });

    

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


run().catch(console.dir);
