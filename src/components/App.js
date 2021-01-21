import React, { useState, useEffect } from "react";
import { Switch, Route, useHistory, Link } from "react-router-dom";
import {
	fetchAPI,
	BASE_URL,
	auth,
	getToken,
	clearToken,
	getActiveUser,
} from "../api";
import "./Home.css";
import {
	AllProducts,
	SingleProduct,
	Header,
	Login,
	FloweringPlants,
	BonsaiPlants,
	HousePlants,
	Home,
	Register,
} from "./index";
import CartComponent from "./Cart";
import SingleOrder from "./SingleOrder";
import Payment from "./Payment";

const App = () => {
	const history = useHistory();

	const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
	const [message, setMessage] = useState("");
	const [productList, setProductList] = useState([]);
	const [activeProduct, setActiveProduct] = useState("");
	const [cartData, setCartData] = useState([]);
	const [count, setCount] = useState(1);
	const [activeUser, setActiveUser] = useState("");

	useEffect(() => {
		fetchAPI(BASE_URL + "/")
			.then((response) => {
				setMessage(response.message);
			})
			.catch((error) => {
				setMessage(error.message);
			});
	}, []);

	useEffect(() => {
		fetchAPI(BASE_URL + "/products")
			.catch(console.error)
			.then((data) => {
				console.log("this is data", data);
				data.map((product) => {
					let newPrice = product.price / 100;
					product.price = newPrice;
				});
				setProductList(data);
			});
	}, []);

	useEffect(() => {
		getActiveUser()
			.then((data) => {
				setActiveUser(data);
			})
			.catch(console.error);
	}, [isLoggedIn]);

	console.log("The cart data is", cartData);
	console.log("the active user is", activeUser);

	//going to have to make this a function in the api folder and possibly use params for userID instead of body
	// useEffect(() => {
	// 	if (activeUser) {
	// 		fetchAPI(BASE_URL + "/orders/cart", "GET", activeUser.id)
	// 			.then((data) => {
	// 				data.products.map((product) => {
	// 					let newPrice = product.price / 100;
	// 					product.price = newPrice;
	// 				});
	// 				setCartData(data.products);
	// 			})
	// 			.catch(console.error);
	// 	}
	// }, [activeUser]);

	return (
		<>
			<Header
				activeUser={activeUser}
				setActiveUser={setActiveUser}
				setIsLoggedIn={setIsLoggedIn}
				isLoggedIn={isLoggedIn}
				history={history}
				clearToken={clearToken}
			/>
			<main className="wrapper">
				<Switch>
					<Route exact path="/" component={Home} />
					<Route path={`/products/:productId`}>
						<SingleProduct
							activeProduct={activeProduct}
							setActiveProduct={setActiveProduct}
							history={history}
							count={count}
							setCount={setCount}
							cartData={cartData}
							setCartData={setCartData}
						/>
					</Route>
					<Route exact path="/products">
						<AllProducts
							productList={productList}
							history={history}
							setActiveProduct={setActiveProduct}
						/>
					</Route>
					<Route exact path="/houseplants">
						<HousePlants
							productList={productList}
							setActiveProduct={setActiveProduct}
							history={history}
						/>
					</Route>
					<Route exact path="/floweringplants">
						<FloweringPlants
							productList={productList}
							setActiveProduct={setActiveProduct}
							history={history}
						/>
					</Route>
					<Route exact path="/bonsaiplants">
						<BonsaiPlants
							productList={productList}
							setActiveProduct={setActiveProduct}
							history={history}
						/>
					</Route>
					<Route exact path="/login">
						<Login setIsLoggedIn={setIsLoggedIn} history={history} />
					</Route>
					<Route exact path="/register">
						<Register setIsLoggedIn={setIsLoggedIn} />
					</Route>
					<Route path="/cart">
						<CartComponent cartData={cartData} setCartData={setCartData} />
					</Route>

					<Route path="/payment">
						<Payment
							productList={productList}
							setProductList={setProductList}
						/>
					</Route>
				</Switch>
			</main>
		</>
	);
};

export default App;
