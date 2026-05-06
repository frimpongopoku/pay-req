// AssetFlow — App shell with router + tweaks
const { useState, useEffect } = React;

function App() {
  const [route, setRoute] = useState('detail'); // start on the lifecycle hero
  const [requestId, setRequestId] = useState('REQ-2418');
  const [lifecycleStage, setLifecycleStage] = useState(1); // UNDER_REVIEW

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#6366f1",
    "accent2": "#8b5cf6",
    "density": "comfortable",
    "glassIntensity": 18
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', tweaks.accent);
    document.documentElement.style.setProperty('--accent-2', tweaks.accent2);
    document.documentElement.style.setProperty('--accent-soft',
      tweaks.accent + '1A'); // ~10% alpha
  }, [tweaks.accent, tweaks.accent2]);

  const goRequest = (id) => {
    setRequestId(id);
    setRoute('detail');
  };

  const counts = { requests: 14, assets: 8, users: 7 };

  const crumbsByRoute = {
    dashboard: ['Northbound Freight', 'Dashboard'],
    requests:  ['Northbound Freight', 'Requests'],
    detail:    ['Northbound Freight', 'Requests', requestId],
    assets:    ['Northbound Freight', 'Assets'],
    users:     ['Northbound Freight', 'People'],
    insights:  ['Northbound Freight', 'Insights'],
    slack:     ['Northbound Freight', 'Settings', 'Slack'],
    org:       ['Northbound Freight', 'Settings', 'Organization'],
  };

  let view;
  switch (route) {
    case 'dashboard': view = <Dashboard goRequest={goRequest} setRoute={setRoute} />; break;
    case 'requests':  view = <Requests goRequest={goRequest} density={tweaks.density} />; break;
    case 'detail':    view = <RequestDetail requestId={requestId} lifecycleStage={lifecycleStage} setLifecycleStage={setLifecycleStage} />; break;
    case 'assets':    view = <Assets />; break;
    case 'users':     view = <Users />; break;
    case 'insights':  view = <Insights />; break;
    case 'slack':     view = <SlackSettings />; break;
    case 'org':       view = <SlackSettings />; break;
    default:          view = <Dashboard goRequest={goRequest} setRoute={setRoute} />;
  }

  return (
    <>
      <div className="app-bg" />
      <div className={"app " + (tweaks.density === 'compact' ? 'dense' : '')}>
        <Sidebar route={route} setRoute={setRoute} counts={counts} />
        <div className="main">
          <Topbar crumbs={crumbsByRoute[route] || ['AssetFlow']} actions={null} />
          {view}
        </div>
      </div>
      <AFTweaks tweaks={tweaks} setTweak={setTweak} lifecycleStage={lifecycleStage} setLifecycleStage={setLifecycleStage} route={route} />
    </>
  );
}

function AFTweaks({ tweaks, setTweak, lifecycleStage, setLifecycleStage, route }) {
  const { TweaksPanel, TweakSection, TweakColor, TweakRadio } = window;
  if (!TweaksPanel) return null;

  const stages = ['Submitted','Review','Approved','Paid','Receipts','Completed'];

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Theme">
        <TweakColor label="Accent" value={tweaks.accent} onChange={v => setTweak('accent', v)} />
        <TweakColor label="Accent 2" value={tweaks.accent2} onChange={v => setTweak('accent2', v)} />
        <TweakRadio label="Density" value={tweaks.density}
          options={[{value:'comfortable', label:'Comfortable'}, {value:'compact', label:'Compact'}]}
          onChange={v => setTweak('density', v)} />
      </TweakSection>
      {route === 'detail' && (
        <TweakSection title="Request lifecycle" subtitle="Cycle the active request through every stage">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {stages.map((s, i) => (
                <button key={s}
                  onClick={() => setLifecycleStage(i)}
                  style={{
                    padding: '5px 9px', fontSize: 11.5, fontWeight: 500,
                    borderRadius: 6, cursor: 'pointer',
                    border: '1px solid ' + (i === lifecycleStage ? 'var(--accent)' : 'rgba(15,23,42,0.12)'),
                    background: i === lifecycleStage ? 'var(--accent)' : 'white',
                    color: i === lifecycleStage ? 'white' : 'var(--ink-1)',
                  }}>
                  {i + 1}. {s}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Watch the stepper, status pill, and primary action button update.</div>
          </div>
        </TweakSection>
      )}
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
