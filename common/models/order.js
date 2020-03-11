"use strict";
const _ = require("lodash");
const app = require("../../server/server.js");
const Promise = require("bluebird");

module.exports = function(Order) {
  Order.observe("after save", async ctx => {
    // ctx k co req, res
    const OrderProduct = app.models.OrderProduct;
    const products = _.get(ctx, "options.req.body.products", []); // [] => gia tri mat dinh la mang rong
    // xoa truoc khi sua
    if (!ctx.isNewInstance) {
      await OrderProduct.destroyAll({ orderId: ctx.instance.id });
    }
    await Promise.map(products, product => {
      return OrderProduct.create({
        orderId: ctx.instance.id,
        productId: `${product.productId}`,
        quantity: `${product.quantity}`
      });
    });
  });
  Order.observe("after delete", async ctx => {});

  Order.afterRemote("findById", async ctx => {
    const OrderProduct = app.models.OrderProduct;

    const order = ctx.result;
    const orderProducts = await OrderProduct.find({
      where: {
        orderId: order._id
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
