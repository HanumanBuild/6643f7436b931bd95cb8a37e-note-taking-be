const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies

// Define a simple route to check server status
app.get('/', (req, res) => {
  res.send('Server is running');
});

const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const User = require('./models/User');
const bcrypt = require('bcryptjs');

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(500).json(error);
  }
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(404).send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid credentials');

  res.status(200).send('User logged in');
});

const Note = require('./models/Note');

// Create a note
app.post('/notes', async (req, res) => {
  const { title, content, user } = req.body;
  const newNote = new Note({ title, content, user });
  try {
    await newNote.save();
    res.status(201).send('Note created');
  } catch (error) {
    res.status(500).json(error);
  }
});

// Read all notes
app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update a note
app.put('/notes/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete a note
app.delete('/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(200).send('Note deleted');
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));