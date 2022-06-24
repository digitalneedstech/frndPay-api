const bodyParser = require("body-parser");
var express = require("express");
var app = express();
const request = require('request');
const {RAZORPAY_API_URL, SUBSCRIPTIONS, PAYOUTS, PLANS} = require('./commons/commons');
const crypto = require('crypto');
const {stat} = require("fs");
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
/*Set up Admin API for Firebase*/
const admin = require('firebase-admin');
const AWS = require('aws-sdk');

// Configure the region
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const queueUrl = "SQS_QUEUE_URL";
// Define path to secret key generated for service account
const serviceAccount = {
    "type": "service_account",
    "project_id": "frnd-9c84f",
    "private_key_id": "6497aa311e8b77c9950547d8d503f9c9c094559e",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLdXJrK88T7B4v\ne3EzbR0kVl5/3FQHPnrkT6FnhQXWUT70WWmG6SOtEQsjHKnmxEzxyqMGiV8/7rnV\n5+wNCbEQqbuYe0mm7yD6htOZN+KR8Y35ON4FhkHud321D9+DdXmhqS2zMECsGoPW\nTtOE0+NKQMjb59WHpMBZSdt/dsyPJOaM/vuLpQCB3B/Ac0fNi8VqwXozubahYZwD\n+1GY/kzvQKavReJfH9UnaR43Tqe4MauqZ8II0JENJzvyFGgiTYqTeZU8yCJc+10Q\nyYuXHiVM9/MsL/X/xMJvDpshi2W8tqrlOFyfnWzQpkyRSVK8EG7OfV1JfID9KbHf\nXSR+gqIfAgMBAAECggEAN4h3EomCnA12r78hxsehjKmGYZ/hz5heMrMJexfz3+uN\nI2TESO6ZrkNYptzMAxDRb62/kaktNmYSkzAaXfSnP8UUTypXkBj1B2yFlOyMCwnD\nlqLO9vMOS+iRhzot59PIvzdOIfqprFAQbA5X7YloIHxOVreQsNVnKvfd0Yy7iNYs\nUUDuvS+hmO4Ew+hcJEn7ce4x1/2l904L3XVD+lYJvVeYisdyIHdda5OjYRX0x7F9\n0zAVMYhfxxicTkcK747t02zBVy7aMI2IHJM8R5t1305IbXkuEqHafs6Tjx07sReS\n/vopPirZ491FbDbB4IrBjRYf/+K5K2wqdy73Xgu3AQKBgQD9gh3Riy7INJmQfDhb\nAkKeblsQVj7T7oaZDdFkvW5EwA7s5Y/KrwJ8G9lwyI5XFLIKENw16HNqPzEgBLs/\n05HjRbw2EPC8UeL6+ftXpTQ6phKQbGvT+kYycH+LjP4Ige+Sx/yWa1CQT8HCEAJ0\nvNpt4M7XjTIZjeHiVduoUgmaxQKBgQDNdWUOjRQ718xwU5zth2uAzgIQ7qkrNutz\n6chb6zgLkhg5hmQpb2gGkfUhdUIQGZAJ8qX9ODZvZhz8r+8B+S6jmzZvJL2BEk/m\nwMaFE+vI1nboE4zIjNKjrV62T54ncXUPjFRi78bK4/BQqoxGiVWSrTp4mP0bqzJu\nZst3aGvnkwKBgHbKoBpu9A8QxtzzuJy85GbFI5r2Lx60aRITbYmdUqyYquXLdKPv\nemSZ0DyPXlPj+MHKwMXqFRs2XVi5ntz70SMErHtRWN2GKayds2+QlHbfF1fh1m1Q\nm9BK8xl7ihaGfLL1T6FUzD2zggHj6qK1VE2kyIgtO8rJt42N2g530tRZAoGBAK8+\nUYr+xGJip2qrtq9XEVfU3yhIGJzWhC/jGNVmJPChlO4D9gztjEIGXppCJK4Mz7Hc\neL4qIywTYegZu/fn7WL48Y4NPWIJF4PPq8Q4gKVWYCeE/VDV5JhdOOqxsEkeWeWA\nIT4eHGZT01dKkMldPFMWVEgm3cSq2iIWpbdcpqTnAoGBAJ4lyJ7xJ2LOlsqNASk8\nUD5/bcvu10oPjydvqIUwh32XgXMzUyFLtgjwXQsnlLftaOhp6I/YTBhR3jsCPlEL\nhEqLYUpwgWalN45oFsJdkIOdpzmrqdvRAe5ptyS9Wtn+5eCxe+NoX5sAfitcvd3U\nfgwAXqWUnka0gL5hMt6vENxL\n-----END PRIVATE KEY-----\n",
    "client_email": "frnd-backend@frnd-9c84f.iam.gserviceaccount.com",
    "client_id": "112835057993654864522",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/frnd-backend%40frnd-9c84f.iam.gserviceaccount.com"
};
// Initialize the app
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
// app.disable('x-powered-by')

// app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World'));
// app.use(bodyParser);
// Insecure routes
// Encrypting text
function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {iv: iv.toString('hex'), encryptedData: encrypted.toString('hex')};
}

