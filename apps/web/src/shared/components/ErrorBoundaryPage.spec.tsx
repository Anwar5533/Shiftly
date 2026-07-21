import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundaryPage } from './ErrorBoundaryPage';

describe('ErrorBoundaryPage', () => {
  it('renders without crashing', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <div>Home</div>,
          errorElement: <ErrorBoundaryPage />,
        },
      ],
      {
        initialEntries: ['/error'],
      },
    );
    const { container } = render(<RouterProvider router={router} />);
    expect(container).toBeInTheDocument();
  });
});
