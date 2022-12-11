const express = require('express')
const ldap = require('ldapjs')
const router = express.Router()
const path = require('path')

//router.use(express.static(path.join(__dirname, 'public')));


router.get('/', (req, res) => {
    console.log(__dirname)
    res.sendFile(path.join(__dirname,'../public/login.html'))
    //res.send('login.html')
})

router.post('/', (req,res) => {
    const client = ldap.createClient({
        url: ['ldap://10.55.0.48:389']
    })

    client.on('error', (err) => {
        console.log("err")
    })

    let dn = "uid=" + req.body.username + ",cn=users,dc=directory,dc=axiros,dc=com"

    const username = req.body.username
    const password = req.body.password

    client.bind(dn, password, function(err) {
        var result = "";
		if (err) {
			result += "Reader bind failed " + err;
            console.log(result)
			//res.send(result);
            res.redirect('/login')
			return;
		}
        console.log("bind succesfull")

        const base = "cn=axirosintern,cn=groups,dc=directory,dc=axiros,dc=com"

        const opt = {
            scope: 'sub',
        }
        
        client.search(base, opt, (err, res_ldap) => {
            if(!res_ldap) {
                console.log(err)
                res.redirect('/login')
                return
            }
            
            res_ldap.on('searchRequest', (searchRequest) => {
                console.log('searchRequest: ', searchRequest.messageID);
            });
            res_ldap.on('searchEntry', (entry) => {
                const members = entry.object.uniqueMember

                const validMemebers = members.filter(member => {
                    return member.startsWith("uid=" + username + ",")
                })
                
                if (validMemebers.length > 0) {
                    if (!req.session.valid) {
                        req.session.valid = true
                        req.session.username = username
                        console.log("session created for user " + username)
                        console.log(req.session)
                        res.redirect('/')

                    } else {
                        console.log("already logged user - " + username)
                        console.log(req.session)
                        res.redirect('/')

                    }
                } 
            });
            res_ldap.on('searchReference', (referral) => {
                console.log('referral: ' + referral.uris.join());
            });
            res_ldap.on('error', (err) => {
                console.error('error: ' + err.message);
            });
            res_ldap.on('end', (result) => {
                console.log('status: ' + result?.status);
            });
        
        })
    })
    //res.redirect('/')
})

module.exports = router