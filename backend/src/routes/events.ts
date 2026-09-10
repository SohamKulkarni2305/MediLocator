import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Store connected clients
interface Client {
  id: string;
  userId: string;
  role: string;
  res: Response;
}

let clients: Client[] = [];

// Endpoint to connect to SSE stream
router.get('/', requireAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE

  const clientId = Date.now().toString();
  const userId = req.user!.id;
  const role = req.user!.role;

  const newClient: Client = {
    id: clientId,
    userId,
    role,
    res,
  };

  clients.push(newClient);

  // Send an initial connected message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  req.on('close', () => {
    clients = clients.filter((client) => client.id !== clientId);
  });
});

// Function to broadcast event to specific users or roles
export const emitEvent = (target: { userId?: string; role?: string }, eventData: any) => {
  clients.forEach((client) => {
    if ((target.userId && client.userId === target.userId) || (target.role && client.role === target.role)) {
      client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  });
};

export default router;
