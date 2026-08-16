const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {
  const { Customers, Transactions, Redemptions } =
    cds.entities('loyalty');

  function tier(points) {
    if (points >= 3000) return 'Platinum';
    if (points >= 1500) return 'Gold';
    if (points >= 500)  return 'Silver';
    return 'Bronze';
  }

  this.on('recordPurchase', async req => {
    const { customerID, channel, amount } = req.data;

    if (!customerID || !channel || Number(amount) <= 0)
      return req.error(400, 'Valid customer, channel and amount are required');

    const customer = await SELECT.one.from(Customers)
      .where({ ID: customerID });

    if (!customer) return req.error(404, 'Customer not found');

    const rate = channel.toLowerCase() === 'online' ? 2 : 1;
    const points = Math.floor(Number(amount) / 100 * rate);
    const txID = cds.utils.uuid();

    await INSERT.into(Transactions).entries({
      ID: txID,
      customer_ID: customerID,
      channel,
      amount,
      txnDate: new Date(),
      pointsEarned: points
    });

    const total = Number(customer.totalPoints || 0) + points;

    await UPDATE(Customers).set({
      totalPoints: total,
      tier: tier(total)
    }).where({ ID: customerID });

    return SELECT.one.from(Transactions).where({ ID: txID });
  });

  this.on('redeemPoints', async req => {
    const { customerID, pointsUsed, remarks } = req.data;

    const customer = await SELECT.one.from(Customers)
      .where({ ID: customerID });

    if (!customer) return req.error(404, 'Customer not found');
    if (Number(pointsUsed) <= 0)
      return req.error(400, 'Points must be greater than zero');
    if (Number(customer.totalPoints) < Number(pointsUsed))
      return req.error(400, 'Insufficient loyalty points');

    const remaining = Number(customer.totalPoints) - Number(pointsUsed);
    const id = cds.utils.uuid();

    await INSERT.into(Redemptions).entries({
      ID: id,
      customer_ID: customerID,
      pointsUsed,
      redeemDate: new Date(),
      remarks: remarks || ''
    });

    await UPDATE(Customers).set({
      totalPoints: remaining,
      tier: tier(remaining)
    }).where({ ID: customerID });

    return SELECT.one.from(Redemptions).where({ ID: id });
  });
});