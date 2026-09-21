import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../../../shared/lib/test-utils';
import LoginPage from './LoginPage';
import { authApi } from '../api/auth.api';
import * as reactRouterDom from 'react-router-dom';

// Mock the auth api module
vi.mock('../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    resendOtp: vi.fn(),
  },
}));

// Mock the jwt util
vi.mock('../utils/jwt', () => ({
  jwtDecode: vi.fn().mockImplementation((token: string) => {
    if (token.includes('admin')) return { role: 'ADMIN' };
    if (token.includes('worker')) return { role: 'WORKER' };
    if (token.includes('employer')) return { role: 'EMPLOYER' };
    if (token.includes('recruiter')) return { role: 'RECRUITER' };
    return { role: 'USER' };
  }),
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...(actual as typeof import('framer-motion')),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof reactRouterDom>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and defaults to phone mode', () => {
    customRender(<LoginPage />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();

    // Check if Phone OTP input is rendered by default
    expect(screen.getByLabelText(/Phone number/i)).toBeInTheDocument();
  });

  it('switches between phone and email mode', async () => {
    customRender(<LoginPage />);

    // Switch to email mode
    const emailModeBtn = screen.getByRole('button', { name: /email/i });
    await user.click(emailModeBtn);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();

    // Switch back to phone mode
    const phoneModeBtn = screen.getByRole('button', { name: /phone otp/i });
    await user.click(phoneModeBtn);
    expect(screen.getByLabelText(/Phone number/i)).toBeInTheDocument();
  });

  it('toggles password visibility in phone mode', async () => {
    customRender(<LoginPage />);
    const passwordInput = screen.getByLabelText(/^Password$/);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility in email mode', async () => {
    customRender(<LoginPage />);

    // Switch to email mode
    const emailModeBtn = screen.getByRole('button', { name: /email/i });
    await user.click(emailModeBtn);

    const passwordInput = screen.getByLabelText(/^Password$/);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays validation errors in phone mode', async () => {
    customRender(<LoginPage />);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    const phoneInput = screen.getByLabelText(/Phone number/i);
    await user.clear(phoneInput);

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/enter a valid phone number/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits phone mode form and navigates to verify OTP', async () => {
    vi.mocked(authApi.resendOtp).mockResolvedValue({ success: true, message: 'OTP Sent' });

    customRender(<LoginPage />);
    const phoneInput = screen.getByLabelText(/Phone number/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    await user.clear(phoneInput);
    await user.type(phoneInput, '+919999999999');
    await user.type(passwordInput, 'ValidPass123!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(authApi.resendOtp).toHaveBeenCalledWith({ phone: '+919999999999' });
      expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', {
        state: { phone: '+919999999999' },
      });
    });
  });

  it('handles server error on phone submission', async () => {
    vi.mocked(authApi.resendOtp).mockRejectedValue({
      response: { data: { error: { message: 'Invalid credentials' } } },
    });

    customRender(<LoginPage />);
    const phoneInput = screen.getByLabelText(/Phone number/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    await user.clear(phoneInput);
    await user.type(phoneInput, '+919999999999');
    await user.type(passwordInput, 'ValidPass123!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('displays validation errors in email mode', async () => {
    customRender(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /email/i }));

    const submitBtn = screen.getByRole('button', { name: /continue/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits email mode form successfully as admin', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'admin.token.here',
      user: { id: '1', role: 'ADMIN', email: 'test@example.com', phone: '', status: 'ACTIVE' },
    });

    customRender(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /email/i }));

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'ValidPass123!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'ValidPass123!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  it('submits email mode form successfully as worker', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'worker.token.here',
      user: { id: '1', role: 'WORKER', email: 'test@example.com', phone: '', status: 'ACTIVE' },
    });

    customRender(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /email/i }));

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    await user.type(emailInput, 'worker@example.com');
    await user.type(passwordInput, 'ValidPass123!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/worker', { replace: true });
    });
  });

  it('submits email mode form successfully as employer', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'employer.token.here',
      user: { id: '1', role: 'EMPLOYER', email: 'test@example.com', phone: '', status: 'ACTIVE' },
    });

    customRender(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /email/i }));

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    await user.type(emailInput, 'employer@example.com');
    await user.type(passwordInput, 'ValidPass123!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/employer', { replace: true });
    });
  });

  it('submits email mode form successfully as recruiter', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'recruiter.token.here',
      user: { id: '1', role: 'RECRUITER', email: 'test@example.com', phone: '', status: 'ACTIVE' },
    });

    customRender(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /email/i }));

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    await user.type(emailInput, 'recruiter@example.com');
    await user.type(passwordInput, 'ValidPass123!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/recruiter', { replace: true });
    });
  });

  it('submits email mode form successfully as unmapped role', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'user.token.here',
      user: {
        id: '1',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: 'USER' as any,
        email: 'test@example.com',
        phone: '',
        status: 'ACTIVE',
      },
    });

    customRender(<LoginPage />);
    await user.click(screen.getByRole('button', { name: /email/i }));

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'ValidPass123!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('normalizes phone number without + prefix', async () => {
    vi.mocked(authApi.resendOtp).mockResolvedValue({ success: true, message: 'OTP Sent' });

    customRender(<LoginPage />);
    const phoneInput = screen.getByLabelText(/Phone number/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitBtn = screen.getByRole('button', { name: /continue/i });

    await user.clear(phoneInput);
    await user.type(phoneInput, '919999999999'); // No +
    await user.type(passwordInput, 'ValidPass123!');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(authApi.resendOtp).toHaveBeenCalledWith({ phone: '+919999999999' });
    });
  });
});
