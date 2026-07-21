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
    }
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
    }
  });

  if (isWalletLoading || isTxLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading wallet...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Wallet & Payments</h1>
        <p className="text-muted-foreground mt-1">Manage your funds, view transactions, and handle payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Main Balance Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <WalletIcon className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-primary-foreground/80 font-medium mb-1">Available Balance</p>
                <h2 className="text-4xl font-bold tracking-tight">
                  {formatINR(Number(wallet?.balance || 0))}
                </h2>
                <div className="mt-6 flex gap-3">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="Amount (₹)"
                      min="1"
                      className="w-full text-slate-900 bg-white/90 px-3 py-2 rounded-lg text-sm border-0 outline-none focus:ring-2 focus:ring-white/50"
                      value={topUpAmount}
                      onChange={e => setTopUpAmount(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => topUpAmount && topUpMutation.mutate(Number(topUpAmount))}
                    disabled={topUpMutation.isPending || !topUpAmount || Number(topUpAmount) <= 0}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center disabled:opacity-50"
                  >
                    {topUpMutation.isPending ? '...' : 'Top Up'}
                  </button>
                </div>
              </div>
            </div>

            {/* Escrow Balance Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground font-medium mb-1">
                  <Lock className="w-4 h-4" />
                  <span>In Escrow</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {formatINR(Number(wallet?.escrowBalance || 0))}
                </h2>
                <p className="text-xs text-muted-foreground mt-2">Funds locked for active jobs</p>
              </div>
              <div className="mt-6 flex gap-3">
                <div className="flex-1">
                  <input 
                    type="number" 
                    placeholder="Amount (₹)"
                    min="1"
                    className="w-full bg-background border border-input text-foreground px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => withdrawAmount && withdrawMutation.mutate(Number(withdrawAmount))}
                  disabled={withdrawMutation.isPending || !withdrawAmount || Number(withdrawAmount) <= 0}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center disabled:opacity-50"
                >
                  {withdrawMutation.isPending ? '...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Recent Transactions</h3>
            </div>
            
            <div className="divide-y divide-border">
              {(!transactions || transactions.length === 0) ? (
                <div className="p-8 text-center text-muted-foreground">No recent transactions</div>
              ) : (
                transactions.map((tx: any) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === 'TOPUP' || tx.type === 'ESCROW_RELEASE' ? 'bg-green-500/10 text-green-500' :
                        tx.type === 'WITHDRAWAL' ? 'bg-blue-500/10 text-blue-500' :
                        tx.type === 'ESCROW_LOCK' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {tx.type === 'TOPUP' || tx.type === 'ESCROW_RELEASE' ? <ArrowDownLeft className="w-5 h-5" /> :
                         tx.type === 'WITHDRAWAL' ? <ArrowUpRight className="w-5 h-5" /> :
                         <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {format(new Date(tx.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.type === 'TOPUP' || tx.type === 'ESCROW_RELEASE' ? 'text-green-500' : 'text-foreground'
                      }`}>
                        {tx.type === 'TOPUP' || tx.type === 'ESCROW_RELEASE' ? '+' : '-'}
                        {formatINR(Number(tx.amount))}
                      </p>
                      <p className={`text-xs font-medium mt-1 ${
                        tx.status === 'COMPLETED' ? 'text-green-500' :
                        tx.status === 'PENDING' ? 'text-amber-500' : 'text-red-500'
                      }`}>
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
