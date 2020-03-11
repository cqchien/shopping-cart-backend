"use strict";
const Promise = require("bluebird");
const validator = require("validator");
const _ = require("lodash");

module.exports = function(Product) {
  Product.afterRemote("find", async ctx => {
    // arr because Eslint
    const instance__products = ctx.result;
    //? C1: for
    // for (let i = 0; i < instance__products.length; i++) {
    //   const instance__product = instance__products[i];
    //   const instance__category = await instance__product.category.get();
    //   instance__products[i].__data.categoryName =
    //     instance__category.__data.name;
    // }
    //? C2: Promise + map
    //const queries = instance__products.map(instance__product => {
    //   return instance__product.category.get();
    // });

    // await Promise.all(queries).then(res => {
    //   let _instance_products = instance__products.map(
    //     (instance__product, i) => {
    //       return {
    //         ...instance__product.__data,
    //         categoryName: res[i].__data.name
    //       };
    //     }
    //   );
    //   ctx.result = _instance_products;
    // });
    //? C3 Promise.map
    // await Promise.map(instance__products, instance__product =>
    //   instance__product.category.get()
    // ).then(res => {
    //   let _instance_products = instance__products
    //     .map((instance__product, i) => {
    //       return {
    //         ...instance__product.__data,
    //         categoryName: res[i].__data.name
    //       };
    //     })
    //     .catch(console.log);
    //   ctx.result = _instance_products;
    // });
    //? C4 Promise.each
    await Promise.each(instance__products, instance__product => {
      return instance__product.category.get().then(instance__category => {
        return (instance__product.__data.categoryName =
          instance__category.__data.name);
      });
    }).catch(console.log);
  });

  Product.afterRemote("findById", async ctx => {
    const instance_product = ctx.result;
    const instance_category = await instance_product.category.get(); //? .cateory => Lay duoc tu relation cua product
    instance_product.__data.categoryName = instance_category.__data.name;
  });

  Product.beforeRemote("create", ctx => {
    //! nếu k có async thì phải viết (ctx, next) để khi return thì nó nhảy sang middleware tiếp theo. Nếu k có next thì nó sẽ k thoát khỏi
    let errors = {};

    const image = _.get(ctx, "req.body.image", " ");
    const name = _.get(ctx, "req.body.name", " ");
    const categoryId = _.get(ctx, "req.body.categoryId", " ");
    const price = _.get(ctx, "req.body.price", " ");

    if (validator.isEmpty(image)) {
      errors.image = "Image is required";
    }
    if (validator.isEmpty(name)) {
      errors.name = "Name is required";
    }
    if (validator.isEmpty(categoryId)) {
      errors.categoryId = "CategoryId is required";
    }
    if (!_.isNumber(price)) {
      errors.price = "Price is required";
    } else if (price < 0) {
      errors.price = "Price is greater than 0";
    }
    if (_.isEmpty(errors)) {
      return;
    }
    throw errors;
  });
};
