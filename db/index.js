// // Connect to DB
const { Client } = require("pg");
const bcrypt = require("bcrypt");

const DB_NAME = "plant-gallery";
const DB_URL =
	process.env.DATABASE_URL || `postgres://localhost:5432/${DB_NAME}`;
const client = new Client(DB_URL, { username: "postgres" });

const createUser = async ({
	firstName,
	lastName,
	email,
	imageURL,
	username,
	password,
}) => {
	try {
		console.log("creating users");

		const {
			rows: [user],
		} = await client.query(
			`
    INSERT INTO users("firstName","lastName" ,email,"imageURL", username , password )
    VALUES($1,$2,$3,$4,$5,$6)
    RETURNING *; 
    `,
			[firstName, lastName, email, imageURL, username, password]
		);

		const hashPassword = await bcrypt.hash(user.password, 5);

		user.password = hashPassword;

		return user;
	} catch (error) {
		console.log("cant create user");
		throw error;
	}
};

const getAllUsers = async () => {
	console.log("users live here");
	try {
		const { rows: allUsers } = await client.query(`
    SELECT * 
    FROM users;
 `);
		console.log("these are users", allUsers);
		allUsers.map((user) => {
			return delete user.password;
		});
		return allUsers;
	} catch (error) {
		throw error;
	}
};

const getUser = async ({ username, password }) => {
  try {
    console.log('inside get user')
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT username, password,id
    FROM users
    WHERE username=$1 AND password=$2;
    `,
			[username, password]
		);

    console.log('this is username', username)
    console.log('this is password', password)
    console.log('this is user ', user.id)

		return user;
	} catch (error) {
		throw error;
	}
};

const getUserById = async (id) => {
	try {
		const {
			rows: [user],
		} = await client.query(
			`
    SELECT *
    FROM users
    WHERE id=$1;
    `,
			[id]
		);
		delete user.password;
		return user;
	} catch (error) {
		throw error;
	}
};

const getUserByUsername = async ({ username }) => {
  console.log('inside db')
  console.log('this is insdide db usrername ', username)
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT *
    FROM users 
    WHERE username=$1;
    `,
			[username]
		);

		console.log("username", username);
		console.log("required user is ", user);

		console.log("existing user by user function");
		return user;
	} catch (error) {
		throw error;
	}
};

const createProduct = async ({
	name,
	description,
	price,
	imageURL,
	inStock,
	category,
}) => {
	try {
		const {
			rows: [product],
		} = await client.query(
			`
  INSERT INTO products (name, description, price,"imageURL", "inStock",category)
  VALUES($1,$2,$3,$4,$5,$6)
  RETURNING *;
  `,
      [name, description, price, imageURL, inStock, category],
    )

    await createOrderProducts({ product })
    return product
  } catch (error) {
    throw error
  }
}

const getAllProducts = async () => {
  try {
    const { rows: allProducts } = await client.query(`
    SELECT *
    FROM products;
    `)
    return allProducts
  } catch (error) {
    throw error
  }
}

