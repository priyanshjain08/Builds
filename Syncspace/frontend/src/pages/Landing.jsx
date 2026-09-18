import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Avatar from '../components/ui/Avatar';

const FEATURES = [
  { icon: 'board', title: 'Kanban boards that stay in sync', desc: 'Drag a task to a new column and every teammate watching the board sees it move instantly, no refresh needed.' },
  { icon: 'chat', title: 'Team chat, per workspace', desc: 'Every workspace gets its own channel so project conversation stays with the work it belongs to.' },
  { icon: 'members', title: 'Presence you can see', desc: 'Know who is online and in the workspace right now before you ping them.' },
  { icon: 'bell', title: 'Notifications that matter', desc: 'Get pinged when you are assigned a task or added to a workspace — nothing else.' },
  { icon: 'workspace', title: 'One home per team', desc: 'Projects, tasks, chat, members and activity all live inside the workspace that owns them.' },
  { icon: 'clock', title: 'A live activity feed', desc: 'See what changed and who changed it, as it happens, right on the dashboard.' },
];

const RT_STEPS = [
  { n: '1', text: 'You move a task from "In Progress" to "In Review".' },
  { n: '2', text: 'SyncSpace writes the change to the database immediately.' },
  { n: '3', text: 'Everyone else viewing that board sees the card move, live, over a WebSocket connection.' },
];

export default function Landing() {
  return (
    <div>
      <nav className="landing-nav">
        <div className="brand"><span className="mark" style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#3654F4,#6c7bff)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>S</span> SyncSpace</div>
        <div className="links">
          <span>Product</span>
          <span>Real-time</span>
          <span>Teams</span>
        </div>
        <div className="cta">
          <Link to="/login" className="btn btn-ghost">Log in</Link>
          <Link to="/register" className="btn btn-primary">Get started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <h1>Your team's work, updating in real time.</h1>
          <p className="lede">
            SyncSpace brings projects, tasks, and team chat into one workspace where
            every change shows up for everyone the moment it happens.
          </p>
          <div className="cta-row">
            <Link to="/register" className="btn btn-primary">Create your workspace</Link>
            <Link to="/login" className="btn btn-secondary">Log in</Link>
          </div>
          <p className="trust">Free to use. No credit card required.</p>
        </div>

        <div className="hero-panel">
          <div className="fauxbar"><span /><span /><span /></div>
          <div className="hero-panel-grid">
            <div className="hero-mini-col">
              <span className="lbl">TO DO</span>
              <div className="hero-mini-card"><div className="t">Design onboarding flow</div><Avatar name="Priya Shah" color="#3654F4" size="sm" /></div>
              <div className="hero-mini-card"><div className="t">Write launch email</div><Avatar name="Sam Lee" color="#E8A23D" size="sm" /></div>
            </div>
            <div className="hero-mini-col">
              <span className="lbl">IN PROGRESS</span>
              <div className="hero-mini-card"><div className="t">Build kanban drag & drop</div><Avatar name="Noah Kim" color="#1FB27A" size="sm" /></div>
            </div>
            <div className="hero-mini-col">
              <span className="lbl">DONE</span>
              <div className="hero-mini-card"><div className="t">Set up database schema</div><Avatar name="Ana Cruz" color="#8551E5" size="sm" /></div>
            </div>
          </div>
          <div className="hero-chat-mini">
            <div className="line"><Avatar name="Priya Shah" color="#3654F4" size="sm" /><span className="bubble">moved "Build kanban drag & drop" to Done</span></div>
            <div className="line"><Avatar name="Sam Lee" color="#E8A23D" size="sm" /><span className="bubble">nice, testing it now 🎉</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Everything a team needs to ship together</h2>
        <p className="section-lede">Workspaces, projects, tasks and chat — connected, not scattered across five different tabs.</p>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="icon" style={{ background: 'var(--signal-soft)', color: 'var(--signal)' }}>
                <Icon name={f.icon} size={19} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section rt-section">
        <h2>Built on real-time, not refresh buttons</h2>
        <p className="section-lede">SyncSpace uses WebSockets under the hood, so the interface reacts the instant something changes — for every person looking at it.</p>
        <ul className="rt-list">
          {RT_STEPS.map((s) => (
            <li key={s.n}><span className="num">{s.n}</span><span>{s.text}</span></li>
          ))}
        </ul>
      </section>

      <div className="cta-band">
        <div>
          <h2>Bring your team into one workspace.</h2>
          <p>Set up your first project in under two minutes.</p>
        </div>
        <Link to="/register" className="btn" style={{ background: '#fff', color: 'var(--signal)' }}>Create your workspace</Link>
      </div>

      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} SyncSpace</div>
        <div>Built for teams that move fast together.</div>
      </footer>
    </div>
  );
}
