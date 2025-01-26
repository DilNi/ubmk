const Session = require('../models/Session');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.addSession = async (req, res) => {
  try {
    const {
      title,
      date,
      type,
      speaker,
      description,
      code,
      startTime,
      endTime,
      location,
      sessionChair,
    } = req.body;

    let pdf = null;
    if (req.file) {
      pdf = req.file.buffer.toString('base64');
    }

    const newSession = new Session({
      title,
      date,
      type,
      speaker,
      description,
      code,
      startTime,
      endTime,
      location,
      sessionChair,
      pdf, 
    });

    await newSession.save();
    res.status(201).json({ message: 'Oturum başarıyla eklendi!', session: newSession });
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ error: 'Oturum eklenirken bir hata oluştu!' });
  }
};
