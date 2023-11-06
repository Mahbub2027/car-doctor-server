const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.port || 5000;

//middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l5wiuzk.mongodb.net/?retryWrites=true&w=majority`;

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

        const serviceCollection = client.db('carDoctor').collection('services');
        const bookCollection = client.db('carDoctor').collection('bookings');

        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;

            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                projection: { service_id: 1, title: 1, price: 1, img: 1},
              };

            const query = {_id : new ObjectId(id)};
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })


        app.get('/services', async(req, res)=>{
            const cursor = serviceCollection.find();
            const result= await cursor.toArray();
            res.send(result);
        })

        // insert checkout book 
        app.get('/bookings', async(req, res)=>{
            console.log(req.query.email);
            let query = {};
            if(req.query?.email){
                query= {email: req.query.email}
            }
            const result = await bookCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/bookings', async(req, res)=>{
            const booking = req.body;
            console.log(booking);
            const result = await bookCollection.insertOne(booking);
            res.send(result);
        })

        app.delete('/bookings/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await bookCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/bookings/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updateBooking = req.body;
            console.log(updateBooking);
            const updateDoc = {
                $set:{
                    status: updateBooking.status
                }
            }
            const result = await bookCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send("doctor is running");

})

app.listen(port, () => {
    console.log(`car-doctor is running ${port}`)
})