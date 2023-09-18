const express = require('express')
/** @type {import("mongoose").Model} */
const Category = require('../models/category')
const router = express.Router()

//to get the categories
router.get('/',async (req,res)=>{
    // console.log(req.auth.credentials)
    const CategoryList = await Category.find()
    if(!CategoryList){
        res.status(500).json({success:false ,message:'Failed to fetch the category List',data:[]})
    }
    res.status(200).send({
        success:true,
        message : 'Fetching category List successfully!',
        data:CategoryList

    })
 })


 //to get the category based on id
 router.get('/:id' ,async (req,res)=>{
    const category = await Category.findById(req.params.id)

    if(!category){
        res.status(500).json({success:false,data:[],message : 'The category with given id was not found'})
    }
    res.status(200).send({
        success:true,
        message : 'Fetching the category with the given id successfully!',
        data:category
    })
 })


 //to add category
router.post('/' , async(req,res)=>{
    let category = new Category({
        name : req.body.name,
        icon : req.body.icon,
        color : req.body.color
    })
    category = await category.save();
    if(!category){
        res.status(400).send({success:false,data:[],message:'the category cannot be created!!'})
    }
    res.send({
        success:true,
        message : 'iNSERTED CATEGORY SUCCESSFULLY!',
        data:category
    })
})

router.put('/:id',async (req,res)=>{
    const category = await Category.findByIdAndUpdate(req.params.id , {
        name : req.body.name,
        icon : req.body.icon,
        color : req.body.color
    },{
        new:true
    })
    if(!category){
        res.status(400).send({success:false,data:[],message:'the category cannot be updated!!'})
    }
    res.send({success:true,
        message : 'Updated CATEGORY SUCCESSFULLY!',
        data:category})
})



//to delete category by id
router.delete('/:id' , (req,res)=>{
    Category.findByIdAndRemove(req.params.id)
    .then(category =>{
        if(category){
            return res.status(200).json({success:true , message:'The Category is deleted',data:category})
        } else{
            return res.status(404).json({success:false ,message: 'The Category is not found!'})
        }
    })
    .catch(err=>{
        return res.status(400).json({success:false,error : err ,data:[] ,message:'Operation failed'})
    })
})




module.exports = router