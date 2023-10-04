// Write your code here
import Cookies from 'js-cookie'
import {Component} from 'react'
// import {Redirect} from 'react-router-dom'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Header from '../Header'
import './index.css'
import SimilarProductItem from '../SimilarProductItem'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  inProgress: 'IN_PROGRESS',
  failure: 'FAILURE',
}

class ProductItemDetails extends Component {
  state = {
    productDetails: {},
    count: 1,
    similarProducts: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getProductDetails()
  }

  onDecrement = () => {
    const {count} = this.state
    if (count > 1) {
      this.setState(prevState => ({count: prevState.count - 1}))
    }
  }

  onIncrement = () => {
    this.setState(prevState => ({count: prevState.count + 1}))
  }

  getUpdatedData = data => ({
    availability: data.availability,
    brand: data.brand,
    description: data.description,
    id: data.id,
    imageUrl: data.image_url,
    price: data.price,
    rating: data.rating,
    style: data.style,
    title: data.title,
    totalReviews: data.total_reviews,
  })

  getProductDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const {match} = this.props
    const {params} = match
    const {id} = params
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(apiUrl, options)
    if (response.ok === true) {
      const data = await response.json()
      console.log(data)
      const updatedData = this.getUpdatedData(data)
      const similarProductsData = data.similar_products.map(eachProduct =>
        this.getUpdatedData(eachProduct),
      )
      console.log(similarProductsData)
      this.setState({
        productDetails: updatedData,
        similarProducts: similarProductsData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  onClickContinueShopping = () => {
    const {history} = this.props
    history.replace('/products')
  }

  renderLoaderView = () => (
    <div data-testid="loader" className="loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderProductsView = () => {
    const {productDetails, count, similarProducts} = this.state
    const {
      availability,
      brand,
      imageUrl,
      description,
      price,
      rating,
      title,
      totalReviews,
    } = productDetails
    return (
      <>
        <div className="productDetails-container">
          <div className="image-container">
            <img src={imageUrl} alt="product" className="ProductImage" />
          </div>
          <div className="details-container">
            <h1 className="ProductTitle">{title}</h1>
            <p className="price">Rs {price}/-</p>
            <div className="rating-review-container">
              <div className="rating-container">
                <p>{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star"
                />
              </div>
              <p>{totalReviews} Reviews</p>
            </div>
            <p className="description">{description}</p>
            <p className="available">
              <span className="span">Available: </span>
              {availability}
            </p>
            <p className="available">
              <span className="span">Brand: </span>
              {brand}
            </p>
            <hr className="line" />
            <div className="button-container">
              <button
                type="button"
                className="decrease-button"
                onClick={this.onDecrement}
                data-testid="minus"
              >
                <BsDashSquare />
              </button>
              <p className="count">{count}</p>
              <button
                type="button"
                className="increase-button"
                onClick={this.onIncrement}
                data-testid="plus"
              >
                <BsPlusSquare />
              </button>
            </div>
            <button className="button" type="button">
              Add to Cart
            </button>
          </div>
        </div>
        <div className="similarProducts-container">
          <h1>Similar Products</h1>
          <ul className="similar-products-list-container">
            {similarProducts.map(eachProduct => (
              <SimilarProductItem
                key={eachProduct.id}
                productData={eachProduct}
              />
            ))}
          </ul>
        </div>
      </>
    )
  }

  renderFailureView = () => (
    <div className="error-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="error-view"
      />
      <h1>Product Not Found</h1>
      <button
        type="button"
        className="shopping-button"
        onClick={this.onClickContinueShopping}
      >
        Continue Shopping
      </button>
    </div>
  )

  renderView = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductsView()
      case apiStatusConstants.inProgress:
        return this.renderLoaderView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        {this.renderView()}
      </>
    )
  }
}

export default ProductItemDetails
