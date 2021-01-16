const apiRouter = require('express').Router()
const bcrypt = require('bcrypt')

const {
  createProduct,
  getProductById,
  getAllProducts,
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  createOrder,
  getOrdersByProduct,
  getAllOrders,
} = require('../db/index')

require('dotenv').config()
const jwt = require('jsonwebtoken')

const requireUser = (req, res, next) => {
  if (!req.user) {
    next({
      name: 'MissingUserError',
      message: 'You must be logged in to perform this action',
    })
  }

  next()
}

const requireActiveUser = (req, res, next) => {
  if (!req.user.active) {
    next({
      name: 'UserNotActive',
      message: 'You must be active to perform this action',
    })
  }
  next()
}

apiRouter.get('/', async (req, res, next) => {
  console.log('hitting api')
  try {
    console.log('inside main page try')
    res.send('Plant Gallerie Main Page')
  } catch (error) {
    next(error)
  }
})

apiRouter.get('/users', async (req, res, next) => {
  try {
    const allUsers = await getAllUsers()
    console.log('api try users', allUsers)
    res.send(allUsers)
  } catch (error) {
    next(error)
  }
})

apiRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body
  console.log('this is body', req.body)

  if (!username || !password) {
    throw 'u need user name and password'
  }

  try {
    const user = await getUserByUsername(username)
    console.log('this is user', user)

    if (user && user.password == password) {
      await bcrypt.compare(password, user.password)
      res.send({
        message: "you're logged in!",
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2MDc2NTQzNTR9.p-RxeCLsZlUncNqNlKdProbc68gvNSTeucy9UwjO8CE',
      })
    } else {
      throw 'u need user name and password agaian'
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

apiRouter.post('/register', async (req, res, next) => {
  console.log('here in register')
  const {
    firstName,
    lastName,
    email,
    imageURL,
    username,
    password,
    isAdmin,
  } = req.body

  console.log('here in register 1')
  console.log(req.body, 'this is body')

  try {
    console.log('here in register 6')
    const _user = await getUserByUsername(username)
    console.log(_user, 'this is user')

    if (_user) {
      console.log('inside user try')
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists',
      })
    }
    console.log('here in register 7')
    const user = await createUser({
      firstName,
      lastName,
      email,
      imageURL,
      username,
      password,
      isAdmin,
    })

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: '4w',
      },
    )

    res.send({
      message: 'welcome! you are signed Up!',
      token,
    })
  } catch (error) {
    next(error)
  }
})

apiRouter.get('/users/:id', async (req, res, next) => {
  console.log('getting user by id')
  try {
    console.log('getting user by id inside try')
    const oneUser = await getUserById(req.params.id)
    console.log('user is', oneUser)
    res.send(oneUser)
  } catch (error) {
    next(error)
  }
})

apiRouter.get('/products', async (req, res, next) => {
  try {
    console.log('inside try for getting all products')
    const allProducts = await getAllProducts()
    res.send(allProducts)
  } catch (error) {
    next(error)
  }
})

apiRouter.get('/products/:productId', async (req, res, next) => {
  const id = req.body.productId
  console.log('the product id is', id)
  try {
    console.log('inside the try for getting product by ID')
    const requestedProduct = await getProductById(id)
    res.send(requestedProduct)
  } catch (error) {
    next(error)
  }
})

apiRouter.post('/createproduct', async (req, res, next) => {
  const { name, description, price, imageURL, inStock, category } = req.body
  console.log('The req.body is', req.body)
  try {
    const newProduct = await createProduct({
      name,
      description,
      price,
      imageURL,
      inStock,
      category,
    })
    res.send(newProduct)
  } catch (error) {
    throw error
  }
})

apiRouter.get('/orders/cart', async (req, res, next) => {
  try {
    if (id) {
      const user = await getUserById(id)
    }
    if (user) {
      const userOrders = await getCartByUser({ id })
      res.send(userOrders)
    } else {
      res.send({ message: 'there are no orders here' })
    }
  } catch (error) {
    throw error
  }
})

apiRouter.post('/orders', async (req, res, next) => {
  console.log('hitting create order')
  // const { userId = req.user.id } = req.body
  // const orderData = {}
  try {
    // orderData.status = status
    // orderData.userId = userId

    const newOrder = await createOrder(req.body)
    res.send(newOrder)
  } catch (error) {
    next(error)
  }
})

apiRouter.get('/orders', async (req, res) => {
  const id = req.params.id
  console.log(id)
  try {
    const allOrders = await getAllOrders()
    console.log(allOrders)
    res.send(allOrders)
  } catch (error) {
    throw error
  }
})

apiRouter.get('/users/:userId/orders', async (req, res) => {
  console.log('inside getting products by id')
  console.log('this is id', req.params.id)
  try {
    const orders = await getOrdersByProduct(req.params.id)
    console.log(orders)
    res.send(orders)
  } catch (error) {
    throw error
  }
})

module.exports = apiRouter
