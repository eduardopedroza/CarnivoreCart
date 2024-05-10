import axios from "axios";
import { getTokenFromLocalStorage } from "../hooks/utils";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

class CCApi {
  static token;

  static async request(
    endpoint,
    data = {},
    method = "get",
    requireAuth = true
  ) {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const params = method === "get" ? data : {};
    let headers = {};

    if (requireAuth) {
      headers = { Authorization: `Bearer ${CCApi.token}` };
    }

    console.log("Request Headers:", headers);

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  /** Get token for login from username, password. */

  static async login(data) {
    let res = await this.request(`auth/token`, data, "post");
    return res.token;
  }

  /** Signup user and get user token */

  static async signupUser(data) {
    let res = await this.request(`auth/register`, data, "post");
    return res.token;
  }

  /** Signup seller and get seller token */

  static async signupSeller(data) {
    let res = await this.request(`sellers/register`, data, "post");
    return res.token;
  }

  static async getCurrentUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  static async getSeller(sellerId) {
    let res = await this.request(`sellers/${sellerId}`);
    return res.seller;
  }

  static async updateUser(username, data) {
    let res = await this.request(`users/${username}`, data, "patch");
    return res.user;
  }

  static async updateSeller(sellerId, data) {
    let res = await this.request(`sellers/${sellerId}`, data, "patch");
    return res.seller;
  }

  static async getAllProducts(
    sellerId,
    name,
    meatType,
    cutType,
    minPrice,
    maxPrice
  ) {
    let res = await this.request(
      `products`,
      { sellerId, name, meatType, cutType, minPrice, maxPrice },
      "get",
      false
    );
    return res.products;
  }

  static async createProduct(data) {
    let res = await this.request(`products/create`, data, "post");
    return res.product;
  }

  static async getProduct(productId) {
    let res = await this.request(`products/${productId}`);
    return res.product;
  }
  static async updateProduct(productId, data) {
    let res = await this.request(`products/${productId}`, data, "patch");
    return res.product;
  }

  static async deleteProduct(productId) {
    let res = await this.request(`products/${productId}/remove`, {}, "patch");
    return res;
  }

  static async createOrder(userId, products, pricePaidInCents) {
    let res = await this.request(
      `orders/create`,
      {
        userId,
        products,
        pricePaidInCents,
      },
      "post"
    );
    return res.order;
  }

  static async createReview(data) {
    let res = await this.request(`reviews/create`, data, "post");
    return res.review;
  }

  static async getReviews(productId) {
    let res = await this.request(`reviews/${productId}`);
    return res.reviews;
  }
}

export default CCApi;
