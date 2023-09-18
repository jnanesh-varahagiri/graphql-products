const express = require('express')
require('dotenv/config')
const app =express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const verifyToken = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler.js')
const {ApolloServer} = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const fs = require('fs/promises')
const { resolvers } = require('./resolvers')

//models
const Product = require('./models/product')



async function main(){
    const typeDefs = await fs.readFile('./schema.graphql','utf-8')
    const apolloServer = new ApolloServer({typeDefs , resolvers})
        
    
    
     apolloServer.start().then(()=>{
        console.log('apollo server started')
        app.use('/graphql',expressMiddleware(apolloServer))
    }) 


//routers
const Productrouters = require('./routers/products')
const CategoryRouters = require('./routers/categories')
const UserRouters = require('./routers/users')
const orderRouters = require('./routers/orders')
const { readFile } = require('fs')

 
const api =process.env.API_URL;



//middleware
app.use(cors())
app.options('*',cors())
app.use('/public/uploads',express.static(__dirname+ '/public/uploads'))
app.use(express.json())
app.use(morgan('tiny'))

// app.use(verifyToken)



//routers
// app.use(`${api}/products` ,verifyToken,Productrouters)
// app.use(`${api}/categories`,verifyToken,CategoryRouters)
// app.use(`${api}/orders` , verifyToken ,orderRouters )
// app.use(`${api}/users` , UserRouters)
app.use(`${api}/products` ,Productrouters)
app.use(`${api}/categories`,CategoryRouters)
app.use(`${api}/orders` , orderRouters )
app.use(`${api}/users` , UserRouters)
app.use(errorHandler)







mongoose.connect(process.env.CONNECTION_STRING , {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    dbName : 'eshop1'
})
.then(()=>{
    console.log('Data base collection is reaady');
})
.catch((err)=>{
    console.log(err)
})
app.listen(3000 , ()=>{
    console.log(api)
    console.log('server is running localhost:3000')
})
}

main();

