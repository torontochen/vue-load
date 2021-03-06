const express = require('express')
const http = require('http')
const {
  ApolloServer,
  AuthenticationError,
  PubSub
} = require('apollo-server-express')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const pubsub = new PubSub()

const app = express()
const PORT = process.env.PORT || 4000

// Designate the download folder
app.use("/download", express.static("download"))

// Desigante the /dist as static files
app.use(express.static(__dirname + "/dist/"))

// Specify the fold of index.html
app.get(/.*/, function (req, res) {
  res.sendFile(__dirname + "/dist/index.html")
})

// Import typeDefs and resolvers
const filePath = path.join(__dirname, 'typeDefs.gql')
const typeDefs = fs.readFileSync(filePath, 'utf-8')
const resolvers = require('./resolvers')

// Import Env Variables and Mongoose Modles
require('dotenv').config({
  path: 'variables.env'
})
const User = require('./models/User')
const Picture = require('./models/Picture')



// Connect to mongodb databse
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => console.log('MongoDB is Connected'))
  .catch(err => console.error(err))


// Verify JWT Token from client side
const getUser = async token => {
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET)
    } catch (err) {
      throw new AuthenticationError('Your Token has Expired, Please sign in again')
    }
  }
}

// Set up Apollo/Graphql Server using typeDefs, resolvers and context object
const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: {
    maxFieldSize: 10000000,
    maxFiles: 10
  },
  formatError: error => ({
    name: error.name,
    message: error.message.replace('Context creation failed:', '')

  }),
  context: async ({
    req,
    connection
  }) => {
    const token = connection ? connection.context['Authorization'] : req.headers['authorization']
    return {
      User,
      Picture,
      currentUser: await getUser(token),
      pubsub
    }
  }
})

// Set up Cors
// const corsOptions = {
//   credentials: true,
//   origin: 'http://localhost:8080'
// }

server.applyMiddleware({
  app,
  // cors: corsOptions,
  bodyParserConfig: {
    limit: "50mb"
  }
})

// Set up Subscription Handlers
const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(PORT, () => {
  console.log(`Server ready at https://vueload.herokuapp.com:${PORT}${server.graphqlPath}`)
  console.log(`Subscription ready at wss://vueload.herokuapp.com:${PORT}${server.subscriptionsPath}`)
})
