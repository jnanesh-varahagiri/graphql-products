const express = require('express')
/** @type {import("mongoose").Model} */
const Category = require('../models/category')
const Product = require('../models/product')
const router = express.Router()


module.exports.getCategories = async ()=>{
    const CategoryList = await Category.find()
    return CategoryList
}

module.exports.getProducts = async()=>{
    const products = await Product.find()
    return products
}

module.exports.getCategoriesById = async(id)=>{
    const category = await Category.findById(id)
    return category
}
