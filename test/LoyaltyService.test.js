const cds = require('@sap/cds')
const { GET, POST, expect } = cds.test(__dirname + '/..')

// Creates a fresh customer through the OData API and returns its ID.
async function createCustomer(name = 'Test Customer') {
  const email = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@email.com`
  const { data } = await POST `/odata/v4/loyalty/Customers ${{ name, email }}`
  return data.ID
}

// Reads a customer back through OData and asserts its points/tier.
async function assertCustomer(id, expectedPoints, expectedTier) {
  const { data } = await GET `/odata/v4/loyalty/Customers(${id})`
  expect(Number(data.totalPoints)).to.equal(expectedPoints)
  expect(data.tier).to.equal(expectedTier)
  return data
}

describe('LoyaltyService OData APIs', () => {

  it('serves seeded Customers', async () => {
    const { data } = await GET `/odata/v4/loyalty/Customers ${{ params: { $select: 'ID,name,totalPoints,tier' } }}`
    expect(data.value.length).to.be.greaterThanOrEqual(6)
    expect(data.value).to.containSubset([{ name: 'Aarav Sharma' }])
  })

  it('serves seeded Transactions, Redemptions and RewardPolicies', async () => {
    const tx = await GET `/odata/v4/loyalty/Transactions`
    const rd = await GET `/odata/v4/loyalty/Redemptions`
    const rp = await GET `/odata/v4/loyalty/RewardPolicies`
    expect(tx.data.value.length).to.be.greaterThanOrEqual(6)
    expect(rd.data.value.length).to.be.greaterThanOrEqual(3)
    expect(rp.data.value.length).to.be.greaterThanOrEqual(3)
  })

  describe('recordPurchase', () => {

    it('awards 2 points per ₹100 for Online purchases (TC-02)', async () => {
      const id = await createCustomer('Online Shopper')
      const { data } = await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 1000 }}`
      expect(data.pointsEarned).to.equal(20)
      await assertCustomer(id, 20, 'Bronze')
    })

    it('awards 1 point per ₹100 for Store purchases (TC-03)', async () => {
      const id = await createCustomer('Store Shopper')
      const { data } = await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Store', amount: 1000 }}`
      expect(data.pointsEarned).to.equal(10)
      await assertCustomer(id, 10, 'Bronze')
    })

    it('rounds points down and accumulates across purchases', async () => {
      const id = await createCustomer('Accumulator')
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 1049 }}`
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Store', amount: 2400 }}`
      // 1049 online -> 20 pts (floor), 2400 store -> 24 pts
      await assertCustomer(id, 44, 'Bronze')
    })

    it('rejects invalid amount and missing channel', async () => {
      const id = await createCustomer('Invalid Purchase')
      await expect(POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 0 }}`)
        .to.be.rejectedWith(/required/i)
      await expect(POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: '', amount: 100 }}`)
        .to.be.rejectedWith(/required/i)
    })

    it('rejects unknown customer (404)', async () => {
      await expect(POST `/odata/v4/loyalty/recordPurchase ${{ customerID: cds.utils.uuid(), channel: 'Online', amount: 500 }}`)
        .to.be.rejectedWith(/not found/i)
    })
  })

  describe('redeemPoints', () => {

    it('deducts points within balance and recalculates tier (TC-04)', async () => {
      const id = await createCustomer('Redeemer')
      // Build 520 pts -> Silver
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 26000 }}`
      await assertCustomer(id, 520, 'Silver')
      const { data } = await POST `/odata/v4/loyalty/redeemPoints ${{ customerID: id, pointsUsed: 20, remarks: 'Test redeem' }}`
      expect(data.pointsUsed).to.equal(20)
      await assertCustomer(id, 500, 'Silver')
    })

    it('rejects redeeming above balance (TC-05)', async () => {
      const id = await createCustomer('Poor Redeemer')
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Store', amount: 1000 }}`
      await expect(POST `/odata/v4/loyalty/redeemPoints ${{ customerID: id, pointsUsed: 50, remarks: 'Too much' }}`)
        .to.be.rejectedWith(/insufficient/i)
    })

    it('rejects non-positive points', async () => {
      const id = await createCustomer('Zero Redeemer')
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 1000 }}`
      await expect(POST `/odata/v4/loyalty/redeemPoints ${{ customerID: id, pointsUsed: 0, remarks: '' }}`)
        .to.be.rejectedWith(/greater than zero/i)
    })

    it('rejects unknown customer (404)', async () => {
      await expect(POST `/odata/v4/loyalty/redeemPoints ${{ customerID: cds.utils.uuid(), pointsUsed: 10, remarks: '' }}`)
        .to.be.rejectedWith(/not found/i)
    })
  })

  describe('tier recalculation (TC-06)', () => {

    it('applies Silver at 500, Gold at 1500, Platinum at 3000', async () => {
      const id = await createCustomer('Tier Climber')
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 25000 }}`
      await assertCustomer(id, 500, 'Silver')
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 50000 }}`
      await assertCustomer(id, 1500, 'Gold')
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 75000 }}`
      await assertCustomer(id, 3000, 'Platinum')
    })

    it('drops tier after redemption crosses below threshold', async () => {
      const id = await createCustomer('Tier Dropper')
      await POST `/odata/v4/loyalty/recordPurchase ${{ customerID: id, channel: 'Online', amount: 150000 }}`
      await assertCustomer(id, 3000, 'Platinum')
      await POST `/odata/v4/loyalty/redeemPoints ${{ customerID: id, pointsUsed: 1500, remarks: 'Big voucher' }}`
      await assertCustomer(id, 1500, 'Gold')
    })
  })
})