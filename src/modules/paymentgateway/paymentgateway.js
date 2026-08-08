/**
 * CampusConnect — Payment Gateway Module
 * Handles MTN MoMo & Orange Money mobile money transactions
 * Uses Firestore to track all transaction states
 */

import { db, auth } from '../../config/firebase.js';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

// ─── Configuration ───────────────────────────────────────────
const TRANSACTIONS_COL = 'transactions';
const CURRENCY = 'XAF'; // Central African CFA franc

// MTN MoMo API config (replace with your sandbox/production credentials)
const MOMO_CONFIG = {
  baseUrl: 'https://sandbox.momodeveloper.mtn.com',   // Use production URL in prod
  subscriptionKey: 'YOUR_MTN_SUBSCRIPTION_KEY',
  apiUserId: 'YOUR_API_USER_ID',
  apiKey: 'YOUR_API_KEY',
  environment: 'sandbox' // 'sandbox' | 'production'
};

// Orange Money API config (replace with your credentials)
const ORANGE_CONFIG = {
  baseUrl: 'https://api.orange.com/orange-money-webpay/dev/v1',
  merchantKey: 'YOUR_ORANGE_MERCHANT_KEY',
  authHeader: 'YOUR_ORANGE_AUTH_TOKEN',
  notifyUrl: 'YOUR_CALLBACK_URL',
  returnUrl: 'YOUR_RETURN_URL',
  cancelUrl: 'YOUR_CANCEL_URL'
};

// ─── MTN MoMo API Integration ───────────────────────────────

/**
 * Get an access token from MTN MoMo API
 * @returns {Promise<string>} Access token
 */
