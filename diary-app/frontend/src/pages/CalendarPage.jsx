import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { formatDate } from '../utils/dateHelpers.js';
import './CalendarPage.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const [calData, setCalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.entries.calendar()
      .then(({ dates }) => setCalData(dates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Map entry dates to sets
  const dateMap = {};
  calData.forEach(e => {
    const key = e.entry_date?.slice(0, 10);
    if (!key) return;
    if (!dateMap[key]) dateMap[key] = [];
    dateMap[key].push(e);
  });

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 });
    setSelected(null);
  }
  function nextMonth() {
    setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 });
    setSelected(null);
  }

  const selectedEntries = selected ? (dateMap[selected] || []) : [];

  return (
    <div className="calendar-page fade-in">
      <h1 className="page-title">Calendar</h1>

      {loading ? (
        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
          <span className="spinner" />
        </div>
      ) : (
        <div className="cal-layout">
          <div className="cal-card card">
            <div className="cal-nav">
              <button className="btn btn-icon" onClick={prevMonth} aria-label="Previous month"><ChevLeft /></button>
              <span className="cal-month-label">{MONTHS[month]} {year}</span>
              <button className="btn btn-icon" onClick={nextMonth} aria-label="Next month"><ChevRight /></button>
            </div>

            <div className="cal-grid">
              {DAYS.map(d => <div key={d} className="cal-day-name">{d}</div>)}
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasEntries = !!dateMap[dateStr];
                const isToday = dateStr === today;
                const isSelected = dateStr === selected;
                return (
                  <button
                    key={dateStr}
                    className={`cal-day ${hasEntries ? 'has-entry' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelected(isSelected ? null : dateStr)}
                    aria-label={`${formatDate(dateStr, 'medium')}${hasEntries ? ' – has entry' : ''}`}
                  >
                    {day}
                    {hasEntries && <span className="cal-dot" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          {selected && (
            <div className="cal-entries fade-in">
              <h2 className="cal-entries-date">{formatDate(selected, 'medium')}</h2>
              {selectedEntries.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>No entries on this date.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {selectedEntries.map(e => (
                    <Link key={e.id} to={`/entry/${e.id}`} className="cal-entry-link">
                      <span className="cal-entry-title">{e.title}</span>
                      <ChevRight />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChevLeft() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevRight() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
