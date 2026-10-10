const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'songs.json');

const defaultSongs = [
  { id: '1', title: 'Welcome to the Black Parade', artist: 'My Chemical Romance', emoji: '🖤' },
  { id: '2', title: 'Helena', artist: 'My Chemical Romance', emoji: '🥀' },
  { id: '3', title: 'Bat Country', artist: 'Avenged Sevenfold', emoji: '🦇' },
  { id: '4', title: 'Nightmare', artist: 'Avenged Sevenfold', emoji: '💀' },
];

const readSongs = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultSongs, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
};

const writeSongs = (songs) =>
  fs.writeFileSync(DB_FILE, JSON.stringify(songs, null, 2));

// READ: ambil semua lagu
app.get('/songs', (req, res) => {
  res.json(readSongs());
});

// CREATE: tambah lagu
app.post('/songs', (req, res) => {
  const { title, artist, emoji } = req.body;
  if (!title || !artist) {
    return res.status(400).json({ message: 'title dan artist wajib diisi' });
  }
  const song = { id: Date.now().toString(), title, artist, emoji: emoji || '🎵' };
  writeSongs([song, ...readSongs()]);
  res.status(201).json(song);
});

// UPDATE: edit lagu
app.put('/songs/:id', (req, res) => {
  const songs = readSongs();
  const index = songs.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Lagu tidak ditemukan' });
  songs[index] = { ...songs[index], ...req.body, id: songs[index].id };
  writeSongs(songs);
  res.json(songs[index]);
});

// DELETE: hapus lagu
app.delete('/songs/:id', (req, res) => {
  const songs = readSongs();
  const filtered = songs.filter((s) => s.id !== req.params.id);
  if (filtered.length === songs.length) {
    return res.status(404).json({ message: 'Lagu tidak ditemukan' });
  }
  writeSongs(filtered);
  res.json({ message: 'Terhapus' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});