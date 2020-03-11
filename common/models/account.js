"use strict";
const _ = require("lodash");
const app = require("../../server/server.js");

module.exports = function(Account) {
  Account.afterRemote("prototype.__findById__orders", async ctx => {
    const OrderProduct = app.models.OrderProduct;

    const order = ctx.result;
    const orderProducts = await OrderProduct.find({
      where: {
        orderId: order.id
      }
    });
    let totalPrice = 0;
    for (let index = 0; index < orderProducts.length; index++) {
      const orderProduct = orderProducts[index];

      const product = await orderProduct.product.get(); //? so it dung get(), so nhieu dung find()
      // tong gia
      totalPrice += orderProduct.__data.quantity * product.__data.price;
      // lay productName
      orderProduct.__data.productName = product.__data.name;
    }
    ctx.result.__data.products = orderProducts;
    ctx.result.__data.totalPrice = totalPrice;
  });
};
