var login = require ('./model/login.js');
var item = require('./model/item.js');
var ride = require('./model/ride.js');


const express=require('express');
const cors=require("cors");
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const bodyparser=require('body-parser');
const saltrounds=10;
const app=express();
app.use(cors());

app.use(bodyparser.json({limit:'50mb'}));
app.use(bodyparser.urlencoded({limit:'50mb',extended: true}));


// Connecting to the mongo database.................

const mongoose= require('mongoose');
mongoose.connect('mongodb+srv://ashutosh024:aventador123@cluster0.fj7cclv.mongodb.net/');
console.log('DataBase Connected:');

const userscm= new mongoose.Schema({});

// Mongo database Connected...............

app.listen(2000);

// CORS //////
const whitelist=["http://frontend-service:3000","http://frontend-service:3000/main"];
const corsoptions ={
    origin: function (origin, callback)
    {
        if(!origin || whitelist.indexOf(origin)!=-1){
            callback(null,true);
        }
        else{
            callback(new Error("Server access denied due to CORS!"))
        }
    },
    credentials: true
}
app.use(cors(corsoptions));
/// CORS ///////

//paths..........
const userRouter =express.Router();
app.use('/enquiry', userRouter);

userRouter
.route('/register')
.get()
.post(postAccount)

userRouter
.route('/login')
.get()
.post(postCred)

userRouter
.route('/accdata')
.get(getAccount)
.post()

userRouter
.route('/updateAccount')
.get()
.post(postupdateAccount)

userRouter
.route('/updatepp')
.get()
.post(postupdatepp)

userRouter
.route('/deleteAccount')
.get()
.post(postdeleteAccount)

userRouter
.route('/additem')
.get()
.post(postItem)

userRouter
.route('/getitem')
.get()
.post(postItemCollect)

userRouter
.route('/getitemDetail')
.get()
.post(postItemId)

userRouter
.route('/addride')
.get()
.post(postRide)

userRouter
.route('/getride')
.get()
.post(postRideCollect)

userRouter
.route('/getmyride')
.get()
.post(postMyRideCollect)
//other functions ///////////////////////////////////////////////////////////
 function Checktoken(token)
{
    try{
        var decode = jwt.verify(token, 'lawra');
        console.log("decode:"+decode.userId);
        return decode.userId;
    }
     catch(err)
     {
        return null;
     };
    
}
//GET functions /////////////////////////////////////////////////////////////
async function getAccount(req,res)
{
    var token = req.headers.authorization;
    res.statusCode=503;
    var allow = false;
    var avail = false;
    var decode;
    console.log("token:"+token);
    if(token)
    {
        try{
            decode = jwt.verify(token, 'lawra')
        }
         catch(err)
         {
            res.status(404).json({})
            return;
         };
         console.log("decode:"+decode.userId);
    }
    await login.count({_id: decode.userId}).then(function(data){
        if(data!==0)
        {
            avail=true;
        }
    });
    if(avail)
    {
        await login.findOne({_id: decode.userId},{ _id:false, password:false, email:false, verified:false, createddate:false})
        .then(async function(data){
            console.log(data.roll);
            res.status(200).json(data);
        })
    }
    else
    {
        res.send();
    }

}
//POST functions ////////////////////////////////////////////////////////////


async function postCred(req,res)
{
    res.statusCode=503;
    var avail = false;
    await login.count({email: req.body.email}).then(function(data){
        if(data!==0)
        {
            avail=true;
        }
    });
    if(avail)
    {
        await login.findOne({email:req.body.email})
        .then(async function(data){
            if(!data.verified)
            {
                var pass;
                await bcrypt.compare(req.body.password,data.password).
                then(function(val){
                    pass=val;
                })
                if(pass)
                {
                    console.log(data.roll);
                    const cookie=await jwt.sign({userId: data._id}, "lawra");
                    console.log(cookie);
                    res.status(200).json({
                        token:cookie,
                    });
                }
                else
                {
                    console.log("password didnot match");
                    res.statusCode=406;
                    res.send();
                }
            }
            else
            {
                console.log(req.body.email+"not verified");
                res.statusCode=406
                res.send();
            }
        })
    }
    else
    {
    res.send();
    }
}

async function postAccount(req, res)
{
    res.statusCode=503;
    var rol, emal;
    await login.count({roll: req.body.roll}).then(function(data){
        rol=data;
    });
    await login.count({email:req.body.email}).then(function(data){
        emal=data;
    });
    
    if(rol||emal)
    {
        res.statusCode=406;
    }
    else
    {
        var pass="";
        await bcrypt.hash(req.body.password,saltrounds).then(function(data){
            pass=data;
            console.log(pass);
        });
        if(pass!=="")
        {
            var user= new login({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                roll:req.body.roll,
                email:req.body.email,
                birthdate:req.body.birthdate,
                createddate: Date.now(),
                password:pass
            });
            await user.save();
            console.log(user);
            await login.count({roll: req.body.roll}).then(function(data){
                rol=data;
            });
            if(rol)
            {
                res.statusCode=204;
            }
        }
    }
    res.send();
}

