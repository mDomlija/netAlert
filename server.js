const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
var session = require('express-session')


const https = require('https');
const fs = require('fs');


const app = express()


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/public/js')); // redirect my JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

const authRouter = require('./routes/login.routes')
const homeRouter = require('./routes/home.routes')
const addRouter = require('./routes/add.routes')
const removeRouter = require('./routes/remove.routes')
const sendRouter = require('./routes/send.routes')
app.use("/login", authRouter)
app.use("/add", addRouter)
app.use("/remove", removeRouter)
app.use("/send", sendRouter)
app.use("/", homeRouter)



const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
  };
  
https.createServer(options, app).listen(8080);

app.listen(3000)