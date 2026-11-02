// Pet Controller - add a new pet
const Pet = require('../models/Pet');

// Add Pet Form
exports.showNewPet = (req, res) => {
  res.render('newPet', { session: req.session });
};

// Handle Add Pet Submission
exports.createPet = (req, res) => {
  const { pet_name, species, breed, age } = req.body;
  let petImage;

  if (req.file) {
    petImage = req.file.filename; // use uploaded filename
  } else {
    petImage = null;
  }

  const ownerId = req.session.user.id;

  Pet.create(ownerId, pet_name, species, breed, age, petImage, (err) => {
    if (err) {
      console.error(err);
      return res.send('Failed to add pet.');
    }
    res.redirect('/journals');
  });
};
