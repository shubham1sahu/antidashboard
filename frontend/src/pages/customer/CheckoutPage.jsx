import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billService } from '../../api/billService';
import toast from 'react-hot-toast';

const MIN_ONLINE_PAYMENT_INR = 50;

const CheckoutPage = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const data = await billService.getBillById(billId);
      setBill(data);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to fetch bill details';
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = () => {
    navigate(`/customer/payment/${bill.id}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading bill...</div>;
  }

  if (!bill) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Bill not found.</div>;
  }

  const isBelowOnlinePaymentMinimum = Number(bill.grandTotal ?? 0) < MIN_ONLINE_PAYMENT_INR;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-lg">
        <div className="border-b border-[var(--border-color)] p-6">
          <h2 className="text-center text-2xl font-bold">Checkout Summary</h2>
          <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">Bill #{bill.billNumber}</p>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between py-2">
            <span className="font-medium">Subtotal</span>
            <span>Rs {bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-[var(--text-secondary)]">
            <span>Tax (5%)</span>
            <span>Rs {bill.tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[var(--border-color)] py-2 pb-4 text-[var(--text-secondary)]">
            <span>Discount</span>
            <span>- Rs {bill.discount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-4 text-xl font-bold text-[var(--accent-primary)]">
            <span>Grand Total</span>
            <span>Rs {bill.grandTotal.toFixed(2)}</span>
          </div>
          {isBelowOnlinePaymentMinimum && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Online card payments require a bill total of at least Rs 50.00 because of Stripe&apos;s minimum charge.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 bg-[var(--bg-tertiary)] p-6">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-gray-500 px-6 py-2 text-white transition-colors hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={proceedToPayment}
            disabled={isBelowOnlinePaymentMinimum}
            className="rounded-lg bg-[var(--accent-primary)] px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
