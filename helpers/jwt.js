const jwt = require('jsonwebtoken');


const verifyToken = async (req, res, next) => {
     const { authorization } = req.headers;
     try {
         const token = authorization.split(' ')[1];
          const jt = await jwt.verify(token, 'secret');
          console.log(jt)
          req['auth'] = {
            credentials : jt
          }
          next()
          //do something
     } catch (error) {
        console.log(error)
          res.status(401).send({
            success:false,
            message : 'You are unauthorised!',
            data:[]
          });
     }
     
}

module.exports = verifyToken