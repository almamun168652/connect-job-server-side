const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ywavnlw.mongodb.net/?retryWrites=true&w=majority`;

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

        const jobsCollection = client.db('jobDB').collection('jobs');
        const appliedCollection = client.db('jobDB').collection('applied');


        //      single job post
        app.post("/jobs", async (req, res) => {
            try {
                const job = req.body;
                const result = await jobsCollection.insertOne(job);
                res.send(result);
            } catch (error) {
                console.log(error)
            }
        });

        //      single job apply
        app.post("/applied", async (req, res) => {
            try {
                const appliedJob = req.body;
                const result = await appliedCollection.insertOne(appliedJob);
                res.send(result);

            } catch (error) {
                console.log(error)
            }
        });


        // updated apllicant number

        app.patch('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            const updateDoc = {
                $inc: {
                    applicantNumber: 1,
                },
            };

            const result = await jobsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // // update jobs
        // app.patch('/jobs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const updatedJob = req.body;

        //     const updateDoc = {
        //         $set: {
        //             ...updatedJob,
        //         },
        //     };
        //     const result = await jobsCollection.updateOne(filter, updateDoc);
        //     res.send(result);
        // });

        app.put("/jobs/:id", async (req, res) => {
            const id = req.params.id;
            const jobs = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateJobs = {
                $set: {
                    banner: jobs.banner,
                    title: jobs.title,
                    logo: jobs.logo,
                    jobCategory: jobs.jobCategory,
                    salleryStart: jobs.salleryStart,
                    salleryEnd: jobs.salleryEnd,
                    description: jobs.description,
                    deadline: jobs.deadline,
                },
            };
            const result = await jobsCollection.updateOne(
                filter,
                updateJobs,
                options
            );
            res.send(result);
        });


        //      all job get
        app.get("/jobs", async (req, res) => {
            try {
                const result = await jobsCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.log(error)
            }
        });

        // get single data for details
        app.get('/job/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await jobsCollection.findOne(query);
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        // get single data
        app.get('/jobs/:email', async (req, res) => {
            try {
                const email = req.params?.email;
                const query = { email: email }
                const result = await jobsCollection.find(query).toArray();
                res.send(result);
            } catch (err) {
                console.log(err)
            }
        })

        // delete my post jobs
        app.delete("/jobs/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await jobsCollection.deleteOne(query);
                res.send(result);
            } catch (err) {
                console.log(err);
            }
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get("/", (req, res) => {
    res.send("job is running...");
});

app.listen(port, () => {
    console.log(`connect job is Running on port ${port}`);
});