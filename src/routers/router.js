const express = require('express')
const router = express.Router()
const {authentication} = require("../middlewares/commonMiddle")
const {loginUser,createUser} = require("../controllers/userController")
const {createBooks, getBook, updateBook, deleteBook,getBookById} = require("../controllers/bookController")
const {createReview,deleteReview,reviewUpdate }= require("../controllers/reviewController")
const aws= require("aws-sdk")
//=======================AWS Entry========================================//
aws.config.update({
      accessKeyId: "AKIAY3L35MCRZNIRGT6N",
      secretAccessKey: "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",
      region: "ap-south-1"
  })

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }
    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })
   })
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})

//============user>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.......
router.post("/register", createUser)
router.post("/login", loginUser)

//book
router.post("/books", authentication, createBooks)
router.get("/books", authentication, getBook)
router.get("/books/:bookId", authentication, getBookById)
router.put("/books/:bookId", authentication, updateBook)
router.delete("/books/:bookId", authentication, deleteBook );

//review 
router.post("/books/:bookId/review", createReview ) 
router.put("/books/:bookId/review/:reviewId",reviewUpdate)
router.delete("/books/:bookId/review/:reviewId",deleteReview) 



router.all("/*", (req, res) => {
      res.status(400).send({ status: false, message: "This page does not exist, please check your url" })
})

module.exports = router
