const _ = require("lodash");

module.exports = app => {
  const Account = app.models.Account;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;

  Account.findOne({ where: { email: "abc@gmail.com" } })
    .then(account => {
      if (account) return Promise.resolve(account);
      return Account.create({
        email: "abc@gmail.com",
        password: "123",
        phone: "032121321",
        address: "41 BD"
      });
    })
    .then(_account => {
      account = _account;
      return Role.findOne({ where: { name: "admin" } });
    })
    .then(role => {
      if (role) return Promise.resolve(role);
      return Role.create({ name: "admin" });
    })
    .then(role => {
      RoleMapping.findOrCreate(
        {
          principalType: RoleMapping.USER,
          roleId: role.id,
          principalId: account.id
        },
        {
          principalType: RoleMapping.USER,
          roleId: role.id,
          principalId: account.id
        }
      );
    });
};
