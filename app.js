
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const date = require(__dirname+"/date.js");
const _ = require("lodash");

const app = express();

app.set("view engine","ejs");
app.use(express.urlencoded());
app.use(express.static("public"));


mongoose.connect("mongodb+srv://"+process.env.MONGO_USERNAME+":"+process.env.MONGO_SECRET+"@cluster0.2oarx.mongodb.net/itemsDB",{useNewUrlParser:true});

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

app.get("/",function(req,res){
  let day = date.getDate();
  items.find(function(err,results){
    if (err){
      console.log(err);
    }
    else{
      if(results.length === 0){
      items.insertMany(item,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully saved");
        }
      });
      res.redirect("/");
    }
    else{
res.render("list",{kindOfDay:day,items:results});
    }
  }
  });
});

app.get("/:customList",function(req,res){
  const customList = _.capitalize(req.params.customList);
  lists.findOne({name:customList},function(err,result){
    if(!err){
      if (!result){
        const list1 = new lists({
          name:customList,
          defaultList:item
        });
        list1.save();
        res.redirect("/"+customList);
      }
      else{
        console.log(result.defaultList);
        res.render("list",{kindOfDay:customList,items:result.defaultList});
      }
    }
  });

});

app.post("/",function(req,res){
const item = new items({
  name: req.body.nextItem
});
if (req.body.button === "Today"){
item.save();
res.redirect("/");
}else{
  lists.findOne({name:req.body.button},function(err,result){
    if (!err){
    result.defaultList.push(item);
    result.save();
    res.redirect("/"+req.body.button);
  }
  });
}
});

app.post("/delete",function(req,res){
  console.log(req.body.listName);
  if (req.body.listName === "Today"){
  items.findByIdAndRemove(req.body.checkbox,function(err){
    if (!err){
      console.log("successfully deleted");
      res.redirect("/");
    }else{
      console.log(err);
    }
  });
}else{
  lists.findOneAndUpdate({name:req.body.listName},{$pull:{defaultList:{_id:req.body.checkbox}}},function(err,found){
    if(!err){
      res.redirect("/"+req.body.listName);
    }
  });
}
});


app.get("/about",function(req,res){
  res.render("about");
});


let port = process.env.PORT;
if(port===null || port ===""){
  port  = 3000;
}
app.listen(port,function(){
  console.log("server is running on port 3000");
})