// Decrypting text
function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
app.post('/encrypt', function (req, res) {
    var user = req.body;
    var encryptResponse = encrypt(user.name);
    return res.status(200).send(encryptResponse);
});

app.post('/decrypt', function (req, res) {
    var user = req.body;
    console.log(user);
    var decryptResponse = decrypt(user);
    return res.send({"value": decryptResponse});
});


app.post('/payout', async function (req, res, next) {
    request({
        headers: {
            "Authorization": req.headers["authorization"],
            "Content-Type": "application/json"
        },
        uri: RAZORPAY_API_URL + PAYOUTS,
        body: req.body,
        method: 'POST'
    }, function (err, response, body) {
        var bodyValues = JSON.parse(body);
        res.status(response.statusCode).send(bodyValues);
    });
});

app.post('/user/:userId/payout/:id', async function (req, res, next) {
    let db = admin.firestore()
    console.log(req.body.id)
    // Depending on your schema, save data by specifying the collection name, //document name and data contents as follows
    await db.collection("users").doc(req.params["userId"]).collection("payouts").doc(req.params["id"]).set(req.body);
    res.status(200).send({"success": true});
});

app.get('/user/:userId/payout/:id', async function (req, res, next) {
    let db = admin.firestore()
    console.log(req.body.id)
    // Depending on your schema, save data by specifying the collection name, //document name and data contents as follows
    const data = await db.collection("users").doc(req.params["userId"]).collection("payouts").doc(req.params["id"]).get();
    if (data.empty) {
        res.status(404).send({"message": "Not Found"});
    } else {
        res.status(200).send({"body": data[0]});
    }
});


app.post('/plan', async function (req, res, next) {
    request({
        headers: {
            "Authorization": req.headers["authorization"],
            "Content-Type": "application/json"
        },
        uri: RAZORPAY_API_URL + PLANS,
        body: req.body,
        method: 'POST'
    }, function (err, response, body) {
        var bodyValues = JSON.parse(body);
        res.status(response.statusCode).send(bodyValues);
    });
});


app.post('/user/:userId/plan/:id', async function (req, res, next) {
    let db = admin.firestore()
    console.log(req.body.id)
    // Depending on your schema, save data by specifying the collection name, //document name and data contents as follows
    await db.collection("users").doc(req.params["userId"]).collection("plans").doc(req.params["id"]).set(req.body);
    res.status(200).send({"success": true});
});


app.get('/user/:userId/plan/:id', async function (req, res, next) {
    let db = admin.firestore()
    console.log(req.body.id)
    // Depending on your schema, save data by specifying the collection name, //document name and data contents as follows
    const data = await db.collection("users").doc(req.params["userId"]).collection("plans").doc(req.params["id"]).get();
    if (data.empty) {
        res.status(404).send({"message": "Not Found"});
    } else {
        res.status(200).send({"body": data[0]});
    }
});


app.get('plan/:id/', function (req, res, next) {
    request({
        headers: {
            "Authorization": req.headers["authorization"],
            "Content-Type": "application/json"
        },
        uri: RAZORPAY_API_URL + PLANS + "/" + req.params["id"],
        method: 'GET'
    }, function (err, response, body) {
        var bodyValues = JSON.parse(body);
        res.status(response.statusCode).send(bodyValues);
    });
});

app.post('/subscription', async function (req, res, next) {
    request({
        headers: {
            "Authorization": req.headers["authorization"],
            "Content-Type": "application/json"
        },
        uri: RAZORPAY_API_URL + SUBSCRIPTIONS,
        body: req.body,
        method: 'POST'
    }, function (err, response, body) {
        var bodyValues = JSON.parse(body);
        var status = bodyValues.status;
        if (response.statusCode == 200 && status != "Active") {
            var count = 0;
            triggerRecursiveCall(response, headers, bodyValues.id, count);
        } else if (response.statusCode == 200 && status == "Active") {
            cancelSubscriptionById(req, res, next);
        } else {
            res.status(response.statusCode).send(bodyValues);
        }
    });
});

app.post('/user/:userId/plan/:planId/subscription/:subscriptionId', async function (req, res, next) {
    let db = admin.firestore()
    console.log(req.body.id)
    // Depending on your schema, save data by specifying the collection name, //document name and data contents as follows
    const value = await db.collection("users").doc(req.params["userId"]).collection("plans").doc(req.params["planId"]).update(req.body);
    res.status(200).send({"success": true});
});

app.get('/subscription/:id', async function (req, res, next) {
    request({
        headers: {
            "Authorization": req.headers["authorization"],
            "Content-Type": "application/json"
        },
        uri: RAZORPAY_API_URL + SUBSCRIPTIONS + "/" + req.params["id"],
        method: 'GET'
    }, function (err, response, body) {
        var bodyValues = JSON.parse(body);
        res.status(response.statusCode).send(bodyValues);
    });
});


