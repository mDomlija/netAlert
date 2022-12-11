const express = require('express')
const router = express.Router()
const path = require('path')
const db = require('../db')


//router.use(express.static(path.join(__dirname, '../public')));

async function deleteFromDb(type, username, id) {
    const upperType = type.charAt(0).toUpperCase() + type.slice(1)
    const tableId = type + 'ID'
    const table = 'follows' + upperType
    console.log(table)
    const qString = 'delete from ' + table + ' where ' + tableId + '= $1 and username = $2'
    let query = await db.query(qString, [id, username])
    console.log(query)
    let status = 'failed'
    
    if(query.rowCount){
        status = 'success'
    } 

    return status
}

router.get('/:username/:type/:id', async (req,res) => {
    const type = req.params.type
    const username = req.params.username
    const id = req.params.id

    const status = await deleteFromDb(type, username, id)

    res.render('deleteStatus', {
        status: status,
        
    })



}) 

router.delete('/', async (req,res) => {
    console.log(req.body);
    const id = req.body.id.split(' | ')[0]
    const type = req.body.type
    const username = req.session.username
    const upperType = type.charAt(0).toUpperCase() + type.slice(1)
    const tableId = type + 'ID'
    const table = 'follows' + upperType
    console.log(table)
    const qString = 'delete from ' + table + ' where ' + tableId + '= $1 and username = $2'
    let query = await db.query(qString, [id, username])
    console.log(query)
    let status = 'failed'
    
    if(query.rowCount){
        status = 'success'
    } 

    res.json({status: status})
})

module.exports = router