const getProductById = async (id) => {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
    SELECT * 
    FROM products
    WHERE id=$1;
    `,
      [id],
    )

    if (!product) {
      throw {
        message: 'Could not find a product with that name/id',
      }
    }

    return product
  } catch (error) {
    throw error
  }
}

const createOrder = async ({ status, userId, products }) => {
  try {
    console.log('creating order')
    const {
      rows: [order],
    } = await client.query(
      `
      INSERT INTO orders(status,"userId")
      VALUES($1, $2)
      RETURNING *;
    `,
      [status, userId],
    )
    console.log('making orders')
    order.datePlaced = new Date()

    const productList = await createOrderProducts(products)
    console.log('this is productlist', productList)
    const newOrder = await addProductsToOrder(order.id, productList)
    return newOrder
  } catch (error) {
    throw error
  }
}

const getAllOrders = async () => {
	try {
		const { rows: allOrders } = await client.query(`
    SELECT *
    FROM orders;
    `);
		const orders = await Promise.all(
			allOrders.map((order) => {
				return getOrdersByProduct(order.id);
			})
		);

		return orders;
	} catch (error) {
		throw error;
	}
};

const getOrdersByUser = async (userId) => {
	try {
		const { rows: OrderIds } = await client.query(`
    SELECT id
    FROM orders
    WHERE "userId"=${userId};
    `);
		const orders = await Promise.all(
			OrderIds.map((order) => getOrderById(order.id))
		);
		return orders;
	} catch (error) {
		throw error;
	}
};

const getOrderById = async (orderId) => {
	try {
		const {
			rows: [order],
		} = await client.query(
			`
    SELECT *
    FROM orders
    WHERE id=$1; 
    `,
			[orderId]
		);
		console.log("order", order);
		return order;
	} catch (error) {
		throw error;
	}
};


const getCartByUser = async (user) => {
  try {
    const { rows: userCart } = await client.query(
      `

    SELECT *
    FROM orders
    JOIN products ON 
    WHERE "userId"=$1 AND status='created';
    `,
      [user],
    )
    const orders = await Promise.all(
      userCart.map((order) => getOrderById(order.id)),
    )
    return orders
  } catch (error) {
    throw error
  }
}

async function createOrderProducts(productId) {
  console.log('here')
  const product = await getProductById(productId)
  const order = console.log(
    'prodcts is indside creatre odere products',
    product.id,
  )

  const newProd = await getOrdersByProduct(product.id)
  console.log('this is new product', newProd)

  try {
    await client.query(
      `
        INSERT INTO order_products("productId", "orderId", price, quantity)
        VALUES($1, $2, $3, $4);
      `,
      [
        product.productId,
        product.orderId,
        product.price,
        (product.quantity = 1),
      ],
    )

    const { rows } = await client.query(`
      SELECT * FROM order_products
      WHERE "orderId"
      IN (${product[0].orderId})
    `)
    console.log('this is row', rows)
    return rows
  } catch (error) {
    throw error
  }
}

const getOrdersByProduct = async (id) => {
  try {
    const { rows: order } = await client.query(
      `

      SELECT *
      FROM order_products
      JOIN orders ON order_products."orderId" = orders.id
      JOIN products ON order_products."productId"=$1;
    `,
			[id]
		);
		console.log("this is product id", ordersIds.productId);
		const allProducts = ordersIds.map((order) => {
			return getOrdersByUser(order.id);
		});
		return allProducts;
	} catch (error) {
		throw error;
	}
};

const getOrderByProductId = async (id) =>{
  try{
const {rows: [orderProduct]} = await client.query(`
SELECT * 
FROM order_products
WHERE id=$1;
`, [id]);
return orderProduct;

  }catch(error){
    throw(error)
  }
}
const getOrderProductByOrderId = async (orderId) => {
  try{
    const {rows: [orderProduct]} = await client.query(`
SELECT * 
FROM order_products
WHERE "orderId"=$1;
`, [orderId]);
return orderProduct;

  }catch(error){
    throw error;
  }
}

const addProductToOrder = async ({orderId, productId, price, quantity}) => {
  try{
    const orderProduct = await getOrderProductByOrderId(id);

    if(orderProduct.length < 1){
      const {rows: [productOrdered] } = await client.query(`
      INSERT INTO order_products ("productId", "orderId", price, quantity)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `, [[productId, orderId, price, quantity]])
      return productOrdered
    }
    else{
      for(let i=0; i< orderProduct.length; i++){
        if(orderProduct[i].productId === productId){
          const {rows: [productOrder]} = await client.query(`
                    UPDATE order_products SET (price, quantity) = 
                    ($1, $2) WHERE "productId" = $3 AND "orderId" = $4
                    RETURNING *
                `, [ price, quantity,productId, orderId])

               return productOrder
        
      }else if (orderProduct[orderProducts.length-1].productId !== productId && i === orderProduct.length-1){
          const {rows: [productOrder]} = await client.query(`
          INSERT INTO order_products ("productId", "orderId", price, quantity)
          VALUES ($1, $2, $3, $4)
          RETURNING *`, [productId,orderId, price, quantity])
          return productOrder;
      }
    }
  }
  }catch (error){
    throw error;
  }
}



const updateOrderProduct = async ({id, price, quantity}) =>{

  try{
    const originalOrderProduct = await getOrderByProductId(id);

    if(!price){
      originalOrderProduct.price = price;
    }
    if(!quantity){
      originalOrderProduct.quantity = quantity;
    }

    const {rows: [orderProduct]} = await client.query(`

    UPDATE order_products original
    SET price=$2,
    quantity=$3
    WHERE original.id=$1
    RETRUNING *;
    `, [id,price,quantity]);
    console.log("update order produc", orderProduct)
    return orderProduct;

  }catch(error){
    throw error
  }
}
const destroyOrderProduct = async (id) =>{
  console.log("the id is ", id)
  try{
    const { rows: [orderProduct] } = await client.query(`
      DELETE FROM order_products
      WHERE id=$1
      RETURNING *
      `, [id]);
      return orderProduct;

  }catch(error){
    throw error
  }
}

async function getOrderProductsByOrderId(orderId){
  try {
      const {rows: orderProducts} = await client.query(`
          SELECT * FROM order_products
          WHERE "orderId" = $1
      `,[orderId])
      return orderProducts
  } catch (error) {
      console.error(error)
  }
}


module.exports = {
	client,
	createUser,
	getAllUsers,
	getUserById,
	getUserByUsername,
	createProduct,
	getProductById,
	getAllProducts,
	getCartByUser,
	createOrder,
	getOrdersByProduct,
	getAllOrders,
	getOrderById,
	getUser,
};

