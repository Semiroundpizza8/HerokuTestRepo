import React from 'react'

const FloweringPlants = (props) => {
  const { productList, setActiveProduct, history, search, setSearch } = props

  return (
    <>
      <h1 className="productsHeader">Flowering</h1>
      <div className="allProducts">
        {productList.map((product, index) => {
          if (product.category === 'Flowering') {
            return (
              <div
                className="productCard"
                id="modal"
                key={index}
                onClick={(event) => {
                  event.preventDefault()
                  setActiveProduct(product)
                  history.push(`/products/${product.name}/${product.id}`)
                }}
              >
                <img
                  src={product.imageURL}
                  alt="flowering plant"
                  height="200"
                  width="200"
                ></img>
                <p className="productName">{product.name}</p>
                <p className="productPrice">${product.price}</p>
              </div>
            )
          }
          return
        })}
      </div>
    </>
  )
}

export default FloweringPlants
