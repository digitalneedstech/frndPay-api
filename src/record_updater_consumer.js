const AWS = require('aws-sdk');
const {Consumer} = require('sqs-consumer');

// Configure the region
AWS.config.update({region: 'us-east-1'});

const queueUrl = "SQS_QUEUE_URL";


const admin = require('firebase-admin');
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
// Configure Nodemailer to user Gmail

function updateRecordInDB(message) {
    let db = admin.firestore();
    const data = await db.collection("users").where("subscriptionDetails.planId", '==', message.planId);
    const userInfo=data[0];
    await db.collection("users").doc(message.userId).set(userInfo);
    await db.collection("users").doc(message.userId)
    .collection("plans").doc(message.planId).collection("subscriptions")
    .doc(message.planId).set({
        "status": message.status
    }, SetOptions.merge);
    request({
        headers: {
            "Authorization": req.headers["authorization"],
            "Content-Type": "application/json"
        },
        uri: 'http://localhost:3000/notification',
        method: 'POST',
        body: {
            "token":userInfo.token,
            "message":"Your Subscription has moved to "+message.status +" status"
        },
    }, function (err, response, body) {
        var bodyValues = JSON.parse(body);
        res.status(response.statusCode).send(bodyValues);
    });
}

// Create our consumer
const app = Consumer.create({
    queueUrl: queueUrl,
    handleMessage: async (message) => {
        updateRecordInDB(message);
    },
    sqs: new AWS.SQS()
});

app.on('error', (err) => {
    console.error(err.message);
});

app.on('processing_error', (err) => {
    console.error(err.message);
});

console.log('Emails service is running');
app.start();
