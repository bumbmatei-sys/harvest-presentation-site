import { Link } from 'react-router-dom';
import { I } from './icons';
import { Mark } from './shared';
import { TRIAL_CTA_LABEL } from '../content/legal';

function DashboardMock() {
  const items = [['Dashboard', I.dashboard], ['Community', I.community], ['Courses', I.courses], ['Members', I.crm], ['Giving', I.giving], ['Bible', I.bible]] as const;
  const bars = [42, 58, 38, 66, 50, 74, 60, 82, 70];
  return <div className="hero-dashboard">
    <aside className="hero-dashboard-sidebar">
      <div className="hero-dashboard-brand"><Mark h={24} style={{ filter: 'brightness(0) invert(1)' }} /> Harvest</div>
      {items.map(([label, Icon], i) => <div className={i === 0 ? 'hero-dashboard-item active' : 'hero-dashboard-item'} key={label}><Icon size={15} />{label}</div>)}
    </aside>
    <div className="hero-dashboard-main">
      <div className="hero-dashboard-top"><span>Workspace / Overview</span><div><span aria-hidden="true">♧</span><span className="hero-dashboard-status">● &nbsp; AI assistant active</span></div></div>
      <div className="hero-dashboard-content">
        <div className="hero-dashboard-heading"><div><strong>Overview</strong><p>Your ministry at a glance</p></div><span>New devotional</span></div>
        <div className="hero-dashboard-stats">{[['Members', '2,480'], ['Given', '$12.4k'], ['Active', '640']].map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div>
        <div className="hero-dashboard-chart"><small>Engagement this month</small><div>{bars.map((height, i) => <span key={i} style={{ height: `${height}%` }} />)}</div></div>
      </div>
    </div>
  </div>;
}

export function Hero() {
  return <section id="hero" className="landing-hero">
    <div className="hero-cloud hero-cloud-left" aria-hidden="true" />
    <div className="hero-cloud hero-cloud-right" aria-hidden="true" />
    <div className="hero-cloud hero-cloud-low-left" aria-hidden="true" />
    <div className="hero-cloud hero-cloud-low-right" aria-hidden="true" />
    <div className="hero-copy">
      <div className="hero-badge">From Conversion to Devotion <span aria-hidden="true">→</span></div>
      <h1>Every Believer<br />Deserves a Next Step</h1>
      <p>Community, courses, giving, social scheduling and an AI assistant in one app, under your ministry's name.</p>
      <div className="hero-actions"><Link className="hero-primary" to="/#pricing">{TRIAL_CTA_LABEL}</Link><Link className="hero-secondary" to="#features">See the features <span aria-hidden="true">▶</span></Link></div>
    </div>
    <div className="hero-dashboard-wrap"><DashboardMock /></div>
    <img className="hero-hills-front" src="/hero/hero-hills-front.webp" alt="" aria-hidden="true" />
    <div className="hero-bottom-fade" aria-hidden="true" />
  </section>;
}
