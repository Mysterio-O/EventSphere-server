require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());



const client = new MongoClient(process.env.MONGO_URI, {
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

        const usersCollection = client.db('eventDB').collection('usersCollection');


        // users authentication api

        app.post('/register', async (req, res) => {
            const userInfo = req.body;
            console.log(userInfo);

            // Validate required fields
            if (!userInfo?.email || !userInfo?.password || !userInfo?.displayName || !userInfo?.accountCreated?.createdAt) {
                return res.status(400).send({ message: 'Bad Request: Missing required fields' });
            }

            // Validate email and password
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userInfo.email)) {
                return res.status(400).send({ message: 'Bad Request: Invalid email format' });
            }
            if (userInfo.password.length < 6) {
                return res.status(400).send({ message: 'Bad Request: Password must be at least 6 characters' });
            }
            // res.send('ok')

            const users = await usersCollection.find().toArray();
            for (const user of users) {
                if (user?.email === userInfo.email) {
                    return res.status(409).send({ message: 'Email already in use!' })
                }
            }

            try {
                const result = await usersCollection.insertOne(userInfo);
                console.log(result);
                res.status(201).send({ message: 'User Created!', result })
            } catch (error) {
                console.log(error);
                res.status(500).send({ message: 'Internal server error', error });
            }
        });

        app.post('/login', async (req, res) => {
            const loginInfo = req.body;
            console.log(loginInfo);
            const userEmail = loginInfo?.email;
            const userPassword = loginInfo?.password;
            let filter = {};
            if (userEmail) {
                filter = {
                    email: userEmail
                }
            }
            const user = await usersCollection.findOne(filter);
            console.log(user);

            if (!user) {
                return res.status(404).send({ message: 'No user found with the email address!' });
            }

            if (user?.password !== userPassword) {
                return res.status(401).send({ message: 'Unauthorized! Password didnt match' });
            } else {
                return res.status(200).send({ message: 'User successfully logged in using email and password' });
            }


        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
