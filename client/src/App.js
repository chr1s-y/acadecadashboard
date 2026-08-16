import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './App.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('myteam');
  const [showDataInput, setShowDataInput] = useState(false);
  const [myTeamTimeRange, setMyTeamTimeRange] = useState('all');
  const [eventTimeRange, setEventTimeRange] = useState('all');
  const [competitorYear, setCompetitorYear] = useState('2026');
  const [eventProfileYear, setEventProfileYear] = useState('2026');
  const [visibleTeams, setVisibleTeams] = useState({
    lincoln: true, taft: true, yourschool: true, grant: true, roosevelt: true
  });

  const [teamScores, setTeamScores] = useState([]);
  const [eventData, setEventData] = useState({});
  const [competitorScores, setCompetitorScores] = useState([]);

  const [inputTab, setInputTab] = useState('myteam');
  const [weekLabel, setWeekLabel] = useState('W5');
  const [teamScore, setTeamScore] = useState('');
  const [eventScores, setEventScores] = useState({
    science: '', literature: '', socialsci: '', interview: '', essay: '', quiz: ''
  });
  const [competitorInput, setCompetitorInput] = useState({
    year: '2026',
    lincoln: '', taft: '', yourschool: '', grant: '', roosevelt: ''
  });

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '' 
    : 'http://localhost:3001';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [teamRes, eventRes, competitorRes] = await Promise.all([
        axios.get(`${API_BASE}/api/team-scores`),
        axios.get(`${API_BASE}/api/event-scores`),
        axios.get(`${API_BASE}/api/competitor-scores`)
      ]);

      setTeamScores(teamRes.data);

      const eventsByKey = {
        science: [], literature: [], socialsci: [], interview: [], essay: [], quiz: []
      };
      eventRes.data.forEach(item => {
        if (eventsByKey[item.event]) {
          eventsByKey[item.event].push(item);
        }
      });
      setEventData(eventsByKey);

      setCompetitorScores(competitorRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleAddTeamScore = async () => {
    if (!teamScore) return;
    try {
      await axios.post(`${API_BASE}/api/team-scores`, {
        week: weekLabel,
        score: parseInt(teamScore)
      });
      setTeamScore('');
      setWeekLabel(`W${parseInt(weekLabel.substring(1)) + 1}`);
      fetchAllData();
    } catch (err) {
      console.error('Error adding team score:', err);
    }
  };

  const handleAddEventScores = async () => {
    try {
      for (const [event, score] of Object.entries(eventScores)) {
        if (score) {
          await axios.post(`${API_BASE}/api/event-scores`, {
            week: weekLabel,
            event,
            score: parseInt(score)
          });
        }
      }
      setEventScores({ science: '', literature: '', socialsci: '', interview: '', essay: '', quiz: '' });
      fetchAllData();
    } catch (err) {
      console.error('Error adding event scores:', err);
    }
  };

  const handleAddCompetitorScores = async () => {
    try {
      const schools = ['lincoln', 'taft', 'yourschool', 'grant', 'roosevelt'];
      const schoolNames = {
        lincoln: 'Lincoln High', taft: 'Taft HS', yourschool: 'Your School',
        grant: 'Grant HS', roosevelt: 'Roosevelt HS'
      };

      for (const school of schools) {
        if (competitorInput[school]) {
          await axios.post(`${API_BASE}/api/competitor-scores`, {
            year: competitorInput.year,
            school: schoolNames[school],
            score: parseInt(competitorInput[school])
          });
        }
      }
      setCompetitorInput({
        year: competitorInput.year,
        lincoln: '', taft: '', yourschool: '', grant: '', roosevelt: ''
      });
      fetchAllData();
    } catch (err) {
      console.error('Error adding competitor scores:', err);
    }
  };

  const getTeamChartData = () => {
    if (myTeamTimeRange === 'week') return teamScores.slice(-1);
    if (myTeamTimeRange === 'twoweeks') return teamScores.slice(-2);
    return teamScores;
  };

  const getEventChartData = (eventKey) => {
    const data = eventData[eventKey] || [];
    if (eventTimeRange === 'week') return data.slice(-1);
    if (eventTimeRange === 'twoweeks') return data.slice(-2);
    return data;
  };

  const getCompetitorsByYear = (year) => {
    return competitorScores.filter(c => c.year === year).sort((a, b) => b.score - a.score);
  };

  const getFullHistoryData = () => {
    const years = [...new Set(competitorScores.map(c => parseInt(c.year)))].sort();
    const schools = ['Lincoln High', 'Taft HS', 'Your School', 'Grant HS', 'Roosevelt HS'];
    
    return years.map(year => {
      const yearData = { year };
      schools.forEach(school => {
        const score = competitorScores.find(c => c.year.toString() === year.toString() && c.school === school)?.score;
        yearData[school] = score || null;
      });
      return yearData;
    });
  };

  const colors = {
    'Lincoln High': '#2a78d6',
    'Taft HS': '#eb6834',
    'Your School': '#1baf7a',
    'Grant HS': '#eda100',
    'Roosevelt HS': '#e87ba4'
  };

  const teamKeys = {
    lincoln: 'Lincoln High', taft: 'Taft HS', yourschool: 'Your School',
    grant: 'Grant HS', roosevelt: 'Roosevelt HS'
  };

  const toggleTeam = (team) => {
    setVisibleTeams(prev => ({ ...prev, [team]: !prev[team] }));
  };

  const getEventProfileData = (year) => {
    const yearData = competitorScores.filter(c => c.year === year);
    const events = ['Science', 'Literature', 'Soc Sci', 'Interview', 'Essay'];
    
    return events.map(event => {
      const eventData = { event };
      Object.values(teamKeys).forEach(school => {
        eventData[school] = yearData.find(c => c.school === school)?.score || null;
      });
      return eventData;
    });
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Academic Decathlon Analytics</h1>
        <button className="toggle-btn" onClick={() => setShowDataInput(!showDataInput)}>
          {showDataInput ? 'Hide Data Input' : 'Add Data'}
        </button>
      </div>

      {showDataInput && (
        <div className="data-input-section">
          <div className="input-tabs">
            {['myteam', 'events', 'competitors'].map(tab => (
              <button key={tab} className={`tab-btn ${inputTab === tab ? 'active' : ''}`}
                onClick={() => setInputTab(tab)}>
                {tab === 'myteam' && 'My Team Score'}
                {tab === 'events' && 'Event Scores'}
                {tab === 'competitors' && 'Competitor Scores'}
              </button>
            ))}
          </div>

          {inputTab === 'myteam' && (
            <div className="input-form">
              <input type="text" placeholder="W5" value={weekLabel}
                onChange={(e) => setWeekLabel(e.target.value)} className="input-field" />
              <input type="number" placeholder="Total Score" value={teamScore}
                onChange={(e) => setTeamScore(e.target.value)} className="input-field" />
              <button onClick={handleAddTeamScore} className="submit-btn">Add Score</button>
            </div>
          )}

          {inputTab === 'events' && (
            <div>
              <div className="input-grid">
                {['Science', 'Literature', 'Soc Sci', 'Interview', 'Essay', 'Quiz'].map((event, idx) => (
                  <div key={event} className="input-group">
                    <label>{event}</label>
                    <input type="number" placeholder="0"
                      value={eventScores[event.toLowerCase().replace(' ', '')]}
                      onChange={(e) => setEventScores({
                        ...eventScores,
                        [event.toLowerCase().replace(' ', '')]: e.target.value
                      })} className="input-field" />
                  </div>
                ))}
              </div>
              <button onClick={handleAddEventScores} className="submit-btn">Add Event Scores</button>
            </div>
          )}

          {inputTab === 'competitors' && (
            <div>
              <input type="text" placeholder="2026" value={competitorInput.year}
                onChange={(e) => setCompetitorInput({ ...competitorInput, year: e.target.value })}
                className="input-field" />
              <div className="input-grid">
                {['lincoln', 'taft', 'yourschool', 'grant', 'roosevelt'].map(school => (
                  <div key={school} className="input-group">
                    <label>{teamKeys[school]}</label>
                    <input type="number" placeholder="0"
                      value={competitorInput[school]}
                      onChange={(e) => setCompetitorInput({ ...competitorInput, [school]: e.target.value })}
                      className="input-field" />
                  </div>
                ))}
              </div>
              <button onClick={handleAddCompetitorScores} className="submit-btn">Add Competitor Scores</button>
            </div>
          )}
        </div>
      )}

      <div className="tabs">
        {['myteam', 'events', 'history', 'profile'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'myteam' && 'My Team Performance'}
            {tab === 'events' && 'Event Breakdown'}
            {tab === 'history' && 'Competitor History'}
            {tab === 'profile' && 'Team Event Profile'}
          </button>
        ))}
      </div>

      {activeTab === 'myteam' && (
        <div className="section">
          <div className="controls">
            {['week', 'twoweeks', 'all'].map(range => (
              <button key={range} className={`control-btn ${myTeamTimeRange === range ? 'active' : ''}`}
                onClick={() => setMyTeamTimeRange(range)}>
                {range === 'week' && 'Last 1 Week'}
                {range === 'twoweeks' && 'Last 2 Weeks'}
                {range === 'all' && 'All Data'}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={getTeamChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[2400, 3000]} />
              <Tooltip />
              <Bar dataKey="score" fill="#1baf7a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="section">
          <div className="controls">
            {['week', 'twoweeks', 'all'].map(range => (
              <button key={range} className={`control-btn ${eventTimeRange === range ? 'active' : ''}`}
                onClick={() => setEventTimeRange(range)}>
                {range === 'week' && 'Last 1 Week'}
                {range === 'twoweeks' && 'Last 2 Weeks'}
                {range === 'all' && 'All Data'}
              </button>
            ))}
          </div>
          <div className="chart-grid">
            {['Science', 'Literature', 'Soc Sci', 'Interview', 'Essay', 'Quiz'].map(event => (
              <div key={event} className="chart-card">
                <h3>{event}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getEventChartData(event.toLowerCase().replace(' ', ''))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" style={{ fontSize: '11px' }} />
                    <YAxis domain={[0, 600]} style={{ fontSize: '11px' }} />
                    <Bar dataKey="score" fill="#2a78d6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="section">
          <div className="controls">
            {[...new Set(competitorScores.map(c => c.year))].sort().map(year => (
              <button key={year} className={`control-btn ${competitorYear === year ? 'active' : ''}`}
                onClick={() => setCompetitorYear(year)}>{year}</button>
            ))}
          </div>
          <div className="history-grid">
            <div className="chart-large">
              <h3>Full History</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={getFullHistoryData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[2600, 3000]} />
                  <Tooltip />
                  <Legend />
                  {Object.values(teamKeys).map(team => (
                    <Line key={team} type="monotone" dataKey={team} stroke={colors[team]} strokeWidth={2} dot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rankings-panel">
              <h3>{competitorYear} Rankings</h3>
              {getCompetitorsByYear(competitorYear).map((team, idx) => (
                <div key={team.school} className="ranking-item">
                  <span className="rank">{idx + 1}. {team.school}</span>
                  <span className="score" style={{ color: colors[team.school] }}>{team.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="section">
          <div className="profile-controls">
            <div>
              <h4>Year</h4>
              <div className="controls">
                {[...new Set(competitorScores.map(c => c.year))].sort().map(year => (
                  <button key={year} className={`control-btn ${eventProfileYear === year ? 'active' : ''}`}
                    onClick={() => setEventProfileYear(year)}>{year}</button>
                ))}
              </div>
            </div>
            <div>
              <h4>Teams</h4>
              <div className="team-toggles">
                {Object.entries(teamKeys).map(([key, name]) => (
                  <label key={key} className="toggle-label">
                    <input type="checkbox" checked={visibleTeams[key]}
                      onChange={() => toggleTeam(key)} />
                    <span className="color-dot" style={{ color: colors[name] }}>●</span>
                    {name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={getEventProfileData(eventProfileYear)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="event" />
              <YAxis domain={[200, 650]} />
              <Tooltip />
              <Legend />
              {Object.entries(visibleTeams).map(([key, visible]) => {
                const team = teamKeys[key];
                return visible ? (
                  <Line key={team} type="monotone" dataKey={team} stroke={colors[team]} strokeWidth={2} dot={{ r: 4 }} />
                ) : null;
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
