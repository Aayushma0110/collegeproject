import prisma from '../utils/prisma-clients.js';


export const createPayment = async (req, res) => {
  try {
    const { appointmentId, amount, method, transactionId } = req.body;

    if (!appointmentId || !amount || !method) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) }
    });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }


    const existing = await prisma.payment.findUnique({
      where: { appointmentId: Number(appointmentId) }
    });
    if (existing) {
      return res.status(400).json({ error: "Payment already exists for this appointment" });
    }

    const validMethods = ["CASH", "CARD", "STRIPE", "ESEWA", "KHALTI"];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const payment = await prisma.payment.create({
      data: {
        appointmentId,
        amount,
        method,
        transactionId,
        status: "SUCCESS" 
      }
    });

    res.json({ message: "Payment created successfully", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { appointment: true }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: Number(id) },
      include: { appointment: true }
    });

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, method } = req.body;

    const payment = await prisma.payment.update({
      where: { id: Number(id) },
      data: { status, method }
    });

    res.json({ message: "Payment updated successfully", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.payment.delete({ where: { id: Number(id) } });
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
