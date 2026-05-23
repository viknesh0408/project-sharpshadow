import api from './api';

declare global {
  interface Window { Razorpay: any; }
}

export interface CreateOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  productTitle: string;
  productId: number;
}

export interface VerifyPaymentData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const orderService = {
  createOrder: (productId: number): Promise<CreateOrderResponse> =>
    api.post('/orders/create', { productId }).then(r => r.data),

  verifyPayment: (data: VerifyPaymentData) =>
    api.post('/orders/verify', data).then(r => r.data),

  getOrderHistory: () =>
    api.get('/orders/history').then(r => r.data),
};

// ─── Razorpay Integration ─────────────────────────────────────────────────────
export const initiateRazorpayPayment = async (
  productId: number,
  userDetails: { name: string; email: string; phone?: string },
  onSuccess: () => void,
  onError: (msg: string) => void
) => {
  try {
    // 1. Create order on backend
    const orderData = await orderService.createOrder(productId);

    // 2. Load Razorpay SDK if not loaded
    if (!window.Razorpay) {
      await loadRazorpayScript();
    }

    // 3. Open Razorpay checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'SharpShadow',
      description: orderData.productTitle,
      order_id: orderData.razorpayOrderId,
      prefill: {
        name:  userDetails.name,
        email: userDetails.email,
        contact: userDetails.phone || '',
      },
      theme: { color: '#6366f1' },
      handler: async (response: any) => {
        try {
          // 4. Verify payment on backend
          await orderService.verifyPayment({
            razorpayOrderId:  response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          onSuccess();
        } catch {
          onError('Payment verification failed. Contact support.');
        }
      },
      modal: {
        ondismiss: () => onError('Payment cancelled'),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err: any) {
    onError(err?.response?.data?.message || 'Failed to initiate payment');
  }
};

const loadRazorpayScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.head.appendChild(script);
  });

export const downloadService = {
  getDownloadUrl: (productId: number): Promise<{ downloadUrl: string; expiresIn: string }> =>
    api.get(`/download/${productId}`).then(r => r.data),
};

export default orderService;
