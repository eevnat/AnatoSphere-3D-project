export const page = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AnatoSphere 3D – Interactive Human Anatomy Learning Platform</title>
  <meta name="description" content="Explore, isolate and understand the human body through interactive 3D models and simple explanations." />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🫀</text></svg>" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link href="/static/style.css" rel="stylesheet" />
  <script type="importmap">
    { "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
    } }
  </script>
</head>
<body class="text-slate-200">
  <div id="app-shell">
    <!-- ───── Header ───── -->
    <header id="top-bar">
      <div class="brand">
        <div class="brand-logo"><i class="fas fa-person-rays"></i></div>
        <div>
          <h1>AnatoSphere <span>3D</span></h1>
          <p>Interactive Human Anatomy</p>
        </div>
      </div>

      <nav id="mode-tabs" aria-label="Main modes">
        <button data-tab="explore" class="tab active"><i class="fas fa-cube"></i><span>Explore</span></button>
        <button data-tab="journeys" class="tab"><i class="fas fa-route"></i><span>Journeys</span></button>
        <button data-tab="quiz" class="tab"><i class="fas fa-circle-question"></i><span>Quiz</span></button>
        <button data-tab="progress" class="tab"><i class="fas fa-chart-line"></i><span>Progress</span></button>
      </nav>

      <div class="header-right">
        <div id="search-box">
          <i class="fas fa-magnifying-glass"></i>
          <input id="search-input" type="search" placeholder="Search kidney, femur, cerebellum…" autocomplete="off" />
          <ul id="search-results" hidden></ul>
        </div>
        <div id="level-toggle" role="group" aria-label="Explanation level">
          <button data-level="beginner" class="active">Beginner</button>
          <button data-level="advanced">Advanced</button>
        </div>
        <button id="ai-toggle" class="ai-btn" title="AI Anatomy Assistant"><i class="fas fa-robot"></i><span>Ask AI</span></button>
      </div>
    </header>

    <!-- ───── Left: Body systems ───── -->
    <aside id="systems-panel" class="panel">
      <div class="panel-title"><i class="fas fa-layer-group"></i> Body Systems</div>
      <ul id="systems-list"></ul>

      <div class="panel-title mt-4"><i class="fas fa-sliders"></i> Layers</div>
      <div id="layers-list"></div>

      <div class="panel-title mt-4"><i class="fas fa-sitemap"></i> Structures <span id="struct-count" class="count"></span></div>
      <ul id="structure-tree"></ul>
    </aside>

    <!-- ───── Center: 3D viewer ───── -->
    <main id="viewer-wrap">
      <div id="viewer"></div>
      <div id="labels-layer"></div>

      <div id="viewer-hud">
        <div id="breadcrumb"><i class="fas fa-person"></i> Full Body</div>
        <div id="view-buttons">
          <button data-view="front" title="Front view">Front</button>
          <button data-view="side" title="Side view">Side</button>
          <button data-view="back" title="Back view">Back</button>
          <button id="reset-view" title="Reset everything"><i class="fas fa-rotate-left"></i></button>
          <button id="auto-rotate" title="Auto-rotate"><i class="fas fa-arrows-spin"></i></button>
        </div>
      </div>

      <div id="hover-tip" hidden></div>

      <!-- Journey overlay -->
      <section id="journey-card" hidden>
        <div class="jc-head">
          <span id="jc-icon"></span>
          <div><div id="jc-title" class="font-bold"></div><div id="jc-step" class="text-xs opacity-70"></div></div>
          <button id="jc-close" title="Exit journey"><i class="fas fa-xmark"></i></button>
        </div>
        <h3 id="jc-stage"></h3>
        <p id="jc-text"></p>
        <div class="jc-progress"><div id="jc-bar"></div></div>
        <div class="jc-ctrl">
          <button id="jc-prev"><i class="fas fa-backward-step"></i></button>
          <button id="jc-play"><i class="fas fa-pause"></i></button>
          <button id="jc-next"><i class="fas fa-forward-step"></i></button>
          <button id="jc-voice" title="Narration"><i class="fas fa-volume-high"></i></button>
        </div>
      </section>

      <!-- Quiz overlay -->
      <section id="quiz-card" hidden></section>

      <!-- ───── Bottom toolbar ───── -->
      <div id="toolbar">
        <button id="tb-extract" class="tool" disabled><i class="fas fa-up-right-from-square"></i><span>Extract</span></button>
        <button id="tb-explode" class="tool" disabled><i class="fas fa-burst"></i><span>Explode</span></button>
        <button id="tb-hide" class="tool" disabled><i class="fas fa-eye-slash"></i><span>Hide</span></button>
        <button id="tb-ghost" class="tool"><i class="fas fa-ghost"></i><span>X-Ray</span></button>
        <button id="tb-labels" class="tool"><i class="fas fa-tags"></i><span>Labels</span></button>
        <button id="tb-showall" class="tool"><i class="fas fa-eye"></i><span>Show All</span></button>
        <div class="tb-sep"></div>
        <button id="tb-quiz" class="tool accent"><i class="fas fa-graduation-cap"></i><span>Quiz</span></button>
      </div>

      <div id="loading"><div class="spinner"></div><p>Building 3D body…</p></div>
    </main>

    <!-- ───── Right: Info panel ───── -->
    <aside id="info-panel" class="panel">
      <div id="info-content"></div>
    </aside>
  </div>

  <!-- AI Assistant drawer -->
  <section id="ai-drawer" aria-label="AI Anatomy Assistant">
    <header>
      <div class="flex items-center gap-2"><div class="ai-avatar"><i class="fas fa-robot"></i></div><div><b>Ana</b> <span class="text-xs opacity-60">– your AI anatomy tutor</span><div id="ai-context" class="text-xs text-cyan-300"></div></div></div>
      <button id="ai-close"><i class="fas fa-xmark"></i></button>
    </header>
    <div id="ai-messages"></div>
    <div id="ai-suggest"></div>
    <form id="ai-form">
      <input id="ai-input" placeholder="Ask anything… e.g. Explain the pancreas like I'm 12" autocomplete="off" />
      <button type="submit"><i class="fas fa-paper-plane"></i></button>
    </form>
  </section>

  <div id="toast" hidden></div>

  <script type="module" src="/static/app.js"></script>
</body>
</html>`
