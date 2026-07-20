export interface MockMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface MockConversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

let mockConversations: MockConversation[] = [
  {
    id: 'conv_1',
    otherUser: {
      id: 'emp_1',
      name: 'TechCorp HR',
      avatarUrl: null,
      role: 'EMPLOYER',
    },
    lastMessage: 'Can we schedule an interview for tomorrow?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unreadCount: 1,
  },
  {
    id: 'conv_2',
    otherUser: {
      id: 'worker_1',
      name: 'Alex Johnson',
      avatarUrl: null,
      role: 'WORKER',
    },
    lastMessage: 'Thanks for the opportunity!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
  }
];

let mockMessages: Record<string, MockMessage[]> = {
  'conv_1': [
    {
      id: 'msg_1',
      senderId: 'me',
      content: 'Hello, I submitted my application for the Frontend Developer role.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'msg_2',
      senderId: 'emp_1',
      content: 'Can we schedule an interview for tomorrow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    }
  ],
  'conv_2': [
    {
      id: 'msg_3',
      senderId: 'worker_1',
      content: 'Thanks for the opportunity!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    }
  ],
  'conv_emp_1': [
    {
      id: 'msg_emp_1',
      senderId: 'worker_99',
      content: 'Hello, I am very interested in the warehouse manager position.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'msg_emp_2',
      senderId: 'worker_99',
      content: 'Here is my updated resume.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    }
  ],
  'conv_emp_2': [
    {
      id: 'msg_emp_3',
      senderId: 'me',
      content: 'Hi Sarah, are you available for a quick screening call on Thursday?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'msg_emp_4',
      senderId: 'worker_100',
      content: 'Are there any other time slots available?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    }
  ],
  'conv_rec_1': [
    {
      id: 'msg_rec_1',
      senderId: 'emp_55',
      content: 'We had a great turnout last week, but we need more help.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'msg_rec_2',
      senderId: 'emp_55',
      content: 'We need 5 more workers for next week.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    }
  ],
  'conv_admin_1': [
    {
      id: 'msg_admin_1',
      senderId: 'sys_1',
      content: 'Automated alert: 3 new KYC verifications pending.',
      timestamp: new Date().toISOString(),
    }
  ]
};

export const messagingApi = {
  getConversations: async (role?: string): Promise<MockConversation[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const normalizedRole = (role || 'worker').toLowerCase();
    
    // Generate some mock conversations based on the active role
    if (normalizedRole === 'employer') {
      return [
        {
          id: 'conv_emp_1',
          otherUser: { id: 'worker_99', name: 'John Applicant', avatarUrl: null, role: 'WORKER' },
          lastMessage: 'Here is my updated resume.',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          unreadCount: 2,
        },
        {
          id: 'conv_emp_2',
          otherUser: { id: 'worker_100', name: 'Sarah Developer', avatarUrl: null, role: 'WORKER' },
          lastMessage: 'Are there any other time slots available?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          unreadCount: 0,
        }
      ];
    }
    
    if (normalizedRole === 'recruiter') {
      return [
        {
          id: 'conv_rec_1',
          otherUser: { id: 'emp_55', name: 'Acme Corp', avatarUrl: null, role: 'EMPLOYER' },
          lastMessage: 'We need 5 more workers for next week.',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          unreadCount: 1,
        }
      ];
    }
    
    if (normalizedRole === 'admin') {
      return [
        {
          id: 'conv_admin_1',
          otherUser: { id: 'sys_1', name: 'System Alerts', avatarUrl: null, role: 'SYSTEM' },
          lastMessage: 'Automated alert: 3 new KYC verifications pending.',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 3,
        }
      ];
    }
    
    // Default (Worker)
    return [...mockConversations];
  },

  getMessages: async (conversationId: string): Promise<MockMessage[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMessages[conversationId] || [];
  },

  sendMessage: async (conversationId: string, content: string): Promise<MockMessage> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newMessage: MockMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      content,
      timestamp: new Date().toISOString(),
    };
    
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);
    
    const convIndex = mockConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      mockConversations[convIndex].lastMessage = content;
      mockConversations[convIndex].lastMessageTime = newMessage.timestamp;
    }
    
    return newMessage;
  },
  
  markAsRead: async (conversationId: string): Promise<void> => {
    const convIndex = mockConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      mockConversations[convIndex].unreadCount = 0;
    }
  }
};
