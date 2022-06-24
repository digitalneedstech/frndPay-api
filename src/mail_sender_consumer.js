const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');

// Configure the region
AWS.config.update({region: 'us-east-1'});

const queueUrl = "SQS_QUEUE_URL";

// Configure Nodemailer to user Gmail
let transport = nodemailer.createTransport({
    host: 'smtp.googlemail.com',
    port: 587,
    auth: {
        user: 'Email address',
        pass: 'Password'
    }
});

function sendMail(message) {
    let sqsMessage = JSON.parse(message.Body);
    const userEmailMessage = {
        from: sqsMessage.admin,    // Sender address
        to: sqsMessage.userEmail,     // Recipient address
        subject: 'Pending Subscription',    // Subject line
        html: `<p>Hi ${sqsMessage.userEmail}.</p. <p>${sqsMessage.userId} has subscription pending. Please look into the same carefully.! </p>` // Plain text body
    };

    const frndPayAdminEmailMessage = {
        to: sqsMessage.frndPayAdmin,    // Sender address
        from: sqsMessage.admin,     // Recipient address
        subject: 'Pending Subscription',    // Subject line
        html: `<p>Hi ${sqsMessage.userEmail}.</p. <p>${sqsMessage.userId} has subscription pending. Please look into the same carefully.! </p>` // Plain text body
    };

    transport.sendMail(userEmailMessage, (err, info) => {
        if (err) {
            console.log(`EmailsSvc | ERROR: ${err}`)
        } else {
            transport.sendMail(frndPayAdminEmailMessage,(err,info)=>{
                if (err) {
                    console.log(`EmailsSvc | ERROR: ${err}`)
                } else {
                    console.log(`EmailsSvc | INFO: ${info}`);
                }
            })
            console.log(`EmailsSvc | INFO: ${info}`);
        }
    });
}

// Create our consumer
const app = Consumer.create({
    queueUrl: queueUrl,
    handleMessage: async (message) => {
        if(message.status=="Pending")
            sendMail(message);
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