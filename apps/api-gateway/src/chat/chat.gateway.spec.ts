/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { ConfigService } from '@nestjs/config';
import { Socket, Server } from 'socket.io';
import * as crypto from 'node:crypto';
import { ChatGateway } from './chat.gateway';
import { TokenDenylistService } from '../auth/token-denylist.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let configService: jest.Mocked<ConfigService>;
  let tokenDenylistService: jest.Mocked<TokenDenylistService>;
  const testSecret = 'test-jwt-secret-must-be-at-least-32-chars-long';

  beforeEach(() => {
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return testSecret;
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    tokenDenylistService = {
      isRevoked: jest.fn().mockResolvedValue(false),
    } as unknown as jest.Mocked<TokenDenylistService>;

    gateway = new ChatGateway(configService, tokenDenylistService);
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as unknown as Server;
  });

  function createValidToken(payload: Record<string, unknown>): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', testSecret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  it('should disconnect client if no token is provided in handshake', async () => {
    const client = {
      id: 'sock-1',
      handshake: { auth: {}, headers: {} },
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(client);
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('should disconnect client if token signature is invalid', async () => {
    const client = {
      id: 'sock-2',
      handshake: { auth: { token: 'invalid.header.signature' }, headers: {} },
      disconnect: jest.fn(),
    } as unknown as Socket;

    await gateway.handleConnection(client);
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('should disconnect client if token is in Redis denylist', async () => {
    tokenDenylistService.isRevoked.mockResolvedValue(true);
    const token = createValidToken({
      sub: 'user-1',
      sessionId: 'revoked-session',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const client = {
      id: 'sock-3',
      handshake: { auth: { token: `Bearer ${token}` }, headers: {} },
      disconnect: jest.fn(),
      data: {},
    } as unknown as Socket;

    await gateway.handleConnection(client);
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('should authenticate client successfully and attach user data', async () => {
    const token = createValidToken({
      sub: 'user-123',
      role: 'WORKER',
      sessionId: 'sess-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const client = {
      id: 'sock-4',
      handshake: { auth: { token }, headers: {} },
      disconnect: jest.fn(),
      data: {},
    } as unknown as Socket;

    await gateway.handleConnection(client);
    expect(client.disconnect).not.toHaveBeenCalled();
    expect(client.data.user).toEqual({
      userId: 'user-123',
      role: 'WORKER',
      sessionId: 'sess-123',
    });
  });

  it('should use authenticated user ID for sendMessage and prevent impersonation', () => {
    const client = {
      id: 'sock-5',
      data: { user: { userId: 'authenticated-user-id' } },
      disconnect: jest.fn(),
    } as unknown as Socket;

    const emitMock = jest.fn();
    (gateway.server.to as jest.Mock).mockReturnValue({ emit: emitMock });

    gateway.handleSendMessage(client, {
      conversationId: 'conv-1',
      content: 'Hello world',
    });

    expect(emitMock).toHaveBeenCalledWith(
      'newMessage',
      expect.objectContaining({
        conversationId: 'conv-1',
        senderId: 'authenticated-user-id',
        content: 'Hello world',
      }),
    );
  });
});
