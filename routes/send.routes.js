const e = require('express')
const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')
const nodeMailer = require('nodemailer')

function getDifferences(pre, post) {
    let ret = ''
    for (const key of Object.keys(pre)) {
        if(pre[key] !== post[key]) {
            if(typeof(pre[key]) === 'object') {
                ret += getDifferences(pre[key],post[key])
            } else {
                ret += key + ' before: '  + pre[key] + '\n'
                ret += key + ' after: '  + post[key] + '\n\n'
            }
        }
    }
    return ret
}

async function notify(type, id, message) {
    let emails = null
    if (type == 'device') {
        emails = await getEmails('device', id)
    }

    else if (type == 'ipaddress') {
        emails = await getEmails('ip', id)
    }

    else if (type == 'iprange') {
        emails = await getEmails('range', id)
    }

    

    if (!emails) {return null}


    console.log(emails)

    for (const email of emails) {
        sendEmail(email, message, type, id)
    }


}

function sendEmail(email,message, type, id) {
    const transporter = nodeMailer.createTransport({
        host: 'marge.axiros.com',
        port: 465,
        secure: true,
        auth: {
            user: 'zagreb@axiros.com',
            pass: 'NPk7yJ9khba1'
        }
    });

    const username = email.split('@')[0]

    const unsubscribeLink = '\nTo unsubscribe click the link https://localhost:8080/remove/' + username + '/' + type + '/' + id
    //message = message + unsubscribeLink

    const mailOptions = {
        from: '"netbox-axiros" <zagreb@axiros.com>', 
        to: [email], // list of receivers
        subject: "Change in Netbox", 
        text: message + unsubscribeLink
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        
    });




}

async function getEmails(type, id) {
    const typeId = type + 'id'
    let qString = 'select email from axUser natural join follows' + type + ' where ' + typeId + ' = $1'
    let query = await db.query(qString, [id])
    return query.rows.map(e => e.email)
}

router.get('/', (req,res) => {
    const type = req.body.model
    const id = req.body.data.id
    const pre = req.body.snapshots.prechange
    const post = req.body.snapshots.postchange
    const difference = getDifferences(pre,post)
    const name = req.body.data.display
    console.log(difference)
    let message = 'Hello, netbox entity that you follow has been changed.\nName: ' + name + '\n\n' + difference
    //const unsubscribeLink = '\nlocalhost:8080/' + req.session.username + '/' + type + '/' + id
    //message = message + unsubscribeLink
    notify(type,id,message)
    res.send('ok')
})






module.exports = router