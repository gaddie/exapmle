// jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose")

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

// render static files like the css
app.use(express.static("public"));


// database
mongoose.set("strictQuery", false);

mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.7.1/todolistDb",)

const itemSchema = {
    name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "welcome"
})

const item2 = new Item({
    name: "hit the + to add"
})

const item3 = new Item({
    name: "hit this button to delete"
})


const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


// *********************************

app.get("/", function (req, res) {
    Item.find({}, function (err, items) {
        if (items.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    cosole.log(err)
                } else {
                    console.log("successfully added to the DB")
                }
            });
            res.redirect("/")
        } else {
            res.render('list', {
                listTitle: "today",
                newListItems: items,
            });
        }


    });

});

app.post("/", function (req, res) {
    console.log(req.body);
    let itemName = req.body.newitem;
    const listName = req.body.list;

    const newItem = new Item({
        name: itemName
    })

    if (listName === "Today"){
        newItem.save();
        res.redirect("/")
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(newItem)
            foundList.save();
            res.redirect("/" + listName)
        })
    }

}

})

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;

    Item.deleteOne({ _id: checkedItemId }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("succesfully deleted");
        }
    });
    res.redirect("/")

})


app.get("/:customlistName", function (req, res) {

    const customListName = req.params.listName;

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                })
                list.save();
                res.redirect("/" + customListName)
            } else {

                res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    })



})



app.listen(3000, function () {
    console.log("server started running on port 3000")
});