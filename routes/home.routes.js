const express = require('express')
const ldap = require('ldapjs')
const router = express.Router()
const path = require('path')
const db = require('../db')

//router.use(express.static(path.join(__dirname, '../public')));

router.get('/logout', (req,res) => {
    console.log(req.session)
    req.session.destroy((err) =>{
        if(!err){
        console.log(err);
        }
    })
    res.json({status: 'success'})
})

router.get('/', async (req, res) => {
    //console.log(req.session)

    if (!req.session.valid){
        console.log("hello from here")
        res.redirect("/login")
        return
    }
    const username = req.session.username

    let query = await db.query('select deviceid, label from followsDevice natural join device where username = $1', [username])
    const devicesFollowed =  query.rows.map(elem => elem.deviceid + ' | ' + elem.label )
    query = await db.query('select ipid, label from followsIp natural join ip where username = $1', [username])
    const ipsFollowed = query.rows.map(elem => elem.ipid + ' | ' + elem.label )
    query = await db.query('select rangeid, label from followsRange natural join range where username = $1', [username])
    const rangesFollowed = query.rows.map(elem => elem.rangeid + ' | ' + elem.label )
    
    res.render('home', {
        devices: devicesFollowed,
        ips: ipsFollowed,
        ranges: rangesFollowed,
        user: username
    })

    
})

module.exports = router