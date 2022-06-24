//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose") 
const _ =require("lodash") 
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});


const ItemSchema={
  name:String
}

const Item=mongoose.model(
  "Item",ItemSchema)

const item1=new Item({
  name:"Welcome to todo list"
})
const item2=new Item({
  name:"Click on + to add"
})
const item3=new Item({
  name:"<--- Hit this to delete"
})

const defaultItems=[item1,item2,item3]

const listSchema={
  name:String,
  items:[ItemSchema]
}

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,items)
 {
  
  if(items.length==0)
  {
    Item.insertMany(defaultItems,function(err)
    {
      if(err) console.log(err)
      else console.log("Successfully inserted")
    })
  }
  res.render("list", {listTitle: "Today", newListItems: items});

 })

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;
  const it=new Item({name:item})
  
  if(listName==="Today")
  {
    it.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList)
    {
      foundList.items.push(it);
      foundList.save();
      res.redirect("/"+listName)
    })
  }
 
});

app.post("/delete",function(req,res)
{
  const checkedid=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {   
  Item.findByIdAndRemove(checkedid,function(err)
  {
    if(!err)
    // console.log("Successfully deleted");
    res.redirect("/")
  })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedid}}},function(err,foundList)
    {
     if(!err)
     {
      res.redirect("/"+listName);
     }
    })
  }
 
})

app.get("/:customName",function(req,res)
{
  const Customname=_.capitalize(req.params.customName);
  // console.log(Customname)

  List.findOne({name:Customname},function(err,foundList)
  {
    if(!err)
    {
      if(!foundList) {
        // create
        const list=new List({
          name:Customname,
          items:defaultItems
        })
        list.save()
        res.redirect("/"+Customname)
      }
      else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

     
    }
  })
  
  // res.redirect("/:customName")
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
