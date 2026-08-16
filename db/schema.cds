namespace loyalty;
using { cuid, managed } from '@sap/cds/common';

entity Customers : cuid, managed {
  name        : String(100);
  email       : String(150);
  totalPoints : Integer default 0;
  tier        : String(20) default 'Bronze';
  transactions: Association to many Transactions
    on transactions.customer = $self;
  redemptions : Association to many Redemptions
    on redemptions.customer = $self;
}

entity Transactions : cuid, managed {
  customer    : Association to Customers;
  channel     : String(20);
  amount      : Decimal(12,2);
  txnDate     : DateTime;
  pointsEarned: Integer;
}

entity Redemptions : cuid, managed {
  customer    : Association to Customers;
  pointsUsed  : Integer;
  redeemDate  : DateTime;
  remarks     : String(255);
}

entity RewardPolicies : cuid, managed {
  policyName  : String(100);
  channel     : String(20);
  pointsPer100: Decimal(8,2);
  active      : Boolean default true;
}