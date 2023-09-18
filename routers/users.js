/** @type {import("mongoose").Model} **/
const User = require('../models/user')
const mongoose = require('mongoose')
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const jwt = require('jsonwebtoken')



//to get the Users
router.get('/',async (req,res)=>{
    const usersList = await User.find().select('name phone email')
    if(!usersList){
        res.status(500).json({success:false ,message:'Failed to fetch the users List',data:[]})
    }
    res.status(200).send({
        success:true,
        message : 'Fetching usersList List successfully!',
        data:usersList

    })
 })

 //to get the user based on id
 router.get('/:id' ,async (req,res)=>{
    const user = await User.findById(req.params.id)

    if(!user){
        res.status(500).json({success:false,data:[],message : 'The user with given id was not found'})
    }
    res.status(200).send({
        success:true,
        message : 'Fetching the user with the given id successfully!',
        data:user
    })
 })
  

 //to add user
 router.post('/' , async(req,res)=>{
    let user = new User({
        name : req.body.name,
        email : req.body.email,
        passwordHash : bcrypt.hashSync(req.body.password,10),
        phone : req.body.phone,
        isAdmin : req.body.isAdmin,
        street : req.body.street,
        apartment : req.body.apartment,
        zip : req.body.zip,
        city : req.body.city,
        country : req.body.country
    })
    user = await user.save();
    if(!user){
        res.status(400).send({success:false,data:[],message:'the user cannot be created!!'})
    }
    res.send({
        success:true,
        message : 'User created  SUCCESSFULLY!',
        data:user
    })
})


//to update user
router.put('/:id',async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid User Id')
    }
    const userExist = await User.findById(req.params.id)
    let newPassword 
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password,10)
    }else{
        newPassword = userExist.passwordHash
    }
    const user = await User.findByIdAndUpdate(req.params.id , {
        name : req.body.name,
        email : req.body.email,
        passwordHash : newPassword,
        phone : req.body.phone,
        isAdmin : req.body.isAdmin,
        street : req.body.street,
        apartment : req.body.apartment,
        zip : req.body.zip,
        city : req.body.city,
        country : req.body.country
    },{
        new:true
    })
    if(!user){
        return res.status(400).send({success:false , message:'The User cannot be updated!' ,data:[]})
    }
    res.send({
        success:true,
        message : 'User Updated Succesfully!',
        data:user
    })
})


//api login
router.post('/login',async(req,res)=>{
    const user = await User.findOne({email : req.body.email})
    if(!user){
        return res.status(400).send({
            success:false,
            message: 'User not found',
            data:[]
        })
    }
    console.log(bcrypt.compareSync(req.body.password,user.passwordHash))

    if(user  && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token = jwt.sign(
            {
                userId:user.id,
                isAdmin : user.isAdmin
            },
            'secret',
            {
                expiresIn:'1d'
            }
        )
        res.status(200).send({
        success:true,
        message : 'user found!',
        data:{email:user.email , token:token}
        })
    }else{

        return res.status(200).send({
            success:false,
            message : 'password is wrong',
            data:[]
        })
    }

})


//to delete user by id
router.delete('/:id' , (req,res)=>{

    User.findByIdAndRemove(req.params.id)
    .then(user =>{
        if(user){
            return res.status(200).json({success:true , message:'The user is deleted' ,data:user})
        } else{
            return res.status(404).json({success:false ,message: 'The user is not found!'})
        }
    })
    .catch(err=>{
        return res.status(400).json({success:false,message:'Operation failed', error : err,data:[]})
    })
})

//to get the count of users
router.get('/get/count',async (req,res)=>{
    const userCount = await User.count()

    
    res.status(200).send({
        success : true,
        message : 'User Count Fetched Successfully',
        data:userCount
    })
 })






module.exports = router 