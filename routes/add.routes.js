const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')
// es6 syntax
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

//router.use(express.static(path.join(__dirname, '../public')));

async function fetchLabel(type, id) {
    const token = '9f172c53baba80c5b9672062a82ea0bd1369b619'
    let url = 'https://netbox.axiros.com/api/'
    let typePath = ''
    if (type == 'device') {
        typePath = 'dcim/devices?id=' + id
    }
    else if (type == 'ip') {
        typePath = 'ipam/ip-addresses?id=' + id
    }
    else if (type == 'range') {
        typePath = 'ipam/ip-ranges?id=' + id
    }
    url = url + typePath

    const options = {
        method: 'GET',
        headers: {
            'Authorization': 'Token ' + token
        }
    };

    fetch(url, options)
	.then(res => res.json())
	.then(json => addLabel(type,id,json))
}

async function addLabel(type,id,data){
    console.log(data)
    let label = ''
    if (data.count) {
        label = data.results[0].display
    }
    else {
        return
    }

    let qString = 'update ' + type + ' set label = $1 where ' + type + 'id = $2'
    console.log(qString)
    db.query(qString,[label, id])
}

async function insertIfMissing(type, pk) {
    const idString = type + 'id'
    let qString = 'select * from ' + type + ' where ' + idString + ' = ' + pk
    console.log(qString)
    let query = await db.query(qString, [])
    if (!query.rowCount) {
        qString = 'insert into ' + type + ' values($1)'
        query = await db.query(qString, [pk])
    }
}

async function insertUserIfMissing(username) {
    console.log('adding user to db user - ' + username)
    let qString = 'select * from axUser where username = $1'
    let query = await db.query(qString, [username])
    if (!query.rowCount) {
        qString = 'insert into axUser values($1, $2)'
        query = await db.query(qString, [username, username + '@axiros.com'])
    }
}

router.post('/:type', async(req, res) => {
    console.log(req.params.type)
    const type = req.params.type
    const username = req.session.username
    const upperType = type.charAt(0).toUpperCase() + type.slice(1)
    const table = 'follows' + upperType
    const id = req.body.id
    const qString = 'insert into ' + table + ' values($1, $2)'

    await insertIfMissing(type, id)
    await insertUserIfMissing(username)

    let query = await db.query(qString, [username, id])
    
    let status = 'failed'

    if (query.rowCount) {
        status = 'success'
    }
    
    res.json({status: status})
    if (query.rowCount) {
        fetchLabel(type, id)
    }
    
})

module.exports = router