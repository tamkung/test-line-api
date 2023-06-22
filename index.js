const express = require('express');
const { readdirSync } = require("fs");
const bodyParser = require('body-parser');
const cors = require('cors');

const middleware = require('@line/bot-sdk').middleware
const JSONParseError = require('@line/bot-sdk').JSONParseError
const SignatureValidationFailed = require('@line/bot-sdk').SignatureValidationFailed

const {
    addUser,
    deleteUser,
} = require('./app/webhook/controller');

const app = express();

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: `${process.env.CHANNEL_SECRET}`
}

const corsOptions = {
    origin: '*',
    credentials: true,
};

app.use(middleware(config))
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

readdirSync("./app/routes").map((route) => app.use("/api", require("./app/routes/" + route)));

app.get('/', (req, res) => {
    return res.send({
        status: "OK",
        message: "Hello Line API",
        written_by: "TWT",
        published_on: "22/06/2023",
    })
})

app.post('/webhook', (req, res) => {
    console.log(req.body.events)
    const events = req.body.events;
    const userId = events[0].source.userId;
    if (events[0].type === 'follow') {
        addUser(userId)
    } else if (events[0].type === 'unfollow') {
        deleteUser(userId)
    }
    res.json(req.body.events)
})

app.use((err, req, res, next) => {
    if (err instanceof SignatureValidationFailed) {
        res.status(401).send(err.signature)
        return
    } else if (err instanceof JSONParseError) {
        res.status(400).send(err.raw)
        return
    }
    next(err)
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});