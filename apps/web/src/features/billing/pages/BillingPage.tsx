import React, { useState } from 'react';
import { Download, Receipt, CheckCircle2, X, Plus, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions.api';

const PLANS = [
  { id: 'FREE', name: 'Free', price: '₹0', description: 'Up to 5 active jobs, Basic analytics', color: 'border-border' },
  { id: 'PROFESSIONAL', name: 'Professional', price: '₹4,999', description: 'Up to 50 active jobs, Advanced analytics, Priority support', color: 'border-primary' },
  { id: 'ENTERPRISE', name: 'Enterprise', price: '₹14,999', description: 'Unlimited jobs, Dedicated account manager, API access', color: 'border-amber-500' },
];

export default function BillingPage(): React.ReactElement {
  const queryClient = useQueryClient();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');

  const { data: subscription, isLoading: isLoadingSub } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionsApi.getCurrentSubscription,
  });

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: subscriptionsApi.getInvoices,
  });

  const upgradeMutation = useMutation({
    mutationFn: (plan: string) => subscriptionsApi.upgradePlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowUpgradeModal(false);
      alert('Plan upgraded successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to upgrade plan. Please try again.');
    },
  });

  const handleAddPayment = () => {
    if (!cardNumber || !cardExpiry || !cardCVV || !cardName) {
      alert('Please fill in all payment details.');
      return;
    }
    alert('Payment method added successfully!');
    setShowAddPayment(false);
    setCardNumber(''); setCardExpiry(''); setCardCVV(''); setCardName('');
  };

  const handleCancel = () => {
    alert('Your subscription has been cancelled. You will retain access until the end of the billing period.');
    setShowCancelModal(false);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Create a simple CSV/text download
    const content = `Invoice ID: ${invoiceId}\nDownloaded: ${new Date().toLocaleString()}\nStatus: Paid`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoadingSub || isLoadingInvoices) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'FREE';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Billing & Invoices</h1>
        <p className="text-muted-foreground mt-1">Manage your payment methods and download past invoices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {subscription?.status || 'Active'}
            </span>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold text-foreground capitalize">
              {currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
              <span className="text-lg text-muted-foreground font-normal"> / month</span>
            </p>
            <p className="text-muted-foreground mt-2 text-sm">Manage your jobs and candidates.</p>
          </div>
          <ul className="space-y-3 mb-6">
            {['Up to 50 active job slots', 'Advanced analytics dashboard', 'Dedicated account manager'].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> {feature}
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpgradeModal(true)}
              disabled={currentPlan === 'ENTERPRISE'}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {currentPlan === 'ENTERPRISE' ? 'Current Plan' : 'Upgrade Plan'}
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors hover:text-red-500"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
          <div className="flex-1">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-card border border-border rounded flex items-center justify-center">
                  <span className="font-bold text-blue-600 italic text-sm">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2028</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-muted px-2 py-1 rounded text-muted-foreground">Default</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddPayment(true)}
            className="w-full flex items-center justify-center gap-2 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-auto text-foreground"
          >
            <Plus className="w-4 h-4" /> Add Payment Method
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-lg text-foreground">Invoice History</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-sm text-muted-foreground border-b border-border">
                  <th className="p-4 font-medium">Invoice</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Plan</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-muted-foreground" /> {inv.id}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{inv.date}</td>
                    <td className="p-4 text-muted-foreground">{inv.plan}</td>
                    <td className="p-4 font-medium text-foreground">{inv.amount}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors inline-flex"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Add Payment Method</h2>
              <button onClick={() => setShowAddPayment(false)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Cardholder Name</label>
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Full name on card"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Card Number</label>
                <input
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/[^0-9 ]/g, '').replace(/(.{4})/g, '$1 ').trim())}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Expiry Date</label>
                  <input
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">CVV</label>
                  <input
                    type="password"
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="•••"
                    maxLength={4}
                    value={cardCVV}
                    onChange={e => setCardCVV(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <button
                onClick={handleAddPayment}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Choose a Plan</h2>
              <button onClick={() => setShowUpgradeModal(false)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {PLANS.filter(p => p.id !== currentPlan).map(plan => (
                <div key={plan.id} className={`border-2 ${plan.color} rounded-xl p-4 flex items-center justify-between`}>
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>
                    <p className="text-lg font-bold text-primary mt-2">{plan.price}<span className="text-sm font-normal text-muted-foreground"> /month</span></p>
                  </div>
                  <button
                    onClick={() => upgradeMutation.mutate(plan.id)}
                    disabled={upgradeMutation.isPending}
                    className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {upgradeMutation.isPending ? 'Upgrading...' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-border flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Cancel Subscription</h2>
            </div>
            <div className="p-5">
              <p className="text-muted-foreground text-sm">
                Are you sure you want to cancel your subscription? You will lose access to premium features at the end of the billing period.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-muted text-foreground py-2.5 rounded-lg font-medium hover:bg-muted/80 transition-colors"
                >
                  Keep Plan
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
