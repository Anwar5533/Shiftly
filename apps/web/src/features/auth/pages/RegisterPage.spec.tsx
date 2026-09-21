import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../../../shared/lib/test-utils.tsx';
import RegisterPage from './RegisterPage';
import { authApi } from '../api/auth.api';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth API
vi.mock('../api/auth.api', () => ({
  authApi: {
    register: vi.fn(),
  },
}));

// Mock framer-motion AnimatePresence and motion to avoid animation delays
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    },
  };
});

describe('RegisterPage', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  it('renders without crashing and defaults to Worker role', () => {
    customRender(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();

    // Check role default
    const workerBtn = screen.getByRole('button', { name: /i'm a worker/i });
    expect(workerBtn).toHaveClass('border-primary'); // active state
  });

  it('switches between Worker and Employer roles', async () => {
    customRender(<RegisterPage />);

    const employerBtn = screen.getByRole('button', { name: /i'm an employer/i });
    const workerBtn = screen.getByRole('button', { name: /i'm a worker/i });

    await user.click(employerBtn);
    expect(employerBtn).toHaveClass('border-primary');
    expect(workerBtn).not.toHaveClass('border-primary');

    await user.click(workerBtn);
    expect(workerBtn).toHaveClass('border-primary');
    expect(employerBtn).not.toHaveClass('border-primary');
  });

  it('toggles password visibility', async () => {
    customRender(<RegisterPage />);

    const passwordInput = screen.getByLabelText(/^Password$/);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays validation errors for empty or invalid fields', async () => {
    customRender(<RegisterPage />);

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/First name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Last name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter a valid phone number/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });

    // Test invalid phone format (starts with 0, fails regex)
    const phoneInput = screen.getByLabelText(/Phone number/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '0123456789');
    await user.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText(/Enter phone with country code/i)).toBeInTheDocument();
    });

    // Test weak password
    const passwordInput = screen.getByLabelText(/^Password$/);
    await user.type(passwordInput, 'weakpass');
    await user.click(submitBtn);
    await waitFor(() => {
      expect(
        screen.getByText(/Password must contain at least one uppercase letter/i),
      ).toBeInTheDocument();
    });
  });

  it('submits form successfully and navigates to verify-otp', async () => {
    vi.mocked(authApi.register).mockResolvedValueOnce({
      user: {
        id: '1',
        email: 'test@example.com',
        phone: '+919876543210',
        firstName: 'John',
        lastName: 'Doe',
        role: 'WORKER',
        createdAt: '',
        updatedAt: '',
        isEmailVerified: false,
        isPhoneVerified: false,
        avatar: '',
        dob: '',
        gender: '',
      },
    });

    customRender(<RegisterPage />);

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '+919876543210');
    await user.type(screen.getByLabelText(/^Password$/), 'Password123');

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '+919876543210',
        password: 'Password123',
        role: 'WORKER',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', {
        state: { email: 'test@example.com', phone: '+919876543210' },
      });
    });
  });

  it('normalizes phone number without + prefix on submission', async () => {
    vi.mocked(authApi.register).mockResolvedValueOnce({
      user: {
        id: '1',
        email: 'test@example.com',
        phone: '+919876543210',
        firstName: 'John',
        lastName: 'Doe',
        role: 'WORKER',
        createdAt: '',
        updatedAt: '',
        isEmailVerified: false,
        isPhoneVerified: false,
        avatar: '',
        dob: '',
        gender: '',
      },
    });

    customRender(<RegisterPage />);

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '919876543210'); // No +
    await user.type(screen.getByLabelText(/^Password$/), 'Password123');

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+919876543210',
        }),
      );
      expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', {
        state: { email: 'test@example.com', phone: '+919876543210' },
      });
    });
  });

  it('handles server errors', async () => {
    const errorResponse = {
      response: {
        data: {
          error: { message: 'Email already exists' },
        },
      },
    };
    vi.mocked(authApi.register).mockRejectedValueOnce(errorResponse);

    customRender(<RegisterPage />);

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '+919876543210');
    await user.type(screen.getByLabelText(/^Password$/), 'Password123');

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });
});