app.get('/user/:userId/plan/:planId/subscription/:subscriptionId', async function (req, res, next) {
    let db = admin.firestore()
    console.log(req.body.id)
    // Depending on your schema, save data by specifying the collection name, //document name and data contents as follows
    const data = await db.collection("users").doc(req.params["userId"]).collection("plans").doc(req.params["planId"]).collection("subscriptions").doc(req.params["subscriptionId"]).get();
    if (data.empty) {
        res.status(404).send({"message": "Not Found"});
    } else {
        res.status(200).send({"body": data[0]});
    }
});
function triggerRecursiveCall(response, headers, id, count) {
    var status = response.status;

    if (status != "Active" && count < 3) {
        request({
            headers: {
                "Authorization": req.headers["authorization"],
                "Content-Type": "application/json"
            },
            uri: RAZORPAY_API_URL + SUBSCRIPTIONS + "/" + id,
            method: 'GET'
        }, function (err, receivedResponse, body) {
            var bodyValues = JSON.parse(body);
            if (bodyValues.status != "Active") {
                count++;
                triggerRecursiveCall(response, headers, id)
            }
        });
    } else if (status != "Active" && count < 3) {
        response.statusCode(400).send({"errorMessage": "The Cards is not getting auto debited because of an error."})
    } else if (status == "Active") {
        request({
            headers: {
                "Authorization": req.headers["authorization"],
                "Content-Type": "application/json"
            },
            uri: RAZORPAY_API_URL + SUBSCRIPTIONS + "/" + id + '/cancel',
            method: 'POST'
        }, function (err, receivedResponse, body) {
            var bodyValues = JSON.parse(body);
            if (receivedResponse.statusCode == 200) {
                response.status(receivedResponse.statusCode).send(bodyValues);
            }
        });
    }
}


app.delete('/subscription/:id/cancel', cancelSubscriptionById);
function cancelSubscriptionById() {
    return function (req, res, next) {
        request({
            headers: {
                "Authorization": req.headers["authorization"],
                "Content-Type": "application/json"
            },
            uri: RAZORPAY_API_URL + SUBSCRIPTIONS + "/" + req.params["id"] + "/cancel",
            body: req.body,
            method: 'POST'
        }, function (err, response, body) {
            var bodyValues = JSON.parse(body);
            res.status(response.statusCode).send(bodyValues);
        });
    };
}


app.post('/user/:userId/plan/:planId/pendingSubscription/:subscriptionId', async function (req, res, next) { // Send the order data to the SQS queue
    let data = {
        'userId': req.body['userId'],
        'planId': req.body['planId'],
        'subscriptionId': req.body['subscriptionId'],
        'status': 'Pending',
        'admin': 'email@email.com'
    }

    let sqsOrderData = {
        MessageAttributes: {
            "userId": {
                DataType: "String",
                StringValue: data.userId
            },
            "planId": {
                DataType: "String",
                StringValue: data.planId
            },
            "subscriptionId": {
                DataType: "String",
                StringValue: data.subscriptionId
            },
            "status": {
                DataType: "String",
                StringValue: data.status
            },
            "admin": {
                DataType: "String",
                StringValue: data.admin
            }
        },
        MessageBody: JSON.stringify(orderData),
        MessageDeduplicationId: req.body['userId'],
        MessageGroupId: "PendingSubscriptions",
        QueueUrl: queueUrl
    };
    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

    sendSqsMessage.then((data) => {
        console.log(`OrdersSvc | SUCCESS: ${
            data.MessageId
        }`);
        res.status(200).send("Thanks.");
    }).catch((err) => {
        console.log(`OrdersSvc | ERROR: ${err}`);

        // Send email to emails API
        res.send("We ran into an error. Please try again.");
    });
});


app.post('/user/:userId/plan/:planId/activeSubscription/:subscriptionId', async function (req, res, next) { // Send the order data to the SQS queue
    let data = {
        'userId': req.body['userId'],
        'planId': req.body['planId'],
        'subscriptionId': req.body['subscriptionId'],
        'status': 'Active'
    }

    let sqsOrderData = {
        MessageAttributes: {
            "userId": {
                DataType: "String",
                StringValue: data.userId
            },
            "planId": {
                DataType: "String",
                StringValue: data.planId
            },
            "subscriptionId": {
                DataType: "String",
                StringValue: data.subscriptionId
            },
            "status": {
                DataType: "String",
                StringValue: data.status
            }
        },
        MessageBody: JSON.stringify(orderData),
        MessageDeduplicationId: req.body['userId'],
        MessageGroupId: "ActiveSubscription",
        QueueUrl: queueUrl
    };
    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

    sendSqsMessage.then((data) => {
        console.log(`OrdersSvc | SUCCESS: ${
            data.MessageId
        }`);
        res.status(200).send("Thanks.");
    }).catch((err) => {
        console.log(`OrdersSvc | ERROR: ${err}`);

        // Send email to emails API
        res.send("We ran into an error. Please try again.");
    });
});


app.post('/notification', (req, res) => {
    const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
      };
    const registrationToken = req.body.token
    const message = req.body.message
    const options = notification_options
    admin.messaging().sendToDevice(registrationToken, message, options).then(response => {

        res.status(200).send("Notification sent successfully")

    }).catch(error => {
        console.log(error);
    });

})
