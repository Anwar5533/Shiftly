import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../../../shared/lib/test-utils.tsx';
import OtpPage from './OtpPage';
import { authApi } from '../api/auth.api';

const mockNavigate = vi.fn();
let mockLocationState: any = { phone: '+919876543210' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: mockLocationState,
    }),
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-mock">Redirect: {to}</div>,
  };
});

vi.mock('../api/auth.api', () => ({
  authApi: {
    verifyOtp: vi.fn(),
    resendOtp: vi.fn(),
  },
}));

vi.mock('../utils/jwt', () => ({
  jwtDecode: vi.fn().mockImplementation((token: string) => {
    if (token.includes('admin')) return { role: 'ADMIN' };
    if (token.includes('worker')) return { role: 'WORKER' };
    if (token.includes('employer')) return { role: 'EMPLOYER' };
    if (token.includes('recruiter')) return { role: 'RECRUITER' };
    return { role: 'USER' };
  }),
}));

describe('OtpPage', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
    mockLocationState = { phone: '+919876543210' };
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('redirects to login if no phone or email in state', () => {
    mockLocationState = null;
    customRender(<OtpPage />);
    expect(screen.getByTestId('navigate-mock')).toHaveTextContent('Redirect: /login');
  });

  it('renders correctly with phone state', () => {
    customRender(<OtpPage />);
    expect(screen.getByText(/Verify your identity/i)).toBeInTheDocument();
    expect(screen.getByText('+919876543210')).toBeInTheDocument();
  });

  it('allows typing numeric OTP and auto-focuses next input', async () => {
    customRender(<OtpPage />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);

    // Type a number in the first input
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(inputs[0]).toHaveValue('1');
    expect(document.activeElement).toBe(inputs[1]);

    // Typing non-numeric should be ignored
    fireEvent.change(inputs[1], { target: { value: 'a' } });
    expect(inputs[1]).toHaveValue('');

    // Type multiple digits, it should take the last one
    fireEvent.change(inputs[1], { target: { value: '12' } });
    expect(inputs[1]).toHaveValue('2');
    expect(document.activeElement).toBe(inputs[2]);
  });

  it('handles backspace to focus previous input', async () => {
    customRender(<OtpPage />);
    const inputs = screen.getAllByRole('textbox');

    // Type something in first two
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    expect(document.activeElement).toBe(inputs[2]);

    // Hit backspace on empty 3rd input, should focus 2nd
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[1]);

    // Hit backspace on non-empty 2nd input, should NOT change focus (handled by browser usually to delete text, but in test we just check it doesn't move focus)
    fireEvent.keyDown(inputs[1], { key: 'Backspace' });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('handles paste event correctly', async () => {
    customRender(<OtpPage />);
    const inputs = screen.getAllByRole('textbox');

    const pasteEvent = {
      clipboardData: {
        getData: () => '12345678',
      },
      preventDefault: vi.fn(),
    };

    fireEvent.paste(inputs[0], pasteEvent);

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[5]).toHaveValue('6');
    expect(document.activeElement).toBe(inputs[5]); // focus goes to index Math.min(pastedLength, 5) which is 5
  });

  it('handles paste with invalid characters', async () => {
    customRender(<OtpPage />);
    const inputs = screen.getAllByRole('textbox');

    const pasteEvent = {
      clipboardData: {
        getData: () => '12a45',
      },
      preventDefault: vi.fn(),
    };

    fireEvent.paste(inputs[0], pasteEvent);

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue(''); // 'a' is ignored
    expect(inputs[3]).toHaveValue('4');
    expect(inputs[4]).toHaveValue('5');
  });

  it('submits automatically or via button and navigates based on role', async () => {
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'token-worker',
      refreshToken: 'refresh',
      isNewUser: false,
    });

    customRender(<OtpPage />);
    const inputs = screen.getAllByRole('textbox');

    // Paste 6 digits
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123456' },
      preventDefault: vi.fn(),
    });

    const submitBtn = screen.getByRole('button', { name: /verify & continue/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.verifyOtp).toHaveBeenCalledWith({
        phone: '+919876543210',
        email: undefined,
        otp: '123456',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/worker', { replace: true });
    });
  });

  it('navigates to register if isNewUser is true', async () => {
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'token-user',
      refreshToken: 'refresh',
      isNewUser: true,
    });

    customRender(<OtpPage />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: { getData: () => '123456' },
      preventDefault: vi.fn(),
    });

    fireEvent.submit(screen.getByLabelText(/OTP Verification form/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/register', { replace: true });
    });
  });

  it('navigates based on other roles', async () => {
    // Test ADMIN
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'admin-token',
      refreshToken: '',
      isNewUser: false,
    });
    customRender(<OtpPage />);
    fireEvent.paste(screen.getAllByRole('textbox')[0], {
      clipboardData: { getData: () => '123456' },
      preventDefault: vi.fn(),
    });
    fireEvent.submit(screen.getByLabelText(/OTP Verification form/i));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true }));
    cleanup();

    // Test EMPLOYER
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'employer-token',
      refreshToken: '',
      isNewUser: false,
    });
    customRender(<OtpPage />);
    fireEvent.paste(screen.getAllByRole('textbox')[0], {
      clipboardData: { getData: () => '123456' },
      preventDefault: vi.fn(),
    });
    fireEvent.submit(screen.getByLabelText(/OTP Verification form/i));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/employer', { replace: true }),
    );
    cleanup();

    // Test RECRUITER
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'recruiter-token',
      refreshToken: '',
      isNewUser: false,
    });
    customRender(<OtpPage />);
    fireEvent.paste(screen.getAllByRole('textbox')[0], {
      clipboardData: { getData: () => '123456' },
      preventDefault: vi.fn(),
    });
    fireEvent.submit(screen.getByLabelText(/OTP Verification form/i));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/recruiter', { replace: true }),
    );
    cleanup();

    // Test default USER
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({
      accessToken: 'user-token',
      refreshToken: '',
      isNewUser: false,
    });
    customRender(<OtpPage />);
    fireEvent.paste(screen.getAllByRole('textbox')[0], {
      clipboardData: { getData: () => '123456' },
      preventDefault: vi.fn(),
    });
    fireEvent.submit(screen.getByLabelText(/OTP Verification form/i));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }));
  });

  it('displays server error', async () => {
    vi.mocked(authApi.verifyOtp).mockRejectedValueOnce({
      response: { data: { error: { message: 'Invalid OTP' } } },
    });

    customRender(<OtpPage />);
    fireEvent.paste(screen.getAllByRole('textbox')[0], {
      clipboardData: { getData: () => '123456' },
      preventDefault: vi.fn(),
    });
    fireEvent.submit(screen.getByLabelText(/OTP Verification form/i));

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });
  });

  it('handles countdown timer and resend OTP', async () => {
    vi.useFakeTimers();
    vi.mocked(authApi.resendOtp).mockResolvedValueOnce({});

    customRender(<OtpPage />);

    expect(screen.getByText(/Resend in 30s/i)).toBeInTheDocument();

    // Advance timer by 30 seconds inside act
    for (let i = 0; i < 30; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByRole('button', { name: /resend otp/i })).toBeInTheDocument();

    const resendBtn = screen.getByRole('button', { name: /resend otp/i });
    fireEvent.click(resendBtn);

    vi.useRealTimers();

    await waitFor(() => {
      expect(authApi.resendOtp).toHaveBeenCalled();
    });
  });

  it('navigates back to login', () => {
    customRender(<OtpPage />);
    const backBtn = screen.getByRole('button', { name: /back to login/i });
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
