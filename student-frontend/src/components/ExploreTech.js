import { useState } from 'react';
import GlowingEffect from './GlowingEffect.js';

const items = [
  {
    title: 'INTERNSHIPS',
    desc: 'Find internship listings, application tips, and company links to get real-world experience.',
    websites: [
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs' },
      { name: 'Internshala', url: 'https://internshala.com' },
      { name: 'Indeed', url: 'https://www.indeed.com' },
      { name: 'AngelList', url: 'https://angel.co' }
    ]
  },
  {
    title: 'ROADMAPS',
    desc: 'Guided learning roadmaps for web, mobile, data and systems to plan your path.',
    websites: [
      { name: 'roadmap.sh', url: 'https://roadmap.sh' },
      { name: 'Coursera', url: 'https://www.coursera.org' },
      { name: 'Udemy', url: 'https://www.udemy.com' },
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' }
    ]
  },
  {
    title: 'CODING PLATFORMS',
    desc: 'Links and recommendations for practice sites, contests, and learning playgrounds.',
    websites: [
      { name: 'LeetCode', url: 'https://leetcode.com' },
      { name: 'HackerRank', url: 'https://www.hackerrank.com' },
      { name: 'CodeChef', url: 'https://www.codechef.com' },
      { name: 'Codeforces', url: 'https://codeforces.com' }
    ]
  },
  {
    title: 'PRACTISE',
    desc: "Hands-on exercises, challenges and small projects to build skills and confidence.",
    websites: [
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'Dev.to', url: 'https://dev.to' },
      { name: 'Frontend Mentor', url: 'https://www.frontendmentor.io' },
      { name: 'Project Euler', url: 'https://projecteuler.net' }
    ]
  }
];

export default function ExploreTech() {
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (idx) => {
    // Close if already open, otherwise close all and open this one
    if (expanded === idx) {
      setExpanded(null);
    } else {
      setExpanded(idx);
    }
  };

  const handleCardKeyDown = (idx, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand(idx);
    }
  };

  return (
    <section id="explore" className="section explore-section">
      <div className="section-inner">
        <h2>EXPLORE TECH</h2>
        <p>Learning doesn't stop with exams. This space is meant for students who want to explore ideas, technologies, and skills that extend beyond textbooks. Take initiative, stay curious, and build knowledge that lasts.</p>

        <ul className="explore-grid">
          {items.map((it, idx) => (
            <li key={it.title} className={`grid-item ${expanded === idx ? 'expanded' : ''}`}>
              <div
                className="card"
                onClick={() => toggleExpand(idx)}
                onKeyDown={(e) => handleCardKeyDown(idx, e)}
                role="button"
                tabIndex={0}
              >
                <GlowingEffect disabled={false} />
                <div className="card-content">
                  <div className="card-icon">{getIcon(idx)}</div>
                  <h3>{it.title}</h3>
                  <p>{it.desc}</p>
                </div>
              </div>

              {expanded === idx && (
                <div className="card-expanded">
                  <div className="expanded-content">
                    <h4>Resources</h4>
                    <ul className="websites-list">
                      {it.websites.map((site) => (
                        <li key={site.url}>
                          <a href={site.url} target="_blank" rel="noopener noreferrer">
                            {site.name}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="external-icon">
                              <path d="M10 5H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2m-6-9h6m0 0v6m0-6L10 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function getIcon(i){
  const svgs = [
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 3v18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.2"/></svg>,
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/><path d="M5 12h14" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
  ];
  return svgs[i % svgs.length];
}

