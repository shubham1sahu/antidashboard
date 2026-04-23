import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billService } from '../../api/billService';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrGenerateBill();
  }, [orderId]);

  const fetchOrGenerateBill = async () => {
    try {
      setLoading(true);
      const generatedBill = await billService.generateBill(orderId);
      setBill(generatedBill);
    } catch (error) {
      toast.error('Failed to generate or fetch bill');
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--text-primary)]">
      <div className="max-w-2xl mx-auto bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-color)]">
          <h2 className="text-2xl font-bold text-center">Checkout Summary</h2>
          <p className="text-center text-sm text-[var(--text-secondary)] mt-1">Bill #{bill.billNumber}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Subtotal</span>
            <span>₹{bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 text-[var(--text-secondary)]">
            <span>Tax (5%)</span>
            <span>₹{bill.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-4">
            <span>Discount</span>
            <span>- ₹{bill.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-4 text-xl font-bold text-[var(--accent-primary)]">
            <span>Grand Total</span>
            <span>₹{bill.grandTotal.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="p-6 bg-[var(--bg-tertiary)] flex justify-end gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={proceedToPayment}
            className="px-6 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-blue-600 text-white font-medium shadow-md transition-colors"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
