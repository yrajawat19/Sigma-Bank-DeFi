const BetaToken = artifacts.require('BetaToken')
const SigmaCoin = artifacts.require('SigmaCoin') 
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {

	await deployer.deploy(SigmaCoin)
	const sigmaCoin = await SigmaCoin.deployed()

	await deployer.deploy(BetaToken)
	const betaToken = await BetaToken.deployed()

	await deployer.deploy(TokenFarm, betaToken.address, sigmaCoin.address)
	const tokenFarm = await TokenFarm.deployed()

	await betaToken.transfer(tokenFarm.address,'1000000000000000000000000')

	await sigmaCoin.transfer(accounts[1],'1000000000000000000000000')
};