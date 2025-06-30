require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


const SECRET_KEY = process.env.JWT_SECRET


const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


function verifyTokenFromCookie(req, res, next) {
    const token = req.cookies['auth-token'];
    if (!token) return res.status(401).send({ message: 'Unauthorized: No token' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).send({ message: 'Forbidden: Invalid token' });
    }
}



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        const usersCollection = client.db('eventDB').collection('usersCollection');

        const eventCollection = client.db("eventDB").collection('eventCollection');

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
            }
            const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '2h' });

            res.cookie('auth-token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 2 * 60 * 60 * 1000 // 2 hours
            });

            res.status(200).send({
                message: 'Login successful',
                user: {
                    email: user.email,
                    name: user.displayName,
                    photoURL: user.photoURL
                }
            });


        });

        app.get('/user/profile', verifyTokenFromCookie, async (req, res) => {
            const user = await usersCollection.findOne({ email: req.user.email });
            res.send(user);
        });

        app.post('/logout', (req, res) => {
            res.clearCookie('auth-token', {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict'
            });
            res.send({ message: 'Logged out successfully' });
        });


        // event apis

        app.post('/addEvent', async (req, res) => {
            try {
                const eventInfo = req.body;
                console.log(eventInfo);
                if (eventInfo) {
                    const result = await eventCollection.insertOne(eventInfo);
                    console.log(result);
                    if (result?.acknowledged || result?.insertedId) {
                        return res.status(201).send({ message: 'New event added successfully!', result })
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.send("error adding new event!", error)
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
