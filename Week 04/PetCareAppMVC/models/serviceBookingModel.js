const pool = require('../config/db');

// Create a pending booking and its pending payment in ONE transaction.
// callback(null, { bookingId, paymentId }) -> both rows committed
// callback(null, null)                     -> pet not owned / service not active
// callback(err)                            -> database failure (rolled back)
function createPendingBooking(ownerId, petId, serviceId, bookingDate, callback) {
  pool.getConnection((connErr, conn) => {
    if (connErr) return callback(connErr);

    let finished = false;
    // Release the connection and invoke the callback exactly once
    function done(err, result) {
      if (finished) return;
      finished = true;
      conn.release();
      callback(err, result);
    }

    // Roll back, then report the original error (or the unavailable outcome)
    function rollbackAndFinish(err, result) {
      conn.rollback((rbErr) => {
        if (rbErr) console.error('Rollback failed:', rbErr);
        done(err || rbErr || null, err ? undefined : result);
      });
    }

    conn.beginTransaction((txErr) => {
      if (txErr) return done(txErr);

      // Insert only when the pet belongs to the owner and the service is active.
      // booked_price comes from the database, never from the request.
      const bookingSql = `
        INSERT INTO service_bookings (pet_id, service_id, booking_status, booked_price, booking_date)
        SELECT p.id, s.id, 'pending', s.price, ?
        FROM pets AS p
        JOIN services AS s ON s.id = ? AND s.is_active = 1
        WHERE p.id = ? AND p.owner_id = ?`;

      conn.query(bookingSql, [bookingDate, serviceId, petId, ownerId], (bErr, bResult) => {
        if (bErr) return rollbackAndFinish(bErr);

        if (bResult.affectedRows !== 1) {
          // No eligible pet/service: nothing to keep
          return rollbackAndFinish(null, null);
        }

        const bookingId = bResult.insertId;

        // Payment amount is copied from the stored booking price
        const paymentSql = `
          INSERT INTO payments (booking_id, amount, payment_status)
          SELECT id, booked_price, 'pending'
          FROM service_bookings
          WHERE id = ?`;

        conn.query(paymentSql, [bookingId], (pErr, pResult) => {
          if (pErr) return rollbackAndFinish(pErr);
          if (pResult.affectedRows !== 1) {
            return rollbackAndFinish(new Error('Payment record was not created'));
          }

          conn.commit((cErr) => {
            if (cErr) return rollbackAndFinish(cErr);
            done(null, { bookingId, paymentId: pResult.insertId });
          });
        });
      });
    });
  });
}

// Booking history for pets owned by this user, newest first
function getBookingsByOwner(ownerId, callback) {
  const sql = `
    SELECT
      b.id AS booking_id,
      DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_date,
      p.name AS pet_name,
      s.name AS service_name,
      b.booked_price,
      b.booking_status,
      pay.payment_status,
      pay.payment_reference,
      b.created_at
    FROM service_bookings AS b
    JOIN pets AS p ON p.id = b.pet_id
    JOIN services AS s ON s.id = b.service_id
    LEFT JOIN payments AS pay ON pay.booking_id = b.id
    WHERE p.owner_id = ?
    ORDER BY b.created_at DESC, b.id DESC`;

  pool.query(sql, [ownerId], callback);
}

module.exports = {
  createPendingBooking,
  getBookingsByOwner
};