async function getMoMoAccessToken() {
  const credentials = btoa(`${MOMO_CONFIG.apiUserId}:${MOMO_CONFIG.apiKey}`);
  const response = await fetch(`${MOMO_CONFIG.baseUrl}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
    }
  });

  if (!response.ok) {
    throw new Error(`MoMo token request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Request a payment via MTN MoMo
 * @param {Object} params - Payment parameters
 * @param {string} params.phoneNumber - Payer phone number (e.g. "237670000000")
 * @param {number} params.amount - Amount in XAF
 * @param {string} params.externalId - Your internal transaction reference
 * @param {string} params.payerMessage - Message shown to payer
 * @returns {Promise<string>} MoMo reference UUID
 */
async function requestMoMoPayment({ phoneNumber, amount, externalId, payerMessage }) {
  const token = await getMoMoAccessToken();
  const referenceId = crypto.randomUUID();

  const response = await fetch(`${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': MOMO_CONFIG.environment,
      'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(amount),
      currency: CURRENCY,
      externalId: externalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber
      },
      payerMessage: payerMessage,
      payeeNote: `CampusConnect payment - ${externalId}`
    })
  });

  if (!response.ok) {
    throw new Error(`MoMo payment request failed: ${response.status}`);
  }

  return referenceId;
}

/**
 * Check the status of a MoMo payment
 * @param {string} referenceId - The MoMo reference UUID
 * @returns {Promise<Object>} Payment status object
 */
async function checkMoMoPaymentStatus(referenceId) {
  const token = await getMoMoAccessToken();

  const response = await fetch(
    `${MOMO_CONFIG.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': MOMO_CONFIG.environment,
        'Ocp-Apim-Subscription-Key': MOMO_CONFIG.subscriptionKey,
      }
    }
  );

  if (!response.ok) {
    throw new Error(`MoMo status check failed: ${response.status}`);
  }

  return await response.json();
}

// ─── Orange Money API Integration ────────────────────────────

/**
 * Initiate an Orange Money web payment
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in XAF
 * @param {string} params.orderId - Your internal order reference
 * @returns {Promise<Object>} Contains payment_url to redirect user
 */
async function initiateOrangeMoneyPayment({ amount, orderId }) {
  const response = await fetch(`${ORANGE_CONFIG.baseUrl}/webpayment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ORANGE_CONFIG.authHeader}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      merchant_key: ORANGE_CONFIG.merchantKey,
      currency: CURRENCY,
      order_id: orderId,
      amount: amount,
      return_url: ORANGE_CONFIG.returnUrl,
      cancel_url: ORANGE_CONFIG.cancelUrl,
      notif_url: ORANGE_CONFIG.notifyUrl,
      lang: 'fr'
    })
  });

  if (!response.ok) {
    throw new Error(`Orange Money payment initiation failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Check Orange Money transaction status
 * @param {string} payToken - The pay token from initiation
 * @returns {Promise<Object>} Transaction status
 */
async function checkOrangeMoneyStatus(payToken) {
  const response = await fetch(
    `${ORANGE_CONFIG.baseUrl}/webpayment/${payToken}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ORANGE_CONFIG.authHeader}`,
        'Accept': 'application/json',
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Orange Money status check failed: ${response.status}`);
  }

  return await response.json();
}

// ─── Firestore Transaction Management ────────────────────────

/**
 * Create a new pending transaction in Firestore
 * @param {Object} params
 * @param {string} params.buyerId - Buyer UID
 * @param {string} params.sellerId - Seller UID
 * @param {string} params.listingId - Listing document ID
 * @param {string} params.listingTitle - Denormalized listing title
 * @param {number} params.amount - Payment amount
 * @param {string} params.paymentMethod - "momo" | "orange_money"
 * @param {string} params.phoneNumber - Payer's phone number
 * @returns {Promise<string>} Transaction document ID
 */
export async function initPayment({
  buyerId,
  sellerId,
  listingId,
  listingTitle,
  amount,
  paymentMethod,
  phoneNumber
}) {
  // Save the transaction to Firestore first
  const transactionData = {
    buyerId,
    sellerId,
    listingId,
    listingTitle,
    amount,
    currency: CURRENCY,
    paymentMethod,
    phoneNumber,
    status: 'pending',
    paymentRef: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, TRANSACTIONS_COL), transactionData);
  return docRef.id;
}

/**
 * Process a payment via the selected mobile money provider
 * @param {string} transactionId - Firestore transaction doc ID
 * @returns {Promise<Object>} Result with paymentRef or payment_url
 */
export async function processPayment(transactionId) {
  const transactionRef = doc(db, TRANSACTIONS_COL, transactionId);
  const transactionSnap = await getDoc(transactionRef);

  if (!transactionSnap.exists()) {
    throw new Error('Transaction not found.');
  }

  const txn = transactionSnap.data();

  if (txn.status !== 'pending') {
    throw new Error(`Cannot process transaction with status: ${txn.status}`);
  }

  let paymentRef = null;
  let paymentUrl = null;

  try {
    if (txn.paymentMethod === 'momo') {
      // MTN MoMo — sends a USSD push to the payer's phone
      paymentRef = await requestMoMoPayment({
        phoneNumber: txn.phoneNumber,
        amount: txn.amount,
        externalId: transactionId,
        payerMessage: `Payment for: ${txn.listingTitle}`
      });
    } else if (txn.paymentMethod === 'orange_money') {
      // Orange Money — returns a URL to redirect the payer
      const result = await initiateOrangeMoneyPayment({
        amount: txn.amount,
        orderId: transactionId
      });
      paymentRef = result.pay_token;
      paymentUrl = result.payment_url;
    } else {
      throw new Error(`Unsupported payment method: ${txn.paymentMethod}`);
    }

    // Update Firestore with the provider reference
    await updateDoc(transactionRef, {
      paymentRef,
      status: 'processing',
      updatedAt: serverTimestamp()
    });

    return { transactionId, paymentRef, paymentUrl };

  } catch (error) {
    // Mark as failed
    await updateDoc(transactionRef, {
      status: 'failed',
      errorMessage: error.message,
      updatedAt: serverTimestamp()
    });
    throw error;
  }
}

/**
 * Poll the payment provider to check if payment succeeded
 * @param {string} transactionId - Firestore transaction doc ID
 * @returns {Promise<string>} Updated status
 */
export async function verifyPayment(transactionId) {
  const transactionRef = doc(db, TRANSACTIONS_COL, transactionId);
  const transactionSnap = await getDoc(transactionRef);

  if (!transactionSnap.exists()) {
    throw new Error('Transaction not found.');
  }

  const txn = transactionSnap.data();
  let providerStatus = null;

  if (txn.paymentMethod === 'momo' && txn.paymentRef) {
    const result = await checkMoMoPaymentStatus(txn.paymentRef);
    providerStatus = result.status; // "SUCCESSFUL", "FAILED", "PENDING"
  } else if (txn.paymentMethod === 'orange_money' && txn.paymentRef) {
    const result = await checkOrangeMoneyStatus(txn.paymentRef);
    providerStatus = result.status; // "SUCCESS", "FAILED", "INITIATED"
  }

  // Map provider status to our internal status
  let newStatus = txn.status;
  if (providerStatus === 'SUCCESSFUL' || providerStatus === 'SUCCESS') {
    newStatus = 'paid';
  } else if (providerStatus === 'FAILED') {
    newStatus = 'failed';
  }

  if (newStatus !== txn.status) {
    await updateDoc(transactionRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  }

  return newStatus;
}

/**
 * Buyer confirms they received the item/service — finalizes transaction
 * @param {string} transactionId
 */
export async function confirmDelivery(transactionId) {
  const transactionRef = doc(db, TRANSACTIONS_COL, transactionId);
  const transactionSnap = await getDoc(transactionRef);

  if (!transactionSnap.exists()) {
    throw new Error('Transaction not found.');
  }

  const txn = transactionSnap.data();
  if (txn.status !== 'paid') {
    throw new Error('Can only confirm delivery on a paid transaction.');
  }

  await updateDoc(transactionRef, {
    status: 'confirmed',
    updatedAt: serverTimestamp()
  });
}

/**
 * Cancel a pending transaction
 * @param {string} transactionId
 */
export async function cancelTransaction(transactionId) {
  const transactionRef = doc(db, TRANSACTIONS_COL, transactionId);
  const transactionSnap = await getDoc(transactionRef);

  if (!transactionSnap.exists()) {
    throw new Error('Transaction not found.');
  }

  const txn = transactionSnap.data();
  if (txn.status !== 'pending' && txn.status !== 'processing') {
    throw new Error('Can only cancel pending or processing transactions.');
  }

  await updateDoc(transactionRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp()
  });
}

/**
 * Get all transactions for a specific user (as buyer or seller)
 * @param {string} userId
 * @returns {Promise<Array>} List of transaction objects
 */
export async function getTransactionHistory(userId) {
  const buyerQuery = query(
    collection(db, TRANSACTIONS_COL),
    where('buyerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const sellerQuery = query(
    collection(db, TRANSACTIONS_COL),
    where('sellerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const [buyerSnap, sellerSnap] = await Promise.all([
    getDocs(buyerQuery),
    getDocs(sellerQuery)
  ]);

  const transactions = [];
  const seen = new Set();

  buyerSnap.forEach(docSnap => {
    transactions.push({ id: docSnap.id, role: 'buyer', ...docSnap.data() });
    seen.add(docSnap.id);
  });

  sellerSnap.forEach(docSnap => {
    if (!seen.has(docSnap.id)) {
      transactions.push({ id: docSnap.id, role: 'seller', ...docSnap.data() });
    }
  });

  // Sort combined results by createdAt descending
  transactions.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });

  return transactions;
}

/**
 * Listen to real-time updates on a specific transaction
 * @param {string} transactionId
 * @param {Function} callback - Called with updated transaction data
 * @returns {Function} Unsubscribe function
 */
export function onTransactionUpdate(transactionId, callback) {
  const transactionRef = doc(db, TRANSACTIONS_COL, transactionId);
  return onSnapshot(transactionRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
}

// ─── UI Controller (DOM Interactions) ────────────────────────

const DELIVERY_FEE = 1500; // Fixed campus delivery fee in XAF
const TAX_RATE = 0.07;     // 7% estimated tax

/**
 * Format amount in XAF (e.g. "50,000 XAF")
 */
function formatAmount(amount) {
  return new Intl.NumberFormat('fr-CM', {
    minimumFractionDigits: 0
  }).format(amount) + ' XAF';
}

/**
 * Get a human-readable label and CSS class for a status
 */
function getStatusInfo(status) {
  const map = {
    pending:    { label: 'Pending',    cssClass: 'status-pending' },
    processing: { label: 'Processing', cssClass: 'status-processing' },
    paid:       { label: 'Paid',       cssClass: 'status-paid' },
    confirmed:  { label: 'Confirmed',  cssClass: 'status-confirmed' },
    failed:     { label: 'Failed',     cssClass: 'status-failed' },
    cancelled:  { label: 'Cancelled',  cssClass: 'status-cancelled' },
    disputed:   { label: 'Disputed',   cssClass: 'status-disputed' },
    refunded:   { label: 'Refunded',   cssClass: 'status-refunded' }
  };
  return map[status] || { label: status, cssClass: 'status-unknown' };
}

/**
 * Format a Firestore timestamp to a readable date string
 */
function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Render a single transaction row
 */
function renderTransactionRow(txn) {
  const statusInfo = getStatusInfo(txn.status);
  return `
    <tr data-id="${txn.id}">
      <td>${txn.listingTitle || '—'}</td>
      <td>${formatAmount(txn.amount)}</td>
      <td class="method-cell">
        <span class="method-badge method-${txn.paymentMethod}">
          ${txn.paymentMethod === 'momo' ? 'MTN MoMo' : 'Orange Money'}
        </span>
      </td>
      <td><span class="status-badge ${statusInfo.cssClass}">${statusInfo.label}</span></td>
      <td>${txn.role === 'buyer' ? 'Sent' : 'Received'}</td>
      <td>${formatDate(txn.createdAt)}</td>
      <td class="actions-cell">
        ${txn.status === 'processing' ? `<button class="btn-verify" data-id="${txn.id}">Verify</button>` : ''}
        ${txn.status === 'paid' && txn.role === 'buyer' ? `<button class="btn-confirm" data-id="${txn.id}">Confirm Delivery</button>` : ''}
        ${(txn.status === 'pending' || txn.status === 'processing') ? `<button class="btn-cancel" data-id="${txn.id}">Cancel</button>` : ''}
      </td>
    </tr>
  `;
}

/**
 * Load and render all transactions for the current user
 */
async function loadTransactions() {
  const user = auth.currentUser;
  const tbody = document.getElementById('transactions-body');
  const emptyState = document.getElementById('empty-state');

  if (!user) {
    if (tbody) tbody.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.textContent = 'Please log in to view your transactions.';
    }
    return;
  }

  try {
    const transactions = await getTransactionHistory(user.uid);

    if (transactions.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.textContent = 'No transactions yet.';
      }
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (tbody) {
      tbody.innerHTML = transactions.map(renderTransactionRow).join('');
      attachActionListeners();
    }

  } catch (error) {
    console.error('Error loading transactions:', error);
    if (tbody) tbody.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.textContent = 'Error loading transactions. Please try again.';
    }
  }
}

/**
 * Attach click listeners to action buttons on each transaction row
 */
function attachActionListeners() {
  document.querySelectorAll('.btn-verify').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Checking...';
      try {
        const status = await verifyPayment(btn.dataset.id);
        alert(`Payment status: ${status}`);
        await loadTransactions();
      } catch (err) {
        alert(`Verification failed: ${err.message}`);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Verify';
      }
    });
  });

  document.querySelectorAll('.btn-confirm').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Confirm that you received this item/service?')) return;
      btn.disabled = true;
      try {
        await confirmDelivery(btn.dataset.id);
        await loadTransactions();
      } catch (err) {
        alert(`Error: ${err.message}`);
        btn.disabled = false;
      }
    });
  });

  document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Cancel this transaction?')) return;
      btn.disabled = true;
      try {
        await cancelTransaction(btn.dataset.id);
        await loadTransactions();
      } catch (err) {
        alert(`Error: ${err.message}`);
        btn.disabled = false;
      }
    });
  });
}

/**
 * Update the order summary card with price breakdown
 */
function updateOrderSummary(subtotal) {
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + DELIVERY_FEE + tax;

  const subtotalEl = document.getElementById('subtotal');
  const deliveryEl = document.getElementById('delivery-fee');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total-amount');
  const btnPayAmount = document.getElementById('btn-pay-amount');
  const btnPay = document.getElementById('btn-pay');

  if (subtotalEl) subtotalEl.textContent = formatAmount(subtotal);
  if (deliveryEl) deliveryEl.textContent = formatAmount(DELIVERY_FEE);
  if (taxEl) taxEl.textContent = formatAmount(tax);
  if (totalEl) totalEl.textContent = formatAmount(total);
  if (btnPayAmount) btnPayAmount.textContent = new Intl.NumberFormat('fr-CM').format(total);
  if (btnPay) btnPay.disabled = (subtotal <= 0);
}

/**
 * Populate the order summary from URL query parameters
 * Expected: ?listingId=xxx&title=xxx&seller=xxx&sellerId=xxx&price=xxx&image=xxx
 */
function populateFromURLParams() {
  const params = new URLSearchParams(window.location.search);

  const listingId = params.get('listingId') || '';
  const title = params.get('title') || 'No item selected';
  const seller = params.get('seller') || '—';
  const sellerId = params.get('sellerId') || '';
  const price = parseFloat(params.get('price')) || 0;
  const imageUrl = params.get('image') || '';

  // Populate hidden form fields
  const listingIdField = document.getElementById('listingId');
  const listingTitleField = document.getElementById('listingTitle');
  const sellerIdField = document.getElementById('sellerId');
  const amountField = document.getElementById('amount');

  if (listingIdField) listingIdField.value = listingId;
  if (listingTitleField) listingTitleField.value = title;
  if (sellerIdField) sellerIdField.value = sellerId;
  if (amountField) amountField.value = price;

  // Populate visible order summary
  const titleEl = document.getElementById('product-title');
  const sellerEl = document.getElementById('seller-name');
  const priceEl = document.getElementById('product-price');
  const imgEl = document.getElementById('product-img');

  if (titleEl) titleEl.textContent = title;
  if (sellerEl) sellerEl.textContent = `Seller: ${seller}`;
  if (priceEl) priceEl.textContent = formatAmount(price);
  if (imgEl && imageUrl) imgEl.src = imageUrl;

  // Update price breakdown
  updateOrderSummary(price);
}

/**
 * Handle payment method radio card toggling
 */
function setupPaymentMethodToggle() {
  const momoOption = document.getElementById('momo-option');
  const orangeOption = document.getElementById('orange-option');
  const momoFields = document.getElementById('momo-fields');
  const orangeFields = document.getElementById('orange-fields');
  const radios = document.querySelectorAll('input[name="paymentMethod"]');

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      // Toggle selected class
      if (momoOption) momoOption.classList.toggle('selected', radio.value === 'momo');
      if (orangeOption) orangeOption.classList.toggle('selected', radio.value === 'orange_money');

      // Toggle phone fields visibility
      if (momoFields) momoFields.classList.toggle('hidden', radio.value !== 'momo');
      if (orangeFields) orangeFields.classList.toggle('hidden', radio.value !== 'orange_money');
    });
  });
}

/**
 * Handle the Pay Now button click
 */
async function handlePayNow() {
  const btnPay = document.getElementById('btn-pay');
  const messageEl = document.getElementById('payment-message');

  // Get selected payment method
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
  if (!selectedMethod) {
    messageEl.textContent = 'Please select a payment method.';
    messageEl.className = 'payment-message error';
    return;
  }

  const paymentMethod = selectedMethod.value;

  // Get the phone number from the active field
  const phoneInput = paymentMethod === 'momo'
    ? document.getElementById('momo-phone')
    : document.getElementById('orange-phone');

  const phoneNumber = phoneInput ? phoneInput.value.trim() : '';
  if (!phoneNumber) {
    messageEl.textContent = 'Please enter your phone number.';
    messageEl.className = 'payment-message error';
    return;
  }

  // Get order details from the hidden form
  const listingId = document.getElementById('listingId')?.value || '';
  const listingTitle = document.getElementById('listingTitle')?.value || '';
  const sellerId = document.getElementById('sellerId')?.value || '';
  const amount = parseFloat(document.getElementById('amount')?.value) || 0;

  if (!listingId || !sellerId || amount <= 0) {
    messageEl.textContent = 'Order details are incomplete. Please go back and select an item.';
    messageEl.className = 'payment-message error';
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    messageEl.textContent = 'You must be logged in to make a payment.';
    messageEl.className = 'payment-message error';
    return;
  }

  // Calculate total
  const tax = Math.round(amount * TAX_RATE);
  const total = amount + DELIVERY_FEE + tax;

  btnPay.disabled = true;
  btnPay.innerHTML = '⏳ Processing...';
  messageEl.textContent = '';
  messageEl.className = 'payment-message';

  try {
    // Step 1: Create the transaction in Firestore
    const transactionId = await initPayment({
      buyerId: user.uid,
      sellerId,
      listingId,
      listingTitle,
      amount: total,
      paymentMethod,
      phoneNumber
    });

    // Step 2: Call the mobile money provider
    const result = await processPayment(transactionId);

    if (paymentMethod === 'orange_money' && result.paymentUrl) {
      messageEl.textContent = 'Redirecting to Orange Money...';
      messageEl.className = 'payment-message success';
      window.open(result.paymentUrl, '_blank');
    } else {
      messageEl.textContent = '📲 A payment prompt has been sent to your phone. Please approve it on your device.';
      messageEl.className = 'payment-message success';
    }

    await loadTransactions();

  } catch (error) {
    console.error('Payment error:', error);
    messageEl.textContent = `Payment failed: ${error.message}`;
    messageEl.className = 'payment-message error';
  } finally {
    btnPay.disabled = false;
    const totalAmount = document.getElementById('btn-pay-amount')?.textContent || '0';
    btnPay.innerHTML = `🔒 Pay ${totalAmount} XAF Now`;
  }
}

// ─── Initialize ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('Payment Gateway module initialized.');

  // 1. Setup radio card toggling for payment methods
  setupPaymentMethodToggle();

  // 2. Populate order summary from URL params (coming from marketplace)
  populateFromURLParams();

  // 3. Bind pay button
  const btnPay = document.getElementById('btn-pay');
  if (btnPay) {
    btnPay.addEventListener('click', handlePayNow);
  }

  // 4. Load existing transactions
  loadTransactions();
});

