
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
var path = require('path');
const date = require(__dirname+"/date.js");
const _ = require("lodash");

const app = express();

app.set("view engine","ejs");
app.use(express.urlencoded());
console.log(__dirname);
app.use('/list',express.static(path.join(__dirname, 'public')));

getConnection = async () => {
  try {
    await mongoose.connect("mongodb+srv://"+process.env.MONGO_USERNAME+":"+process.env.MONGO_SECRET+"@cluster0.2oarx.mongodb.net/itemsDB",{useNewUrlParser:true, useUnifiedTopology: true});
    console.log('Connection to DB Successful');
  } catch (err) {
    console.log('Connection to DB Failed');
  }
};

getConnection();


const itemsSchema = {
  name:String
};

const items = mongoose.model("items",itemsSchema);

const item1 = new items({name:"buy food"});
const item2 = new items({name:"eat food"});
let item = [item1,item2];

const listSchema = {
  name:String,
  defaultList: [itemsSchema]
};

const lists = mongoose.model("lists",listSchema);

app.get("/",async function(req,res){
  res.redirect("/list/Home");
});

app.get("/list/:customList",async function(req,res){
  let todayDate = date.getDate();
  const customList = req.params.customList;
  let results1 = await lists.find();
  console.log(req.params.customList);
  lists.findOne({name:customList},function(err,result){
    if(!err){
        console.log(result);
        if (customList === "Home" && !result){
          const list1 = new lists({
            name:customList,
            defaultList:item
          });
          list1.save((err)=>{
            if(!err){
            res.redirect("/list/"+customList);
           }              
          });
        }
        else{
        console.log(result);
        res.render("list",{kindOfDate:todayDate,items:result.defaultList,customName:customList,listnames:results1});
        }
      }
  });
 

});

app.post("/",function(req,res){
const item = new items({
  name: req.body.nextItem
});
lists.findOne({name:req.body.button},function(err,result){
    if (!err){
    result.defaultList.push(item);
    result.save();
    res.redirect("/list/"+req.body.button);
  }
  });
});

app.post("/delete",function(req,res){
  lists.findOneAndUpdate({name:req.body.listName},{$pull:{defaultList:{_id:req.body.checkbox}}},function(err,found){
    if(!err){
      res.redirect("/list/"+req.body.listName);
    }
  });
});

app.post("/deletelist",function(req,res){
  lists.deleteOne({_id:req.body.listid},(err)=>{
    if(!err){
      console.log("Hey");
      res.redirect("/list/Home");
    }
    else{
      console.log(err);
    }
  });
});

app.post("/newlist",(req,res)=>{
  const newList = _.capitalize(req.body.newList);
  const list1 = new lists({
    name:newList,
    defaultList:item
  });
  list1.save((err)=>{
    if(!err){
    res.redirect("/list/"+newList);
   }              
  });
});


app.get("/about",function(req,res){
  res.render("about");
});

app.listen(process.env.PORT || 3000,function(){
  console.log("server is running on port 3000");
})
