/**
 * PhonePe integration seam.
 *
 * This module is the single place where the PhonePe checkout is wired in.
 * Until the backend flow below is connected, the handshake resolves
 * locally so the checkout states (idle → processing → success / failure /
 * pending) render correctly.
 *
 * Backend flow (kept intentionally narrow):
 *   1. Frontend calls POST /api/payments/phonepe/create
 *      with { orderId, amount, callbackUrl }.
 *   2. Backend creates the PhonePe transaction and returns a redirect URL.
 *   3. Frontend redirects the customer, then listens for the server-side
 *      webhook result (never trusts the browser redirect alone).
 *
 * NEVER put merchant keys, UPI PINs or card numbers in this file.
 */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * PhonePe handoff.
 * @param {{ orderId: string, amount: number, outcome?: 'success'|'failure'|'pending' }} args
 * @returns {Promise<{ ok: boolean, status: 'success'|'failed'|'pending', reference: string, message: string }>}
 */
export async function initiatePhonePePayment({ orderId, amount, outcome = 'success' } = {}) {
  const reference = `PP-${orderId || Date.now()}`;

  await wait(1500);

  if (outcome === 'failure') {
    return {
      ok: false,
      status: 'failed',
      reference,
      message: 'The bank declined this transaction. No amount has been charged.'
    };
  }

  if (outcome === 'pending') {
    return {
      ok: true,
      status: 'pending',
      reference,
      message: 'Awaiting confirmation from PhonePe. We will update your order once the payment clears.'
    };
  }

  return {
    ok: true,
    status: 'success',
    reference,
    message: `Payment of ₹${amount} was approved.`
  };
}
