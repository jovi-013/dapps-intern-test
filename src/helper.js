export async function _getTokenName(contract) {
  return await contract.methods.name()
    .call()
    .then((result) => { return result });
}

export async function _getTokenSymbol(contract) {
  return await contract.methods.symbol()
    .call()
    .then((result) => { return result });
}

export async function _getTotalSupply(contract) {
  return await contract.methods.totalSupply()
    .call()
    .then((result) => { return result });
}

export async function _getBalance(contract, account) {
  return await contract.methods.balanceOf(account)
    .call()
    .then((result) => { return result })
}

export async function _getTokenStatus(contract) {
  return await contract.methods.paused()
    .call()
    .then((result) => { return result })
}

export async function _getDecimals(contract) {
  return await contract.methods.decimals()
    .call()
    .then((result) => { return result });
}

export async function _mint(contract, sender, to, amount) {
  return await contract.methods.mint(to, amount)
    .send({from: sender})
    .then((result) => { return result });
}
