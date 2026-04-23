import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '../../api/paymentService';
import toast from 'react-hot-toast';

const normalizeStripePublishableKey = (value) => {
  if (!value) return '';

  const trimmed = value.trim();
  const commentIndex = trimmed.indexOf('#');
  return commentIndex >= 0 ? trimmed.slice(0, commentIndex).trim() : trimmed;
};

const isValidStripePublishableKey = (value) => {
  if (!value || value.includes('...')) return false;

  const lowercase = value.toLowerCase();
  if (lowercase.includes('replace with actual')) return false;

  return value.startsWith('pk_test_') || value.startsWith('pk_live_');
};

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  fallback;

const stripePublishableKey = normalizeStripePublishableKey(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const stripePromise = isValidStripePublishableKey(stripePublishableKey)
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

const CheckoutForm = ({ clientSecret, paymentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      toast.error(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await paymentService.verifyPayment(paymentId, paymentIntent.id);
        toast.success("Payment successful!");
        navigate('/customer/menu'); // Or to a success page
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to verify payment with server."));
      } finally {
        setIsProcessing(false);
      }
    } else {
        setIsProcessing(false);
        toast.error("Payment failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)]">
        <CardElement options={{
            style: {
                base: {
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    '::placeholder': {
                        color: 'var(--text-secondary)',
                    },
                },
                invalid: {
                    color: '#ef4444',
                },
            },
        }}/>
      </div>
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full py-3 rounded-lg bg-[var(--accent-primary)] hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const { billId } = useParams();
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    initiatePayment();
  }, [billId]);

  const initiatePayment = async () => {
    if (!isValidStripePublishableKey(stripePublishableKey)) {
      const message = 'Stripe publishable key is missing or still a placeholder. Set a real VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env.';
      setErrorMessage(message);
      toast.error(message);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await paymentService.createOrder(billId);
      setClientSecret(res.clientSecret);
      setPaymentId(res.paymentId);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to initiate payment');
      setErrorMessage(message);
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading payment gateway...</div>;

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center text-red-500">
        {errorMessage || 'Error loading payment.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--text-primary)]">
      <div className="max-w-md mx-auto bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-[var(--border-color)] overflow-hidden p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Secure Payment</h2>
        <Elements stripe={stripePromise}>
          <CheckoutForm clientSecret={clientSecret} paymentId={paymentId} />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentPage;
