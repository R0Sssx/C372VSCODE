// Payment Controller - prepare payment details (no charging)
const services = require('../data/mockServices');

// Prepare Payment
// The id must match a catalogue id exactly as plain digits ("1", not "01", "+1", "1.0" or " 1").
// Query-string values (e.g. ?amount=1) are ignored; every value comes from the server catalogue.
exports.preparePayment = (req, res) => {
  const serviceId = req.params.serviceId;
  const service = services.find(s => String(s.id) === serviceId);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.status(200).json({
    serviceId: service.id,
    serviceName: service.name,
    amount: service.price,
    currency: 'sgd',
    status: 'READY_FOR_PAYMENT'
  });
};
