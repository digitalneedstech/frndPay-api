const AWS = require('aws-sdk');
//const admin = require('firebase-admin');
//const request = require('request');
let send = undefined;
function init(event) {
    /*
    let db = admin.firestore();
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
    */
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  send1 = async (connectionId, data) => {
    await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: `Echo: ${data}` }).promise();
  }
    send = async (jsonMessage, data) => {
        switch (jsonMessage.event) {
            case "subscription.authenticated":
                sendDataToQueue(data);
                break;
            case "subscription.cancelled":
                sendDataToQueue(data);
                break;
            case "subscription.pending":
            case "subscription.halted":
                sendDataToQueue(data);
                sendDataForMailer(data);
                break;
            case "subscription.activated":
                sendDataToQueue(data);
                break;
            case "subscription.completed":
            case "subscription.charged":
                sendDataToQueue(data);
                if (data.length > 0) {
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
                } else {
                    console.log('data not found');
                }
                break;
        }
    }

    function sendDataToQueue(data) {
        if (data.length > 0) {
            let data = {
                'userId': userInfo.userId,
                'planId': planId,
                'subscriptionId': subscriptionId,
                'status': jsonMessage["payload"]["subscription"]["entity"]["status"]
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
                // MessageDeduplicationId: req.body['userId'],
                MessageGroupId: "UpdateStatusSubscription",
                QueueUrl: queueUrlForDataUpdate
            };
            let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

            sendSqsMessage.then((data) => {
                res.status(200).send("Thanks.");
            }).catch((err) => {
                console.log(`OrdersSvc | ERROR: ${err}`);

                // Send email to emails API
                res.send("We ran into an error. Please try again.");
            });

        }
    }

    function sendDataForMailer(data) {
        if (data.length > 0) {
            let data = {
                'userId': userInfo.userId,
                'planId': planId,
                'subscriptionId': subscriptionId,
                'status': jsonMessage["payload"]["subscription"]["entity"]["status"],
                'admin': 'test@email.com',
                'frndPayAdmin': 'frndPayAdmin@gmail.com',
                'userEmail': userInfo.personalDetails.email
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
                    },
                    "userEmail": {
                        DataType: "String",
                        StringValue: data.admin
                    }
                },
                MessageBody: JSON.stringify(orderData),
                // MessageDeduplicationId: req.body['userId'],
                MessageGroupId: "PendingOrHaltedSubscription",
                QueueUrl: queueUrlForMailer
            };
            let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

            sendSqsMessage.then((data) => {
                res.status(200).send("Thanks.");
            }).catch((err) => {
                console.log(`OrdersSvc | ERROR: ${err}`);

                // Send email to emails API
                res.send("We ran into an error. Please try again.");
            });

        }
    }

}

exports.handler = async (event) => {
    //init(event);
    //const connectionId = event.requestContext.connectionId;
    let data = event
    const connectionId = event.requestContext.connectionId;
    console.log("message", data);
    const subscriptionId = data.payload.subscription.entity.id;
    const planId = data.payload.subscription.entity.plan_id;
    const customerId = data.payload.subscription.entity.customer_id;
    console.log("plan", planId);
    console.log("sub", subscriptionId);
    /*
    const userData = await db.collection("users").where("subscriptionDetails.planId", '==', planId);
    await send(data, userData);
    // the return value is ignored when this function is invoked from WebSocket gateway
    return {};*/
    return {"val":"one"};
    //await send1(connectionId, data);
};
