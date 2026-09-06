import React from 'react';

export default function VisitorBadge() {
  return (
    <div className="visitor-banner" role="status" aria-label="Visitor mode - read only">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
      <span>Visitor mode — read only. You can browse and read all entries.</span>
    </div>
  );
}