async function postupdateAccount(req, res)
{
    res.statusCode=469;
    var avail = false;
    var token = req.headers.authorization;
    var id=Checktoken(token);

    await login.count({_id: id}).then(function(data){
        if(data!==0)
        {
            avail=true;
        }
    });
    if(avail)
    {
        if(req.body.firstname!=="")
        {
            await login.updateOne({_id:id},{$set:{firstname:req.body.firstname}});
        }
        if(req.body.lastname!=="")
        {
            await login.updateOne({_id:id},{$set:{lastname:req.body.lastname}});
        }
        
        if(req.body.oldpassword!=="" && req.body.password!=="")
        {
            await login.findOne({_id:id})
            .then(async function(data)
            {
                    var pass;
                    await bcrypt.compare(req.body.oldpassword,data.password).
                    then(function(val){
                        pass=val;
                    })
                    if(pass)
                    {
                        var pass="";
                        await bcrypt.hash(req.body.password,saltrounds).then(function(data){
                            pass=data;
                            console.log(pass);
                        });
                        console.log(data);
                        await login.updateOne({_id:id},{$set:{password:pass}});
                        res.statusCode=200;
                        res.send();
                    }
                    else
                    {
                        console.log("password didnot match");
                        res.statusCode=406;
                        res.send();
                    }
            })
        }
        else
        {
            res.statusCode=469;
            res.send();
        }
        
    }
    else
    {
        res.send();
    }
}
async function postupdatepp(req,res)
{
    var avail = false;
    var token = req.headers.authorization;
    var id=Checktoken(token);
    console.log(id);
    await login.count({_id:id}).then(function(data){
        if(data!==0)
        {
            avail=true;
        }
    });
    if(avail)
    {
        if(req.body.bin!=="")
        {
            await login.updateOne({_id:id},{$set:{dp:req.body.bin}});
            res.statusCode=200;
            res.send();
        }
    }
    else
    {
        res.statusCode=469;
        res.send();
    }
}
async function postdeleteAccount(req,res)
{
    res.statusCode=503;
    var avail = false;
    var token = req.headers.authorization;
    var id=Checktoken(token);

    await login.count({_id: id}).then(function(data){
        if(data!==0)
        {
            avail=true;
        }
    });
    if(avail)
    {
        await login.findOne({_id: id})
            .then(async function(data)
            {
                    var pass;
                    await bcrypt.compare(req.body.password,data.password).
                    then(function(val){
                        pass=val;
                    })
                    if(pass)
                    {
                        await login.deleteOne({_id:id});
                        res.statusCode=200;
                        res.send();
                    }
                    else
                    {
                        console.log("password didnot match");
                        res.statusCode=406;
                        res.send();
                    }
            })
    }
    else
    {
        res.statusCode=469;
        res.send();
    }
}
async function postItem(req, res)
{
    res.statusCode=503;
    var avail = false;
    var token = req.headers.authorization;
    var id=Checktoken(token);
    await login.count({_id: id}).then(function(data){
        if(data===0)
        {
            avail=true;
        }
    });
    if(avail)
    {
        res.statusCode=469;
        res.send();
        return;
    }
    var user= new item({
        itemname:req.body.itemname,
        location:req.body.location,
        description:req.body.description,
        image:req.body.bin,
        date:Date.now(),
        poster:id
        });
    await user.save();
    console.log(user._id);
    res.statusCode=200;
    res.send(); 
}
async function postItemCollect(req, res)
{
    var token = req.headers.authorization;
    var check=false;
    var id=Checktoken(token);
    await login.count({_id:id}).then(function(data){
        if(data===0)
        {
            check=true;
        }
    })
    if(check)
    {
        res.statusCode=469;
        res.send();
        return;
    }
    var begin;
    var end;
    if(req.body.begin==="")
    {
        begin=new Date("1998-06-05");
    }
    else
    {
        begin=req.body.begin;
    }
    console.log(begin);
    if(req.body.end==="")
    {
        end=new Date(Date.now());
    }
    else
    {
        end=req.body.end;
    }
    console.log(end);
    if(req.body.id==="")
    {
        await item.find({date:{$gte: begin , $lte: end}},{image:false, description:false}).sort({date:-1})
        .then(function(data){
            console.log(data);
            res.status(200).json(data);
        })
    }
    else
    {
        await item.find({date:{$gte: begin , $lte: end}, _id:req.body.id},{image:false, description:false}).sort({date:-1})
        .then(function(data){
            console.log(data);
            res.status(200).json(data);
        })
        .catch(function(data){
            res.status(200).json("");
        })
    }
}
async function postItemId(req,res)
{
    var chk=false;
    var avail=false;
    var token = req.headers.authorization;
    var id=Checktoken(token);
    console.log(id);
    await login.count({_id: id}).then(function(data){
        if(data===0)
        {
            chk=true;
        }
    });
    console.log(chk);
    if(chk)
    {
        res.statusCode=469;
        res.send();
        return;
    }
    await item.count({_id: req.body.id}).then(function(data){
        if(data!==0)
        {
            avail=true;
        }
    });
    if(avail)
    {
        await item.findOne({_id: req.body.id},{poster:false})
        .then(async function(data){
            console.log(data._id);
            res.status(200).json(data);
        })
    }
    else
    {
        res.statusCode=404;
        res.send();
    }
}
async function postRide(req, res)
{
    res.statusCode=503;
    var avail = false;
    var token = req.headers.authorization;
    var id=Checktoken(token);
    await login.count({_id: id}).then(function(data){
        if(data===0)
        {
            avail=true;
        }
    });
    if(avail)
    {
        res.statusCode=469;
        res.send();
        return;
    }
    var rides= new ride({
        admin:id,
        phone:req.body.phone,
        maxslots:req.body.slots,
        slots:req.body.slots-1,
        destination:req.body.destination,
        pickup:req.body.pickup,
        date: new Date(req.body.date),
        passengers: [id]
    });
    await rides.save();
    console.log(rides);
    res.statusCode=200;
    res.send(); 
}
async function postRideCollect(req, res)
{
    var token = req.headers.authorization;
    var check=false;
    var id=Checktoken(token);
    await login.count({_id:id}).then(function(data){
        if(data===0)
        {
            check=true;
        }
    })
    if(check)
    {
        res.statusCode=469;
        res.send();
        return;
    }
    var begin;
    var end=1;
    if(req.body.begin==="")
    {
        begin=new Date(Date.now());
    }
    else
    {
        begin=req.body.begin;
    }
    console.log(begin);
    if(req.body.end==="")
    {
        end = await ride.find({}).sort({date:-1}).limit(1).then(function(data){
            return data[0].date;
        });
    }
    else
    {
        end=req.body.end;
    }
    console.log(end);
    if(req.body.id==="")
    {
        await ride.find({date:{$gte: begin , $lte: end}, passengers:{$ne: id}, slots:{$gte:1}},{admin:false, passengers:false}).sort({date:-1})
        .then(function(data){
            console.log(data);
            res.status(200).json(data);
        })
    }
    else
    {
        await ride.find({date:{$gte: begin , $lte: end}, _id:req.body.id,passengers:{$ne: id},slots:{$gte:1}},{admin:false, passengers:false}).sort({date:-1})
        .then(function(data){
            console.log(data);
            res.status(200).json(data);
        })
        .catch(function(data){
            res.status(200).json("");
        })
    }
}
async function postMyRideCollect(req, res)
{
    var token = req.headers.authorization;
    var check=false;
    var id=Checktoken(token);
    await login.count({_id:id}).then(function(data){
        if(data===0)
        {
            check=true;
        }
    })
    if(check)
    {
        res.statusCode=469;
        res.send();
        return;
    }
    var begin;
    var end=1;
    if(req.body.begin==="")
    {
        begin=new Date(Date.now());
    }
    else
    {
        begin=req.body.begin;
    }
    console.log(begin);
    if(req.body.end==="")
    {
        end = await ride.find({}).sort({date:-1}).limit(1).then(function(data){
            return data[0].date;
        });
    }
    else
    {
        end=req.body.end;
    }
    console.log(end);
    if(req.body.id==="")
    {
        await ride.find({date:{$gte: begin , $lte: end}, passengers:id},{admin:false, passengers:false}).sort({date:-1})
        .then(function(data){
            console.log(data);
            res.status(200).json(data);
        })
    }
    else
    {
        await ride.find({date:{$gte: begin , $lte: end}, _id:req.body.id,passengers:id},{admin:false, passengers:false}).sort({date:-1})
        .then(function(data){
            console.log(data);
            res.status(200).json(data);
        })
        .catch(function(data){
            res.status(200).json("");
        })
    }
}
// PUT functions ////////////////////////////////////////////////////////////
// DELETE functions /////////////////////////////////////////////////////////
