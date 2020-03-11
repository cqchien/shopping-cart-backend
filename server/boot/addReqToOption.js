const _ = require("lodash");

module.exports = function(app) {
  app
    .remotes()
    .phases.addBefore("invoke", "add-req-to-option")
    .use((ctx, next) => {
      _.set(ctx, "args.options.req", ctx.req);
      next();
    });
};
