const Message = require('../models/Message');
const Boat = require('../models/Boat');
const User = require('../models/User');
const { sendMail } = require('../utils/email');

// POST /api/messages/contact-owner
// body: { boatId, name, email, message }
// auth optional: if token present, use req.user._id as senderId
async function contactOwner(req, res) {
  try {
    const { boatId, name, email, message } = req.body || {};
    if (!boatId || !name || !email || !message) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    const boat = await Boat.findById(boatId).lean();
    if (!boat || boat.isActive === false || boat.status === 'rejected') {
      return res.status(404).json({ message: 'Barco no disponible' });
    }

    const owner = await User.findById(boat.ownerId).lean();
    if (!owner) return res.status(404).json({ message: 'Propietario no encontrado' });

    const doc = await Message.create({
      boatId,
      ownerId: boat.ownerId,
      senderId: req.user?._id,
      name,
      email,
      message,
    });

    // Send email notification to owner (fallback logs if SMTP not configured)
    const subject = `Nuevo mensaje por tu barco "${boat.name}"`;
    const html = `
      <p>Hola ${owner.firstName || ''},</p>
      <p>Has recibido un nuevo mensaje a través de la plataforma sobre tu embarcación <strong>${boat.name}</strong>.</p>
      <p><strong>De:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Mensaje:</strong></p>
      <blockquote>${String(message).replace(/\n/g, '<br/>')}</blockquote>
      <p>Barco: ${boat.name} (ID: ${boat._id})</p>
      <p>— Equipo boatbnb</p>
    `;

    try {
      if (owner.email) {
        await sendMail({ to: owner.email, subject, html });
      }
    } catch (e) {
      console.error('[messages][mail] error', e.message);
    }

    return res.status(201).json({ message: 'Mensaje enviado al propietario', data: { id: doc._id } });
  } catch (e) {
    console.error('[messages][contactOwner] error', e);
    return res.status(500).json({ message: 'Error interno' });
  }
}

module.exports = { contactOwner };
