import { NextRequest } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
}

// Simple session-based authentication middleware
// In production, use JWT tokens or NextAuth.js sessions
export function requireAuth(handler: Function) {
  return async (req: AuthenticatedRequest, context?: any) => {
    // For demo purposes, we'll check for a simple auth header
    // In production, validate JWT or session token
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    // In production, verify JWT token here
    // For demo, we'll assume token is the userId
    req.userId = token;

    return handler(req, context);
  };
}

export function optionalAuth(handler: Function) {
  return async (req: AuthenticatedRequest, context?: any) => {
    const authHeader = req.headers.get('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.userId = token;
    }

    return handler(req, context);
  };
}
