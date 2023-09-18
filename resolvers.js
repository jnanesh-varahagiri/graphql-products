const  { getCategories, getProducts, getCategoriesById} = require('./querys/categories')

const resolvers = {
    Query:{
        category:async ()=>{
            return getCategories()
        },
        product: async()=>{
            return getProducts()
        }
    },

     Category : {
        name:(category)=>{
            return category.name+'Jnanesh'
        }
     },

     Product : {
        category:(product ,category ,ctx,info)=>{
            console.log(category)
            return getCategoriesById(product.category)
        }
     }
}

module.exports.resolvers = resolvers