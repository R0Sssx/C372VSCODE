const petModel = require('../models/petModel');
const serviceModel = require('../models/serviceModel');
const serviceBookingModel = require('../models/serviceBookingModel');

const MSG_SUCCESS = 'Booking created. Payment is pending; no payment has been processed.';
const MSG_INVALID = 'Choose a pet, service, and valid booking date.';
const MSG_UNAVAILABLE = 'That pet or service is unavailable for booking.';
const MSG_DB_ERROR = 'Unable to create the booking. Please try again.';

// Today's LOCAL calendar date as YYYY-MM-DD (not UTC)
function getLocalToday() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Positive integer written as digits only (rejects "abc", "0", "-1", "1.5", "")
function parsePositiveInt(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
}

// Real calendar date in YYYY-MM-DD format (rejects "2026-02-30")
function isRealDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// GET /services
function listServices(req, res) {
  const ownerId = req.session.user.id;

  petModel.getPetsByOwner(ownerId, (err, pets) => {
    if (err) {
      console.error('Error loading pets:', err);
      return res.status(500).send('Unable to load pets.');
    }

    serviceModel.getActiveServices((err2, services) => {
      if (err2) {
        console.error('Error loading services:', err2);
        return res.status(500).send('Unable to load services.');
      }

      // Preselect only a pet that belongs to the signed-in user
      const requested = String(req.query.petId || '');
      const owned = pets.find((p) => String(p.id) === requested);

      return res.render('services', {
        pets,
        services,
        selectedPetId: owned ? String(owned.id) : '',
        today: getLocalToday(),
        messages: req.flash('success'),
        errors: req.flash('error'),
        session: req.session
      });
    });
  });
}

// POST /services/book
function createBooking(req, res) {
  const ownerId = req.session.user.id;
  const petId = parsePositiveInt(req.body.petId);
  const serviceId = parsePositiveInt(req.body.serviceId);
  const bookingDate = req.body.bookingDate;

  // YYYY-MM-DD strings compare correctly as text
  if (!petId || !serviceId || !isRealDate(bookingDate) || bookingDate < getLocalToday()) {
    req.flash('error', MSG_INVALID);
    return res.redirect('/services');
  }

  serviceBookingModel.createPendingBooking(ownerId, petId, serviceId, bookingDate, (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      req.flash('error', MSG_DB_ERROR);
      return res.redirect(`/services?petId=${petId}`);
    }

    if (!result) {
      req.flash('error', MSG_UNAVAILABLE);
      return res.redirect('/services');
    }

    req.flash('success', MSG_SUCCESS);
    return res.redirect('/bookings');
  });
}

// GET /bookings
function listBookings(req, res) {
  const ownerId = req.session.user.id;

  serviceBookingModel.getBookingsByOwner(ownerId, (err, bookings) => {
    if (err) {
      console.error('Error loading booking history:', err);
      return res.status(500).send('Unable to load booking history.');
    }

    return res.render('bookings', {
      bookings,
      messages: req.flash('success'),
      errors: req.flash('error'),
      session: req.session
    });
  });
}

module.exports = {
  listServices,
  createBooking,
  listBookings
};
