const Borrow = artifacts.require("BorrowandUse");
const Token = artifacts.require("OGG");
module.exports = async function (deployer) {
 await deployer.deploy(Token,1000000);
  const instance1 = await Token.deployed();
  await deployer.deploy(Borrow,instance1.address);
  const instance2 = await Borrow.deployed();
  await instance1._Transfer(instance2.address,1000000);
  await instance1.ChangeOwnership(instance2.address);
  
};
