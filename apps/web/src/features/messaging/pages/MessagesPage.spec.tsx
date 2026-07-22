import { describe, it, expect, vi } from 'vitest';
import { render as customRender } from '../../../shared/lib/test-utils.tsx';
import MessagesPage from './MessagesPage';

vi.mock('../api/messaging.api', () => ({
  messagingApi: {
    getConversations: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn(),
    getMessages: vi.fn().mockResolvedValue([]),
  },
}));

describe('MessagesPage', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    const { container } = customRender(<MessagesPage />);
    expect(container).toBeInTheDocument();
  });
});
