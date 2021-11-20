const SigmaCoin = artifacts.require('SigmaCoin')
const BetaToken = artifacts.require('BetaToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
  let sigmaCoin, betaToken, tokenFarm

  before(async () => {
    // Load Contracts
    sigmaCoin = await SigmaCoin.new()
    betaToken = await BetaToken.new()
    tokenFarm = await TokenFarm.new(betaToken.address, sigmaCoin.address)

    // Transfer all BetaTokens to farm (1 million)
    await betaToken.transfer(tokenFarm.address, tokens('1000000'))

    // Send tokens to investor
    await sigmaCoin.transfer(investor, tokens('100'), { from: owner })
  })

  describe('SigmaCoin deployment', async () => {
    it('has a name', async () => {
      const name = await sigmaCoin.name()
      assert.equal(name, 'SigmaCoin')
    })
  })

  describe('Beta Token deployment', async () => {
    it('has a name', async () => {
      const name = await betaToken.name()
      assert.equal(name, 'BetaToken')
    })
  })

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await tokenFarm.name()
      assert.equal(name, 'BetaToken Farm')
    })

    it('contract has tokens', async () => {
      let balance = await betaToken.balanceOf(tokenFarm.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Farming tokens', async () => {

    it('rewards investors for staking sCoin tokens', async () => {
      let result

      // Check investor balance before staking
      result = await sigmaCoin.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor SigmaCoin wallet balance correct before staking')

      // Stake SigmaCoin Tokens
      await sigmaCoin.approve(tokenFarm.address, tokens('100'), { from: investor })
      await tokenFarm.stakeTokens(tokens('100'), { from: investor })

      // Check staking result
      result = await sigmaCoin.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), 'investor SigmaCoin wallet balance correct after staking')

      result = await sigmaCoin.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('100'), 'Token Farm SigmaCoin balance correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

      // Issue Tokens
      await tokenFarm.issueTokens({ from: owner })

      // Check balances after issuance
      result = await betaToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor   wallet balance correct affter issuance')

      // Ensure that only onwer can issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // Unstake tokens
      await tokenFarm.unstakeTokens({ from: investor })

      // Check results after unstaking
      result = await sigmaCoin.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor SigmaCoin wallet balance correct after staking')

      result = await sigmaCoin.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('0'), 'Token Farm SigmaCoin balance correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
    })
  })

})