using { loyalty } from '../db/schema';
@path: '/odata/v4/loyalty'
service LoyaltyService {
  entity Customers      as projection on loyalty.Customers;
  entity Transactions   as projection on loyalty.Transactions;
  entity Redemptions    as projection on loyalty.Redemptions;
  entity RewardPolicies as projection on loyalty.RewardPolicies;

  action recordPurchase(
    customerID : UUID,
    channel    : String,
    amount     : Decimal(12,2)
  ) returns Transactions;

  action redeemPoints(
    customerID : UUID,
    pointsUsed : Integer,
    remarks    : String
  ) returns Redemptions;
}