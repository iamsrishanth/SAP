const serviceRoot = '/odata/v4/loyalty';
const numberFormat = new Intl.NumberFormat('en-IN');
const currencyFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

const demoData = {
  Customers: [
    { ID: 'demo-1', name: 'Aarav Sharma', email: 'aarav.sharma@email.com', totalPoints: 1250, tier: 'Silver' },
    { ID: 'demo-2', name: 'Ananya Reddy', email: 'ananya.reddy@email.com', totalPoints: 2450, tier: 'Gold' },
    { ID: 'demo-3', name: 'Imran Khan', email: 'imran.khan@email.com', totalPoints: 320, tier: 'Bronze' },
    { ID: 'demo-4', name: 'Priya Nair', email: 'priya.nair@email.com', totalPoints: 780, tier: 'Silver' }
  ],
  Transactions: [
    { ID: 'tx-1', customer_ID: 'demo-2', channel: 'Online', amount: 6500, txnDate: '2026-08-14T10:30:00Z', pointsEarned: 130 },
    { ID: 'tx-2', customer_ID: 'demo-1', channel: 'Store', amount: 2400, txnDate: '2026-08-13T15:10:00Z', pointsEarned: 24 },
    { ID: 'tx-3', customer_ID: 'demo-4', channel: 'Online', amount: 1100, txnDate: '2026-08-12T08:45:00Z', pointsEarned: 22 }
  ],
  Redemptions: [
    { ID: 'rd-1', customer_ID: 'demo-2', pointsUsed: 800, redeemDate: '2026-08-15T12:00:00Z', remarks: 'Festival voucher' },
    { ID: 'rd-2', customer_ID: 'demo-1', pointsUsed: 250, redeemDate: '2026-08-11T09:20:00Z', remarks: 'Checkout discount' }
  ],
  RewardPolicies: [
    { policyName: 'Online purchase', channel: 'Online', pointsPer100: 2, active: true },
    { policyName: 'Store purchase', channel: 'Store', pointsPer100: 1, active: true },
    { policyName: 'Tier refresh', channel: 'All', pointsPer100: 0, active: true }
  ]
};

let state = structuredClone(demoData);
let liveMode = false;

const $ = id => document.getElementById(id);
const customerName = id => state.Customers.find(customer => customer.ID === id)?.name || 'Unknown customer';
const tierClass = tier => `tier tier-${String(tier || 'bronze').toLowerCase()}`;

async function getEntity(entity) {
  const response = await fetch(`${serviceRoot}/${entity}?$orderby=modifiedAt desc,createdAt desc`);
  if (!response.ok) throw new Error(`Unable to load ${entity}`);
  const payload = await response.json();
  return payload.value || [];
}

async function loadData() {
  try {
    const [Customers, Transactions, Redemptions, RewardPolicies] = await Promise.all([
      getEntity('Customers'), getEntity('Transactions'), getEntity('Redemptions'), getEntity('RewardPolicies')
    ]);
    state = { Customers, Transactions, Redemptions, RewardPolicies };
    liveMode = true;
    showToast('Live service data loaded');
  } catch (error) {
    state = structuredClone(demoData);
    liveMode = false;
    showToast('Showing demo data. Start cds watch for live updates.', 'warning');
  }
  render();
}

function render() {
  const issued = state.Transactions.reduce((sum, tx) => sum + Number(tx.pointsEarned || 0), 0);
  const redeemed = state.Redemptions.reduce((sum, redemption) => sum + Number(redemption.pointsUsed || 0), 0);
  const available = state.Customers.reduce((sum, customer) => sum + Number(customer.totalPoints || 0), 0);

  $('totalCustomers').textContent = numberFormat.format(state.Customers.length);
  $('pointsIssued').textContent = numberFormat.format(issued);
  $('pointsRedeemed').textContent = numberFormat.format(redeemed);
  $('availablePoints').textContent = numberFormat.format(available);
  $('dataMode').textContent = liveMode ? 'Live OData' : 'Demo mode';
  $('dataMode').className = `status-pill ${liveMode ? 'success' : 'warning'}`;

  renderCustomers();
  renderSelectors();
  renderActivity();
  renderPolicies();
}

function renderCustomers() {
  $('customerRows').innerHTML = state.Customers
    .slice()
    .sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0))
    .map(customer => `<tr><td><strong>${customer.name}</strong></td><td>${customer.email}</td><td>${numberFormat.format(customer.totalPoints || 0)}</td><td><span class="${tierClass(customer.tier)}">${customer.tier}</span></td></tr>`)
    .join('');
}

function renderSelectors() {
  const options = state.Customers.map(customer => `<option value="${customer.ID}">${customer.name} · ${numberFormat.format(customer.totalPoints || 0)} pts</option>`).join('');
  $('purchaseCustomer').innerHTML = options;
  $('redeemCustomer').innerHTML = options;
}

function renderActivity() {
  $('transactionList').innerHTML = state.Transactions.slice(0, 5).map(tx => `
    <div class="activity"><strong>${customerName(tx.customer_ID)}</strong><span>${tx.channel} · ${currencyFormat.format(tx.amount || 0)}</span><b>+${numberFormat.format(tx.pointsEarned || 0)} pts</b></div>`).join('') || '<p>No transactions yet.</p>';
  $('redemptionList').innerHTML = state.Redemptions.slice(0, 5).map(redemption => `
    <div class="activity"><strong>${customerName(redemption.customer_ID)}</strong><span>${redemption.remarks || 'Redemption'}</span><b>-${numberFormat.format(redemption.pointsUsed || 0)} pts</b></div>`).join('') || '<p>No redemptions yet.</p>';
}

function renderPolicies() {
  $('policyGrid').innerHTML = state.RewardPolicies.map(policy => `
    <div class="policy"><span>${policy.channel}</span><strong>${policy.policyName}</strong><p>${Number(policy.pointsPer100 || 0) ? `${policy.pointsPer100} points per ₹100` : 'Recalculate tier after every change'}</p></div>`).join('');
}

async function runAction(action, body) {
  if (!liveMode) throw new Error('Actions need the CAP service. Run npm run watch and try again.');
  const response = await fetch(`${serviceRoot}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Action ${action} failed`);
  }
  return response.json();
}

function showToast(message, type = 'success') {
  const toast = $('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.className = 'toast', 3500);
}

$('refreshButton').addEventListener('click', loadData);
$('purchaseForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await runAction('recordPurchase', { customerID: $('purchaseCustomer').value, channel: $('purchaseChannel').value, amount: Number($('purchaseAmount').value) });
    showToast('Purchase recorded and points updated');
    await loadData();
  } catch (error) { showToast(error.message, 'error'); }
});
$('redeemForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await runAction('redeemPoints', { customerID: $('redeemCustomer').value, pointsUsed: Number($('redeemPoints').value), remarks: $('redeemRemarks').value });
    showToast('Points redeemed successfully');
    await loadData();
  } catch (error) { showToast(error.message, 'error'); }
});

loadData();
