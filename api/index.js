const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// TEAM SCORES
app.get('/api/team-scores', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('team_scores')
      .select('*')
      .order('week', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/team-scores', async (req, res) => {
  const { week, score } = req.body;
  try {
    const { data, error } = await supabase
      .from('team_scores')
      .upsert([{ week, score }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EVENT SCORES
app.get('/api/event-scores', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('event_scores')
      .select('*')
      .order('week', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/event-scores', async (req, res) => {
  const { week, event, score } = req.body;
  try {
    const { data, error } = await supabase
      .from('event_scores')
      .upsert([{ week, event, score }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// COMPETITOR SCORES
app.get('/api/competitor-scores', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competitor_scores')
      .select('*')
      .order('year', { ascending: false })
      .order('school', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/competitor-scores', async (req, res) => {
  const { year, school, score } = req.body;
  try {
    const { data, error } = await supabase
      .from('competitor_scores')
      .upsert([{ year, school, score }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
