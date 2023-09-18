const express = require('express')

const router = express.Router()

/** @type {import("mongoose").Model} */
const Product = require('../models/product')
/** @type {import("mongoose").Model} */
const Category = require('../models/category')

const mongoose = require('mongoose')
const randomstring = require('randomstring')
const multer = require('multer')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      
      cb(null, `${randomstring.generate()}${file.originalname.split(' ').join('-')}`)
    }
  })

  const uploadOptions = multer({ storage: storage })

//to get all the product details
router.get('/',async (req,res)=>{
    const products = await Product.find().populate('category' )

    if(!products){
       return  res.status(500).json({success : false , message : 'The products  was not found' ,data : []})
    }
    res.status(200).send({
        success:true,
        message:'Fetching Products list successfully!',
        data:products
    })
 })

//to get the productss list with id
 router.get('/:id',async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category')

    if(!product){
        return res.status(500).json({success:false,message : 'The product with given id  was not found',data:[]})
    }
    res.status(200).send({
        success  :true,
        message:'Fetching Product with given id successfully',
        data:product
    })
 })


 //to post the product list
router.post('/',uploadOptions.single('image'),async (req,res)=>{
    const category = await Category.findById(req.body.category)
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    const file = req.file
    if(!file){
        return res.status(400).send({
            success:false,
            message : 'File Not Exist in the payload!',
            data:[]
        })
    }
    if(!category) return res.status(400).send('Invalid Category')
    let product = new Product({
        name : req.body.name,
        description:req.body.description,
        richDescription :req.body.richDescription,
        image:`${basePath}${file.filename}`,
        images : req.body.images ?req.body.images :[] ,
        brand : req.body.brand,
        price:req.body.price,
        category :req.body.category,
        countInStock : req.body.countInStock,
        rating:req.body.rating,
        isFeatured:req.body.isFeatured,
        
    })
    product = await product.save()
    if(!product){
        return res.status(500).send({success:false , message:'The Product cannot be creaated!' ,data:[]})
    }
    res.send({
        success : true,
        message : 'Product Inserted Successfully',
        data:product
    })
  
})

//to update product
router.put('/:id',uploadOptions.single('image'),async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send({success:false , message:'Invalid Category' ,data:[]})

    const product = await Product.findById(req.params.id)
    if(!product){
        return res.status(500).send({success:false , message:'The Product is not created inorder to update' ,data:[]})
    }

    const file = req.file
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    let image =''

    if(file){
        image = `${basePath}${randomstring.generate()}${file.filename}`
    }else{
        image = product.image
    }

  

    const product1 = await Product.findByIdAndUpdate(req.params.id , {
        name : req.body.name,
        description:req.body.description,
        richDescription :req.body.richDescription,
        image:image,
        brand : req.body.brand,
        price:req.body.price,
        category :req.body.category,
        countInStock : req.body.countInStock,
        rating:req.body.rating,
        isFeatured:req.body.isFeatured,
    },{
        new:true
    })
    if(!product1){
        return res.status(400).send({success:false , message:'The Product cannot be updated!' ,data:[]})
    }
    res.send({
        success:true,
        message : 'Product Updated successfully!',
        data:product1
    })
})


//to delete product by id
router.delete('/:id' , (req,res)=>{

    Product.findByIdAndRemove(req.params.id)
    .then(product =>{
        if(product){
            return res.status(200).json({success:true , message:'The product is deleted' ,data:product})
        } else{
            return res.status(404).json({success:false ,message: 'The product is not found!'})
        }
    })
    .catch(err=>{
        return res.status(400).json({success:false,message:'Operation failed', error : err,data:[]})
    })
})


router.get('/get/count',async (req,res)=>{
    const productCount = await Product.count()

    
    res.status(200).send({
        success : true,
        message : 'Product Count Fetched Successfully',
        data:productCount
    })
 })


 router.get('/get/featured/:count',async (req,res)=>{
    const count =  +req.params.count ?req.params.count : 0
    const Products = await Product.find({isFeatured : true}).limit(count)
    res.status(200).send({
        success:true,
        message : 'Featured Products fetched Successfully!',
        data:Products 
    })
 })

 router.post('/categories',async (req,res)=>{
    let categories = req.body.categories
    console.log(categories)
    try{
        if(categories && !categories.length){
           return  res.status(500).json({success : false , message : 'The products  was not found' ,data : []})
        }
    
        let products = await Product.find({"category":{$in:categories}}).populate('category')
    
        res.status(200).send({
            success:true,
            message:'Fetching Products list successfully!',
            data:products
        })

    }catch(err){
        console.log(err)
    }
    
 })
 router.put('/gallery-images/:id',uploadOptions.array('images') ,async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    }
    let files = req.files
    console.log(files)
    let imagePaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    if(files && files.length){
        for(let file of files){
            imagePaths.push(`${basePath}${randomstring.generate()}${file.filename}`)
        }
    }else{
        return res.status(400).send({success:false , message:'There are no files!' ,data:[]})
    }
    const product = await Product.findByIdAndUpdate(req.params.id , {
       
        images : imagePaths,
        
    },{
        new:true
    })
    if(!product){
        return res.status(400).send({success:false , message:'The image files of product  cannot be updated!' ,data:[]})
    }
    res.send({
        success:true,
        message : 'Product Updated successfully!',
        data:product
    })


 })


module.exports = router
