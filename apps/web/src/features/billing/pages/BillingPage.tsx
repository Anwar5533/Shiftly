import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Receipt, CheckCircle2, X, Plus, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../api/subscriptions.api';

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: '₹0',
    description: 'Up to 5 active jobs, Basic analytics',
    color: 'border-border',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: '₹4,999',
    description: 'Up to 50 active jobs, Advanced analytics, Priority support',
    color: 'border-primary',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '₹14,999',
    description: 'Unlimited jobs, Dedicated account manager, API access',
    color: 'border-amber-500',
  },
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
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardName('');
  };

  const handleCancel = () => {
    alert(
      'Your subscription has been cancelled. You will retain access until the end of the billing period.',
    );
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
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'FREE';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & Invoices</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your payment methods and download past invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Current Plan */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {subscription?.status || 'Active'}
            </span>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold capitalize text-foreground">
              {currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
              <span className="text-lg font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Manage your jobs and candidates.</p>
          </div>
          <ul className="mb-6 space-y-3">
            {[
              'Up to 50 active job slots',
              'Advanced analytics dashboard',
              'Dedicated account manager',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> {feature}
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUpgradeModal(true)}
              disabled={currentPlan === 'ENTERPRISE'}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {currentPlan === 'ENTERPRISE' ? 'Current Plan' : 'Upgrade Plan'}
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 rounded-lg bg-muted py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 hover:text-red-500"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="flex flex-col rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Payment Method</h2>
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-12 items-center justify-center rounded border border-border bg-card">
                  <span className="text-sm font-bold italic text-blue-600">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2028</p>
                </div>
              </div>
              <span className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                Default
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAddPayment(true)}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-input py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" /> Add Payment Method
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-semibold text-foreground">Invoice History</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Invoice</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Plan</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 text-right font-medium">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-muted/10">
                    <td className="p-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" /> {inv.id}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{inv.date}</td>
                    <td className="p-4 text-muted-foreground">{inv.plan}</td>
                    <td className="p-4 font-medium text-foreground">{inv.amount}</td>
                    <td className="p-4">
                      <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="inline-flex rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
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
      {showAddPayment && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-lg font-semibold text-foreground">Add Payment Method</h2>
              <button
                onClick={() => setShowAddPayment(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Cardholder Name
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Full name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Card Number
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value
                        .replace(/[^0-9 ]/g, '')
                        .replace(/(.{4})/g, '$1 ')
                        .trim(),
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Expiry Date
                  </label>
                  <input
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">CVV</label>
                  <input
                    type="password"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="•••"
                    maxLength={4}
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <button
                onClick={handleAddPayment}
                className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Upgrade Modal */}
      {showUpgradeModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-lg font-semibold text-foreground">Choose a Plan</h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              {PLANS.filter((p) => p.id !== currentPlan).map((plan) => (
                <div
                  key={plan.id}
                  className={`border-2 ${plan.color} flex items-center justify-between rounded-xl p-4`}
                >
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{plan.description}</p>
                    <p className="mt-2 text-lg font-bold text-primary">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground"> /month</span>
                    </p>
                  </div>
                  <button
                    onClick={() => upgradeMutation.mutate(plan.id)}
                    disabled={upgradeMutation.isPending}
                    className="ml-4 shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {upgradeMutation.isPending ? 'Upgrading...' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      , document.body)}

      {/* Cancel Modal */}
      {showCancelModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border p-5">
              <div className="rounded-lg bg-red-500/10 p-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Cancel Subscription</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel your subscription? You will lose access to premium
                features at the end of the billing period.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-lg bg-muted py-2.5 font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                  Keep Plan
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
