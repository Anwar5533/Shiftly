import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../../../shared/lib/test-utils';
import SettingsPage from './SettingsPage';
import { authApi } from '@/features/auth/api/auth.api';
import { referralsApi } from '../api/referrals.api';

vi.mock('@/features/auth/api/auth.api', () => ({
  authApi: {
    updatePassword: vi.fn(),
    sendEmailOtp: vi.fn(),
    resendOtp: vi.fn(),
    verifyEmail: vi.fn(),
    verifyPhone: vi.fn(),
  },
}));

vi.mock('../api/referrals.api', () => ({
  referralsApi: {
    getReferralCode: vi.fn(),
  },
}));

vi.mock('@/app/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/store')>();
  return {
    ...actual,
    useAppSelector: vi.fn(),
  };
});

import { useAppSelector } from '@/app/store';

describe('SettingsPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppSelector).mockReturnValue({
      user: {
        id: '1',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'USER',
        status: 'ACTIVE',
      },
    });
    vi.mocked(referralsApi.getReferralCode).mockResolvedValue({
      code: 'REF12345',
      url: 'https://shiftly.example.com/ref/REF12345',
      totalReferrals: 0,
      rewardsEarned: 0,
      status: 'ACTIVE',
    });
  });

  it('renders without crashing', async () => {
    customRender(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your account settings and preferences.')).toBeInTheDocument();

    // Switch to referrals tab to check if code loads
    const referralsTab = screen.getByRole('button', { name: /referrals/i });
    await user.click(referralsTab);

    // Wait for referral code to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('REF12345')).toBeInTheDocument();
    });
  });

  it('toggles notification preferences', async () => {
    customRender(<SettingsPage />);

    // Switch to Notifications tab
    const notifTab = screen.getByRole('button', { name: /notifications/i });
    await user.click(notifTab);

    // Switch SMS on
    const smsSwitch = screen.getAllByRole('checkbox')[1]; // they are styled as checkboxes visually via logic or actually inputs type checkbox
    expect(smsSwitch).not.toBeChecked();
    await user.click(smsSwitch);
    // Wait for the local state change
    expect(smsSwitch).toBeChecked();

    // Switch Email off (it defaults to on)
    const emailSwitch = screen.getAllByRole('checkbox')[0];
    expect(emailSwitch).toBeChecked();
    await user.click(emailSwitch);
    expect(emailSwitch).not.toBeChecked();
  });

  it('validates password match on update', async () => {
    customRender(<SettingsPage />);

    const securityTab = screen.getByRole('button', { name: /security/i });
    await user.click(securityTab);

    const currentPass = screen.getByPlaceholderText('Current Password');
    const newPass = screen.getByPlaceholderText('New Password');
    const confirmPass = screen.getByPlaceholderText('Confirm New Password');
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    await user.type(currentPass, 'OldPass1!');
    await user.type(newPass, 'NewPass1!');
    await user.type(confirmPass, 'DifferentPass1!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
    });

    expect(authApi.updatePassword).not.toHaveBeenCalled();
  });

  it('submits password update successfully', async () => {
    vi.mocked(authApi.updatePassword).mockResolvedValue(undefined);

    customRender(<SettingsPage />);

    const securityTab = screen.getByRole('button', { name: /security/i });
    await user.click(securityTab);

    const currentPass = screen.getByPlaceholderText('Current Password');
    const newPass = screen.getByPlaceholderText('New Password');
    const confirmPass = screen.getByPlaceholderText('Confirm New Password');
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    await user.type(currentPass, 'OldPass1!');
    await user.type(newPass, 'NewPass1!');
    await user.type(confirmPass, 'NewPass1!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(authApi.updatePassword).toHaveBeenCalledWith(
        {
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass1!',
        },
        expect.anything(),
      );
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
    });
  });

  it('displays error from API on password update failure', async () => {
    vi.mocked(authApi.updatePassword).mockRejectedValue({
      response: { data: { message: 'Incorrect current password' } },
    });

    customRender(<SettingsPage />);

    const securityTab = screen.getByRole('button', { name: /security/i });
    await user.click(securityTab);

    const currentPass = screen.getByPlaceholderText('Current Password');
    const newPass = screen.getByPlaceholderText('New Password');
    const confirmPass = screen.getByPlaceholderText('Confirm New Password');
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    await user.type(currentPass, 'OldPass1!');
    await user.type(newPass, 'NewPass1!');
    await user.type(confirmPass, 'NewPass1!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Incorrect current password')).toBeInTheDocument();
    });
  });

  it('triggers email OTP and verifies successfully', async () => {
    vi.mocked(authApi.sendEmailOtp).mockResolvedValue({ message: 'OTP Sent' });
    vi.mocked(authApi.verifyEmail).mockResolvedValue(undefined);

    customRender(<SettingsPage />);

    // Click verify on Email
    const verifyBtns = screen.getAllByRole('button', { name: /verify/i });
    const emailVerifyBtn = verifyBtns[0];

    await user.click(emailVerifyBtn);

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText('Verify Email')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('6-digit code');
    const verifyBtnsAll = screen.getAllByRole('button', { name: /^Verify$/i });
    const submitVerifyBtn = verifyBtnsAll[verifyBtnsAll.length - 1];

    await user.type(otpInput, '123456');
    await user.click(submitVerifyBtn);

    await waitFor(() => {
      expect(authApi.verifyEmail).toHaveBeenCalledWith(
        { email: 'john@example.com', otp: '123456' },
        expect.anything(),
      );
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Email verified successfully!')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ok/i }));

    // Modal should close and button should become Verified
    expect(screen.queryByText('Verify Email')).not.toBeInTheDocument();
    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0);
  });

  it('displays error on invalid email OTP', async () => {
    vi.mocked(authApi.sendEmailOtp).mockResolvedValue({ message: 'OTP Sent' });
    vi.mocked(authApi.verifyEmail).mockRejectedValue({
      response: { data: { message: 'Invalid OTP' } },
    });

    customRender(<SettingsPage />);

    const emailVerifyBtn = screen.getAllByRole('button', { name: /verify/i })[0];
    await user.click(emailVerifyBtn);

    await waitFor(() => {
      expect(screen.getByText('Verify Email')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('6-digit code');
    const verifyBtnsAll = screen.getAllByRole('button', { name: /^Verify$/i });
    const submitVerifyBtn = verifyBtnsAll[verifyBtnsAll.length - 1];

    await user.type(otpInput, '000000');
    await user.click(submitVerifyBtn);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ok/i }));
  });

  it('triggers phone OTP and verifies successfully', async () => {
    vi.mocked(authApi.resendOtp).mockResolvedValue({ message: 'OTP Sent' });
    vi.mocked(authApi.verifyPhone).mockResolvedValue(undefined);

    customRender(<SettingsPage />);

    // Click verify on Phone
    const phoneVerifyBtn = screen.getAllByRole('button', { name: /verify/i })[1];
    await user.click(phoneVerifyBtn);

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByText('Verify Phone')).toBeInTheDocument();
    });

    const otpInput = screen.getByPlaceholderText('6-digit code');
    const verifyBtnsAll = screen.getAllByRole('button', { name: /^Verify$/i });
    const submitVerifyBtn = verifyBtnsAll[verifyBtnsAll.length - 1];

    await user.type(otpInput, '123456');
    await user.click(submitVerifyBtn);

    await waitFor(() => {
      expect(authApi.verifyPhone).toHaveBeenCalledWith(
        { phone: '+91 98765 43210', otp: '123456' },
        expect.anything(),
      );
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Phone verified successfully!')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /ok/i }));
  });

  it('handles closing OTP modal', async () => {
    vi.mocked(authApi.sendEmailOtp).mockResolvedValue({ message: 'OTP Sent' });

    customRender(<SettingsPage />);

    const emailVerifyBtn = screen.getAllByRole('button', { name: /verify/i })[0];
    await user.click(emailVerifyBtn);

    await waitFor(() => {
      expect(screen.getByText('Verify Email')).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelBtn);

    expect(screen.queryByText('Verify Email')).not.toBeInTheDocument();
  });

  it('unverifies contact when changing email or phone', async () => {
    // Setup verified state
    vi.mocked(authApi.sendEmailOtp).mockResolvedValue({ message: 'OTP Sent' });
    vi.mocked(authApi.verifyEmail).mockResolvedValue(undefined);
    vi.mocked(authApi.resendOtp).mockResolvedValue({ message: 'OTP Sent' });
    vi.mocked(authApi.verifyPhone).mockResolvedValue(undefined);

    customRender(<SettingsPage />);

    // Verify Email
    const verifyBtns = screen.getAllByRole('button', { name: /verify/i });
    await user.click(verifyBtns[0]);
    await waitFor(() => expect(screen.getByText('Verify Email')).toBeInTheDocument());
    await user.type(screen.getByPlaceholderText('6-digit code'), '123456');
    const verifyBtnsAll = screen.getAllByRole('button', { name: /^Verify$/i });
    await user.click(verifyBtnsAll[verifyBtnsAll.length - 1]);

    await waitFor(() =>
      expect(screen.getByText('Email verified successfully!')).toBeInTheDocument(),
    );

    // Close alert dialog
    const okBtn = screen.getByRole('button', { name: /ok/i });
    await user.click(okBtn);

    // Verify Phone
    // Since email verify button is gone, phone verify is now at index 0
    const phoneVerifyBtnAfter = screen.getAllByRole('button', { name: /^Verify$/i })[0];
    await user.click(phoneVerifyBtnAfter);
    await waitFor(() => expect(screen.getByText('Verify Phone')).toBeInTheDocument());
    await user.type(screen.getByPlaceholderText('6-digit code'), '123456');
    const verifyBtnsAll2 = screen.getAllByRole('button', { name: /^Verify$/i });
    await user.click(verifyBtnsAll2[verifyBtnsAll2.length - 1]);

    await waitFor(() =>
      expect(screen.getByText('Phone verified successfully!')).toBeInTheDocument(),
    );
    await user.click(screen.getByRole('button', { name: /ok/i }));

    expect(screen.getAllByText('Verified').length).toBe(2);

    // Now change email, should unverify email
    const emailInput = screen.getByDisplayValue('john@example.com');
    await user.type(emailInput, 'm');

    expect(screen.getAllByText('Verified').length).toBe(1);

    // Now change phone, should unverify phone
    const phoneInput = screen.getByDisplayValue('+91 98765 43210');
    await user.type(phoneInput, '1');

    expect(screen.queryByText('Verified')).not.toBeInTheDocument();
  });
});
