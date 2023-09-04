const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
require("dotenv").config()
const cors = require("cors")

const { UserModel } = require("./models/User.model")
const { BlogModel } = require("./models/Blog.model")
const { connection } = require("./config/db")
const {authentication} = require("./middleware/Authentication.middleware") ;

const app = express()
app.use(express.json())
app.use(cors({
    origin: "*"
}))


app.get("/", (req, res) => {
    res.send({msg:"base API endpoint"})
})


app.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;
    const is_user = await UserModel.findOne({ email: email })
    if (is_user) {
        res.send({ msg: "Email already registered, Try signing in?" })
    }
    bcrypt.hash(password, 3, async function (err, hash) {
        const new_user = new UserModel({
            email,
            password: hash,
            name,
        })
        await new_user.save()
        res.send({ msg: "Sign up successfull" })
    });
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const is_user = await UserModel.findOne({ email })
    if (is_user) {
        const hashed_pwd = is_user.password
        bcrypt.compare(password, hashed_pwd, function (err, result) {
            if (result) {
                const token = jwt.sign({ userID: is_user._id }, process.env.SECRET_KEY)
                res.send({ msg: "Login successfull", token: token })
            }
            else {
                res.send({msg:"Login failed"})
            }
        });
    }
    else {
        res.send({msg:"Sign up first"})
    }
})



app.get("/blogs", async (req, res) => {
    const {author,category} = req.query ;
    try {
        if( author ){
            const blogs = await BlogModel.find({Author:{$regex:author}})
            res.send({ blogs })
        }
        if( category ){
            const blogs = await BlogModel.find({Category:{$regex:category}})
            res.send({ blogs })
        }
        const blogs = await BlogModel.find()
        res.send({ blogs })
    }
    catch (err) {
        console.log(err)
        res.send({ msg: "something went wrong, please try again later" })
    }
})

app.use(authentication)
app.post("/blogs/add", async (req, res) => {
    const { Title, Category, Author,Content,Image } = req.body;
    const userID = req.userID
    const new_task = new BlogModel({
        Title,
        Category,
        Author,
        Content,
        Image,
        user_id: userID
    })
    try {
        await new_task.save()
        return res.send({ msg: "task successfully added" })
    }
    catch (err) {
        console.log(err)
        res.send({ msg: "something went wrong" })
    }
})


app.delete("/blogs/:blogsID", async (req, res) => {
    const { blogsID } = req.params
    try {
        const blogs = await BlogModel.findOneAndDelete({ _id: blogsID, user_id: req.userID })
        if (blogs) {
            res.send({ msg: "Task deleted successfully" })
        }
        else {
            res.send({ msg: "Task not found or you are not authorised to do this operation" })
        }
    }
    catch (err) {
        console.log(err)
        res.send({ msg: "something went wrong, please try again later" })
    }
})

const port = process.env.PORT
app.listen(port, async () => {
    try {
        await connection
        console.log("connected to db successfully")
    }
    catch (err) {
        console.log("error while connecting to DB")
        console.log(err)
    }
    console.log(`listening on port ${port}`)
})