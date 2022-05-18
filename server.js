const express = require('express')
const config = require('config')
const app = express()
const bodyParser = require('body-parser')
const mongodb = require('mongodb')
const passwordValidator = require('password-validator');
                    // password requirements
                var schema = new passwordValidator();
                schema
                .is().min(7)
                .is().max(25)
                .has().uppercase()
                .has().lowercase()
                .has().digits()

const PORT = config.get('port') 


app.listen(PORT, () => console.log('server running'))
app.use(bodyParser.json());
app.use(express.static('site'))
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs'); 


let mongoClient = new mongodb.MongoClient('mongodb://localhost:27017/', {
    useUnifiedTopology : true
})

app.get("/signup", (req, res) => {
    res.sendFile('site/signup/signup.html', {root: __dirname});
})



app.post("/signupin", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var city = req.body.city;
    var name = req.body.name;
    var datentime = new Date();

    var tempdata = {
        "username" : username,
        "password" : password,
        "last_time" : datentime,
        "name" : name,
        "city" : city,
        "email" : email
    }
    mongoClient.connect(async function(error, mongo) {
        let db = mongo.db('tempbase');
        let coll = db.collection('users');
        
        if (schema.validate(password) == true) {       
            await coll.insertOne(tempdata);
            res.sendFile('site/signup/fail-success/signsuccess.html' , { root : __dirname});
        }
        else {
            res.sendFile('site/signup/fail-success/signfail.html' , { root : __dirname});
        }
    });
    
})



app.post("/admin", (req, res) => {
    var password = req.body.password;

    if (password == '123456') {
        mongoClient.connect(async function(error, mongo) {
            let db = mongo.db('tempbase');
            let coll = db.collection('users');
            let users = await coll.find().toArray();
            res.render('admin', {users});

        });
    }
    else {
        res.send('Invalid password');
    }
    
})

app.get('/admin', function(req, res) {
    res.send('Please, login with password');
})

app.post('/user/add', function(req, res) { 
    console.log('User added successfully');
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var city = req.body.city;
    var name = req.body.name;
    var datentime = new Date();

    var tempdata = {
        "username" : username,
        "password" : password,
        "last_time" : datentime,
        "name" : name,
        "city" : city,
        "email" : email
    }
    mongoClient.connect(async function(error, mongo) {
        let db = mongo.db('tempbase');
        let coll = db.collection('users');
        
        await coll.insertOne(tempdata);
    });
    res.send(200);
        
}); 

app.get('/user/delete/:name', function(req, res) {
    let name = req.params.name;
    console.log('User ' + name + ' deleted successfully')
    mongoClient.connect(async function(error, mongo) {
        
        let db = mongo.db('tempbase')
        let coll = db.collection('users')
        await coll.deleteOne({name: name});
        res.send('User ' + name + ' deleted successfully')
    })
        
}); 

app.get('/user/edit/:name', function(req, res) {
    let name = req.params.name;
    console.log(name)
    mongoClient.connect(async function(error, mongo) {
        
        let db = mongo.db('tempbase')
        let coll = db.collection('users')
        let user = await coll.findOne({name: name});
        res.render('edit', {user});
    })
        
}); 

app.get('/user/editFin/:name', function(req, res) {
    let name = req.params.name;
    console.log(name)
    mongoClient.connect(async function(error, mongo) {
        
        let db = mongo.db('tempbase')
        let coll = db.collection('users')
        await coll.updateOne({name: name}, {$set: {name: req.params.name , username: req.params.username}})
    })
        
}); 

app.get('/send-doctor-page', function(req, res) {
    mongoClient.connect(async function(error, mongo) {
        let db = mongo.db('tempbase');
        let coll = db.collection('doctors');
        let doctors = await coll.find().toArray();
        res.render('doctor-page/doctor',{doctors});

    });
})


app.get('/doctor/add-doctor', function(req, res) {
    res.sendFile('views/doctor-page/adding-doctor.html', { root : __dirname})
})


app.post('/doctor/add-doctor', function(req, res) {
    var fullname = req.body.fullname;
    var imagelink = req.body.imagelink;
    var position = req.body.position;
    var instalink = req.body.instalink;
    var otziv = req.body.otziv;

    var tempdata = {
        "fullname" : fullname,
        "imagelink" : imagelink,
        "position" : position,
        "instalink" : instalink,
        "otziv" : otziv
    }
    mongoClient.connect(async function(error, mongo) {
        let db = mongo.db('tempbase');
        let coll = db.collection('doctors');
        
        await coll.insertOne(tempdata);
    });
    res.send(200);
        
})


app.get('/to-workout', function(req, res) {
    res.sendFile('site/secondary-pages/workouts.html', { root : __dirname})
})

app.get('/to-food', function(req, res) {
    res.sendFile('site/secondary-pages/food.html', { root : __dirname})
})

app.get('/to-profile', function(req, res) {
    let name = req.params.name;
    console.log(name)
    mongoClient.connect(async function(error, mongo) {
        
        let db = mongo.db('tempbase')
        let coll = db.collection('users')
        let user = await coll.findOne({name: name});
        res.render('profile', {user})
    })
})

app.get('/to-index' , function(req, res) {
    res.sendFile('site/index.html', { root : __dirname})
})
