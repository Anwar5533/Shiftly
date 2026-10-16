import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../../../shared/lib/test-utils';
import WalletPage from './WalletPage';
import { walletApi } from '../api/wallet.api';

vi.mock('../api/wallet.api', () => ({
  walletApi: {
    getWallet: vi.fn(),
    getTransactions: vi.fn(),
    topUp: vi.fn(),
    withdraw: vi.fn(),
  },
}));

describe('WalletPage', () => {
  const user = userEvent.setup();

  const mockWallet = {
    id: 'wallet-1',
    userId: 'user-1',
    balance: 5000,
    escrowBalance: 1500,
    currency: 'INR',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockTransactions = [
    {
      id: 'tx-1',
      walletId: 'wallet-1',
      type: 'TOPUP' as const,
      amount: 2000,
      status: 'COMPLETED' as const,
      description: 'Account Top-up',
      createdAt: '2026-10-14T10:00:00.000Z',
    },
    {
      id: 'tx-2',
      walletId: 'wallet-1',
      type: 'ESCROW_LOCK' as const,
      amount: 1500,
      status: 'PENDING' as const,
      description: 'Escrow lock for Shift #101',
      createdAt: '2026-10-14T11:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(walletApi.getWallet).mockResolvedValue(mockWallet);
    vi.mocked(walletApi.getTransactions).mockResolvedValue(mockTransactions);
  });

  it('renders loading state initially', () => {
    vi.mocked(walletApi.getWallet).mockReturnValue(new Promise(() => {}));
    customRender(<WalletPage />);
    expect(screen.getByText('Loading wallet...')).toBeInTheDocument();
  });

  it('renders balances and transaction history correctly', async () => {
    customRender(<WalletPage />);

    await waitFor(() => {
      expect(screen.getByText('Wallet & Payments')).toBeInTheDocument();
    });

    // Check available balance and escrow
    expect(screen.getByRole('heading', { name: /₹5,000/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /₹1,500/ })).toBeInTheDocument();
    expect(screen.getByText('In Escrow')).toBeInTheDocument();

    // Check transactions
    expect(screen.getByText('Account Top-up')).toBeInTheDocument();
    expect(screen.getByText('+₹2,000.00')).toBeInTheDocument();
    expect(screen.getByText('Escrow lock for Shift #101')).toBeInTheDocument();
    expect(screen.getByText('-₹1,500.00')).toBeInTheDocument();
  });

  it('submits a top up mutation successfully', async () => {
    vi.mocked(walletApi.topUp).mockResolvedValue({
      ...mockWallet,
      balance: 7000,
    });

    customRender(<WalletPage />);

    await waitFor(() => {
      expect(screen.getByText('Wallet & Payments')).toBeInTheDocument();
    });

    const topUpInput = screen.getAllByPlaceholderText('Amount (₹)')[0];
    const topUpButton = screen.getByRole('button', { name: 'Top Up' });

    expect(topUpButton).toBeDisabled();

    await user.type(topUpInput, '2000');
    expect(topUpButton).not.toBeDisabled();

    await user.click(topUpButton);

    await waitFor(() => {
      expect(walletApi.topUp).toHaveBeenCalledWith(2000);
      expect(screen.getByText('Top up successful!')).toBeInTheDocument();
    });
  });

  it('submits a withdrawal mutation successfully', async () => {
    vi.mocked(walletApi.withdraw).mockResolvedValue({
      ...mockWallet,
      balance: 4000,
    });

    customRender(<WalletPage />);

    await waitFor(() => {
      expect(screen.getByText('Wallet & Payments')).toBeInTheDocument();
    });

    const withdrawInput = screen.getAllByPlaceholderText('Amount (₹)')[1];
    const withdrawButton = screen.getByRole('button', { name: 'Withdraw' });

    expect(withdrawButton).toBeDisabled();

    await user.type(withdrawInput, '1000');
    expect(withdrawButton).not.toBeDisabled();

    await user.click(withdrawButton);

    await waitFor(() => {
      expect(walletApi.withdraw).toHaveBeenCalledWith(1000);
      expect(screen.getByText('Withdrawal successful!')).toBeInTheDocument();
    });
  });

  it('handles top up error response and displays alert dialog', async () => {
    vi.mocked(walletApi.topUp).mockRejectedValue({
      response: { data: { message: 'Card declined or invalid amount' } },
    });

    customRender(<WalletPage />);

    await waitFor(() => {
      expect(screen.getByText('Wallet & Payments')).toBeInTheDocument();
    });

    const topUpInput = screen.getAllByPlaceholderText('Amount (₹)')[0];
    const topUpButton = screen.getByRole('button', { name: 'Top Up' });

    await user.type(topUpInput, '500');
    await user.click(topUpButton);

    await waitFor(() => {
      expect(screen.getByText('Card declined or invalid amount')).toBeInTheDocument();
    });
  });

  it('displays empty state when no transactions exist', async () => {
    vi.mocked(walletApi.getTransactions).mockResolvedValue([]);

    customRender(<WalletPage />);

    await waitFor(() => {
      expect(screen.getByText('No recent transactions')).toBeInTheDocument();
    });
  });
});
