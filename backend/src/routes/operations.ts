import { randomUUID } from 'node:crypto';
import { Router } from 'express';

interface InventoryItem { id: string; pharmacyId: string; drugName: string; quantity: number; reorderPoint: number; updatedAt: string; }
interface PaymentRecord { id: string; orderId: string; amount: number; currency: 'INR' | 'USD'; provider: 'razorpay' | 'stripe'; status: 'created' | 'paid' | 'refunded'; createdAt: string; }
interface ShiftRecord { id: string; pharmacyId: string; pharmacistName: string; startsAt: string; endsAt: string; status: 'scheduled' | 'active' | 'completed'; }

const inventory: InventoryItem[] = [];
const payments: PaymentRecord[] = [];
const shifts: ShiftRecord[] = [];
const router = Router();

router.get('/inventory', (_req, res) => res.json({ data: inventory, alerts: inventory.filter((item) => item.quantity <= item.reorderPoint) }));

router.post('/inventory', (req, res) => {
  const body = req.body as Partial<InventoryItem>;
  if (!body.pharmacyId || !body.drugName || typeof body.quantity !== 'number' || typeof body.reorderPoint !== 'number') { res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'pharmacyId, drugName, quantity, and reorderPoint are required' } }); return; }
  const item: InventoryItem = { id: randomUUID(), pharmacyId: body.pharmacyId, drugName: body.drugName, quantity: body.quantity, reorderPoint: body.reorderPoint, updatedAt: new Date().toISOString() };
  inventory.push(item); res.status(201).json(item);
});

router.patch('/inventory/:id', (req, res) => {
  const item = inventory.find((entry) => entry.id === req.params.id);
  if (!item) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Inventory item not found' } }); return; }
  const body = req.body as Partial<InventoryItem>;
  if (typeof body.quantity === 'number') item.quantity = body.quantity;
  if (typeof body.reorderPoint === 'number') item.reorderPoint = body.reorderPoint;
  item.updatedAt = new Date().toISOString(); res.json(item);
});

router.post('/payments', (req, res) => {
  const body = req.body as Partial<PaymentRecord>;
  if (!body.orderId || typeof body.amount !== 'number' || (body.currency !== 'INR' && body.currency !== 'USD')) { res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'orderId, amount, and currency are required' } }); return; }
  const payment: PaymentRecord = { id: randomUUID(), orderId: body.orderId, amount: body.amount, currency: body.currency, provider: body.provider === 'stripe' ? 'stripe' : 'razorpay', status: 'created', createdAt: new Date().toISOString() };
  payments.push(payment); res.status(201).json({ ...payment, nextAction: 'provider_checkout_required' });
});

router.post('/payments/:id/refund', (req, res) => {
  const payment = payments.find((entry) => entry.id === req.params.id);
  if (!payment) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } }); return; }
  payment.status = 'refunded'; res.json(payment);
});

router.get('/logistics/:orderId', (req, res) => res.json({ orderId: req.params.orderId, status: 'awaiting_provider_webhook', milestones: [] }));
router.post('/logistics/webhook', (req, res) => res.status(202).json({ accepted: true, providerEventId: (req.body as { eventId?: string }).eventId ?? randomUUID() }));
router.get('/shifts', (_req, res) => res.json({ data: shifts }));

router.post('/shifts', (req, res) => {
  const body = req.body as Partial<ShiftRecord>;
  if (!body.pharmacyId || !body.pharmacistName || !body.startsAt || !body.endsAt) { res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'pharmacyId, pharmacistName, startsAt, and endsAt are required' } }); return; }
  const shift: ShiftRecord = { id: randomUUID(), pharmacyId: body.pharmacyId, pharmacistName: body.pharmacistName, startsAt: body.startsAt, endsAt: body.endsAt, status: 'scheduled' };
  shifts.push(shift); res.status(201).json(shift);
});

router.get('/reports/summary', (_req, res) => res.json({ generatedAt: new Date().toISOString(), inventoryItems: inventory.length, lowStockItems: inventory.filter((item) => item.quantity <= item.reorderPoint).length, payments: payments.length, scheduledShifts: shifts.length }));

export default router;
