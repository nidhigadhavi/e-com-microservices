module.exports = {
  apps : [{
    name   : "order-service",
    script : "nodemon ./order-service/index.js"
  },
  {
    name   : "product-service",
    script : "nodemon ./product-service/index.js"
  },
  {
    name   : "auth-service",
    script : "nodemon ./auth-service/index.js"
  }]
}
