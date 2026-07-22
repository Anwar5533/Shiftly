/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, Wallet as WalletIcon, Lock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet.api';
import { format } from 'date-fns';

/** Format a number as INR currency */
function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
  });

  const { data: transactions, isLoading: isTxLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: walletApi.getTransactions,
  });

  const topUpMutation = useMutation({
    mutationFn: (amount: number) => walletApi.topUp(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setTopUpAmount('');
      alert('Top up successful!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to top up');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => walletApi.withdraw(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setWithdrawAmount('');
      alert('Withdrawal successful!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to withdraw');
    },
  });

  if (isWalletLoading || isTxLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading wallet...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Wallet & Payments</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your funds, view transactions, and handle payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Main Balance Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg">
              <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-20">
                <WalletIcon className="h-24 w-24" />
              </div>
              <div className="relative z-10">
                <p className="mb-1 font-medium text-primary-foreground/80">Available Balance</p>
                <h2 className="text-4xl font-bold tracking-tight">
                  {formatINR(Number(wallet?.balance || 0))}
                </h2>
                <div className="mt-6 flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Amount (₹)"
                      className="w-full rounded-lg border-0 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-white/50"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    />
                  </div>
                  <button
                    onClick={() => topUpAmount && topUpMutation.mutate(Number(topUpAmount))}
                    disabled={topUpMutation.isPending || !topUpAmount || Number(topUpAmount) <= 0}
                    className="flex items-center justify-center rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30 disabled:opacity-50"
                  >
                    {topUpMutation.isPending ? '...' : 'Top Up'}
                  </button>
                </div>
              </div>
            </div>

            {/* Escrow Balance Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div>
                <div className="mb-1 flex items-center gap-2 font-medium text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>In Escrow</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {formatINR(Number(wallet?.escrowBalance || 0))}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">Funds locked for active jobs</p>
              </div>
              <div className="mt-6 flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Amount (₹)"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
                <button
                  onClick={() => withdrawAmount && withdrawMutation.mutate(Number(withdrawAmount))}
                  disabled={
                    withdrawMutation.isPending || !withdrawAmount || Number(withdrawAmount) <= 0
                  }
                  className="flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
                >
                  {withdrawMutation.isPending ? '...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-semibold text-foreground">Recent Transactions</h3>
            </div>

            <div className="divide-y divide-border">
              {!transactions || transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No recent transactions</div>
              ) : (
                transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          tx.type === 'TOPUP' || tx.type === 'ESCROW_RELEASE'
                            ? 'bg-green-500/10 text-green-500'
                            : tx.type === 'WITHDRAWAL'
                              ? 'bg-blue-500/10 text-blue-500'
                              : tx.type === 'ESCROW_LOCK'
                                ? 'bg-orange-500/10 text-orange-500'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {tx.type === 'TOPUP' || tx.type === 'ESCROW_RELEASE' ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : tx.type === 'WITHDRAWAL' ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type
                          safety
                          {format(new Date(tx.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === 'TOPUP' || tx.type === 'ESCROW_RELEASE'
                            ? 'text-green-500'
                            : 'text-foreground'
                        }`}
                      >
                        {tx.type === 'TOPUP' || tx.type === 'ESCROW_RELEASE' ? '+' : '-'}
                        {formatINR(Number(tx.amount))}
                      </p>
                      <p
                        className={`mt-1 text-xs font-medium ${
                          tx.status === 'COMPLETED'
                            ? 'text-green-500'
                            : tx.status === 'PENDING'
                              ? 'text-amber-500'
                              : 'text-red-500'
                        }`}
                      >
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
