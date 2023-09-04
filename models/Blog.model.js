const mongoose = require("mongoose") ;


const BlogSchema = mongoose.Schema({
    Title :{type:String,require:true},
    Category :{type:String,require:true},
    Author :{type:String,require:true},
    Content  :{type:String,require:true},
    Image :{type:String},
    user_id: {type:String,require:true},
})


const BlogModel = mongoose.model("blog",BlogSchema) ;

module.exports={
    BlogModel
}