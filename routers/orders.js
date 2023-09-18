/** @type {import("mongoose").Model} **/
const Order = require('../models/order')
const mongoose = require('mongoose')
/** @type {import("mongoose").Model} **/
const OrderItem = require("../models/orderItem")
const router = require("./users")


//to get the Orders
router.get('/',async (req,res)=>{
    const ordersList = await Order.find().select('user','name').sort({'dateOrdered':-1})
    if(!ordersList){
        res.status(500).json({success:false ,message:'Failed to fetch the orders List',data:[]})
    }
    res.status(200).send({
        success:true,
        message : 'Fetching usersList List successfully!',
        data:ordersList

    })
 })


  //to add category
router.post('/' , async(req,res)=>{


    let orderItemIds = Promise.all(req.body.orderItems.map(async orderItem=>{
        let newOrderItem = new OrderItem({
            quantity : orderItem.quantity,
            product:orderItem.product
        })

        newOrderItem =await newOrderItem.save()
        return newOrderItem.id
    }))

    orderItemIds = await orderItemIds


    let totalPrices =await  Promise.all(orderItemIds.map(async orderItemId =>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product' , 'price')
        const totalPrice =orderItem.product.price * orderItem.quantity
        return totalPrice
    }))
    console.log(totalPrices)
    let totalPrice = totalPrices.reduce((a,b)=> a+b , 0)
    console.log(orderItemIds ,"orderItemIds")
    let order = new Order({
        orderItems : orderItemIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2:req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        totalPrice:totalPrice,
        user:req.body.user,
        status:req.body.status,
        user:req.body.user,
    })
    order = await order.save();
    if(!order){
        res.status(400).send({success:false,data:[],message:'the order cannot be created!!'})
    }
    res.send({
        success:true,
        message : 'iNSERTED order SUCCESSFULLY!',
        data:order
    })
})


// to get the Orders by id
router.get('/:id',async (req,res)=>{
    const order= await Order.findById(req.params.id)
    .populate('user','name')
    .populate({path : 'orderItems' , populate:{ path : 'product' ,populate : 'category'}})
    if(!order){
        res.status(500).json({success:false ,message:'Failed to fetch the order List',data:[]})
    }
    res.status(200).send({
        success:true,
        message : 'Fetching ordders List successfully!',
        data:orders

    })
 })


 router.put('/:id',async (req,res)=>{
    const order = await Order.findByIdAndUpdate(req.params.id , {
       status : req.body.status
    },{
        new:true
    })
    if(!order){
        res.status(400).send({success:false,data:[],message:'the category cannot be updated!!'})
    }
    res.send({success:true,
        message : 'Updated order SUCCESSFULLY!',
        data:order})
})


//to delete order by id
router.delete('/:id' , (req,res)=>{
    Order.findByIdAndRemove(req.params.id)
    .then(async order =>{
        if(order){
            await order.orderItems.map(async orderItem=>{
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success:true , message:'The order is deleted',data:order})
        } else{
            return res.status(404).json({success:false ,message: 'The order is not found!'})
        }
    })
    .catch(err=>{
        return res.status(400).json({success:false,error : err ,data:[] ,message:'Operation failed'})
    })
})


router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send({message:'The order sales cannot be generated' ,success:false,data:[]})
    }

    res.send({success: true ,message:'Totalsales fetching successfully',data: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.count()

    if(!orderCount) {
        res.status(500).json({success: false , message : 'Faailed to fetch count ' , data:[]})
    } 
    res.send({
        success : true,
        orderCount: orderCount,
        message : 'Fetching orders count'
    });
})

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false , message : 'failed to fetch userOrders' ,data:[]})
    } 
    res.send({success:true,data:userOrderList , message : 'Fetching user orders'});
})



module.exports = router
