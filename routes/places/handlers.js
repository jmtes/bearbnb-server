import City from '../../models/City';
import Place from '../../models/Place';
import Reservation from '../../models/Reservation';
import Review from '../../models/Review';

import { createCity, validateAddress } from './utils';

export const getPlacesInCity = async (req, res) => {
  const { cityID } = req.params;

  try {
    const places = await Place.find({ cityID }, { __v: 0 });

    res.json({ places });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

export const getPlace = async (req, res) => {
  const { id } = req.params;

  try {
    const place = await Place.findById(id);

    if (!place) {
      res.status(404).json({ message: 'Place not found.' });
      return;
    }

    const reservations = await Reservation.find(
      { placeID: id },
      { checkin: 1, checkout: 1 }
    );
    const reviews = await Review.find({ placeID: id });

    place.reservations = reservations;
    place.reviews = reviews;

    res.json({ place });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

export const createPlace = async (req, res) => {
  const {
    name,
    desc,
    address,
    beds,
    baths,
    price,
    maxGuests,
    amenities,
    photos
  } = req.body;

  try {
    // Validate address
    const locData = await validateAddress(address);

    const { lat, lon } = locData;
    const { road, state, region, country } = locData.address;

    // Check if city exists
    let city = await City.findOne({
      name: locData.address.city,
      state: state || '',
      region: region || '',
      country
    });

    if (!city) {
      city = await createCity(locData.address.city, state, region, country);
    }

    const newPlace = new Place({
      name,
      desc,
      ownerID: req.user.id,
      cityID: city._id,
      address: `${locData.address.house_number} ${road}`,
      latitude: lat,
      longitude: lon,
      beds,
      baths,
      price,
      maxGuests,
      amenities,
      photos
    });

    const place = await newPlace.save();

    res.json(place);
  } catch (err) {
    console.log(err.message);
    if (err.message === 'Unable to geocode') {
      res.status(400).json({
        errors: {
          msg:
            'Could not validate address. Please check to make sure address is correct.',
          param: 'address',
          location: 'body'
        }
      });
    } else if (err.message === 'Not a valid street address') {
      res.status(400).json({
        errors: {
          msg: 'Please make sure your address contains a street address.',
          param: 'address',
          location: 'body'
        }
      });
    } else {
      res
        .status(500)
        .json({ message: 'Something went wrong. Try again later.' });
    }
  }
};

export const editPlace = async (req, res) => {
  const { id } = req.params;

  try {
    let place = await Place.findById(id);

    if (!place) {
      res.status(404).json({ message: 'Place not found.' });
      return;
    }

    if (place.ownerID !== req.user.id) {
      res.status(403).json({ message: 'Invalid credentials.' });
      return;
    }

    place = await Place.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, fields: { __v: 0 } }
    );

    res.json(place);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};

export const removePlace = async (req, res) => {
  const { id } = req.params;

  try {
    let place = await Place.findById(id);

    if (!place) {
      res.status(404).json({ message: 'Place not found.' });
      return;
    }

    if (place.ownerID !== req.user.id) {
      res.status(403).json({ message: 'Invalid credentials.' });
      return;
    }

    place = await Place.findByIdAndRemove(id);

    await Reservation.deleteMany({ placeID: id });
    await Review.deleteMany({ placeID: id });

    res.json({ message: 'Successfully removed listing.' });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};