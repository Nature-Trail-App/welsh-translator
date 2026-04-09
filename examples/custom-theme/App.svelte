<script lang="ts">
  import { LookupEngine } from '../../src/core/index.js';
  import { TranslatableText } from '../../src/svelte/index.js';
  import { TranslatableHTML } from '../../src/svelte/index.js';
  import { vocabulary, pois } from '../data.js';

  const engine = LookupEngine.fromEntries(vocabulary);
  const poi = pois[0];

  const htmlSnippet = `<p>Mae'r <strong>nant</strong> yn llifo i lawr o'r <em>cwm</em>, heibio i'r <strong>coed</strong> trwchus, gan gario <em>dŵr</em> oer o'r bryniau.</p>`;
</script>

<main class="example-container">
  <div class="site-header">
    <span class="site-label">Custom Theme Example</span>
    <h1>CSS Variable Theming</h1>
    <p class="site-intro">
      All component styles can be overridden via <code>--wt-*</code> CSS custom properties.
      Below are three themes applied to the same content.
    </p>
  </div>

  <div class="themes">
    <!-- Default theme (no overrides) -->
    <section class="theme-card">
      <h2 class="theme-title">Default Theme</h2>
      <p class="theme-desc">No overrides — the built-in gold-on-dark styling.</p>
      <div class="theme-content">
        <TranslatableText text={poi.body} {engine} />
      </div>
    </section>

    <!-- Light theme -->
    <section class="theme-card light-theme">
      <h2 class="theme-title">Light Theme</h2>
      <p class="theme-desc">
        Override <code>--wt-popover-*</code> and <code>--wt-word-*</code> variables on a parent element.
      </p>
      <div class="theme-content">
        <TranslatableText text={poi.body} {engine} />
      </div>
    </section>

    <!-- Forest theme using TranslatableHTML -->
    <section class="theme-card forest-theme">
      <h2 class="theme-title">Forest Theme (HTML)</h2>
      <p class="theme-desc">
        A green palette applied to <code>TranslatableHTML</code> with rich HTML content.
      </p>
      <div class="theme-content">
        <TranslatableHTML html={htmlSnippet} {engine} />
      </div>
    </section>
  </div>

  <div class="instructions">
    <p><em>Tap any underlined word in each card to compare the themed popovers.</em></p>
  </div>

  <details class="code-example">
    <summary>View the CSS for these themes</summary>
    <pre><code>{`/* Light theme — set on a parent element */
.light-theme {
  --wt-popover-bg: #ffffff;
  --wt-popover-border: 1px solid #d0d0d0;
  --wt-popover-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --wt-popover-arrow-fill: #ffffff;
  --wt-popover-arrow-stroke: #d0d0d0;
  --wt-welsh-color: #1a3a5c;
  --wt-english-color: #333333;
  --wt-radical-color: #666666;
  --wt-note-color: #666666;
  --wt-note-border-color: rgba(0, 0, 0, 0.1);
  --wt-word-border-color: rgba(26, 58, 92, 0.4);
  --wt-word-hover-bg: rgba(26, 58, 92, 0.08);
  --wt-word-hover-border-color: rgba(26, 58, 92, 1);
  --wt-word-active-bg: rgba(26, 58, 92, 0.15);
  --wt-word-active-border-color: rgba(26, 58, 92, 1);
  --wt-word-focus-outline: 2px solid rgba(26, 58, 92, 0.3);
}

/* Forest theme */
.forest-theme {
  --wt-popover-bg: #1a2e1a;
  --wt-popover-border: 1px solid rgba(76, 175, 80, 0.3);
  --wt-popover-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  --wt-popover-arrow-fill: #1a2e1a;
  --wt-popover-arrow-stroke: rgba(76, 175, 80, 0.3);
  --wt-welsh-color: #a5d6a7;
  --wt-english-color: #c8e6c9;
  --wt-radical-color: #81c784;
  --wt-note-color: #81c784;
  --wt-note-border-color: rgba(76, 175, 80, 0.2);
  --wt-word-border-color: rgba(76, 175, 80, 0.45);
  --wt-word-hover-bg: rgba(76, 175, 80, 0.12);
  --wt-word-hover-border-color: rgba(76, 175, 80, 1);
  --wt-word-active-bg: rgba(76, 175, 80, 0.18);
  --wt-word-active-border-color: rgba(76, 175, 80, 1);
  --wt-word-focus-outline: 2px solid rgba(76, 175, 80, 0.4);
}`}</code></pre>
  </details>
</main>

<style>
  :root {
    --gold: #c9a84c;
    --gold-pale: #e8d4a0;
    --slate: #1a1f2e;
    --stone: #2c2f3a;
    --cream: #e8e0d0;
  }

  .example-container {
    max-width: 900px;
    margin: 3rem auto;
    padding: 0 1rem;
    font-family: 'Libre Baskerville', Georgia, serif;
    color: var(--cream);
  }

  .site-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .site-label {
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    color: var(--gold);
    text-transform: uppercase;
  }

  .site-intro {
    font-size: 0.9rem;
    color: #8a9bb0;
    max-width: 600px;
    margin: 1rem auto 0;
    line-height: 1.6;
  }

  .site-intro code {
    background: rgba(201, 168, 76, 0.15);
    padding: 0.1em 0.4em;
    border-radius: 3px;
    font-size: 0.85em;
    color: var(--gold-pale);
  }

  .themes {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .theme-card {
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .theme-title {
    font-size: 1.2rem;
    color: var(--gold-pale);
    margin: 0 0 0.25rem;
  }

  .theme-desc {
    font-size: 0.8rem;
    color: #8a9bb0;
    margin: 0 0 1.5rem;
    line-height: 1.5;
  }

  .theme-desc code {
    background: rgba(201, 168, 76, 0.15);
    padding: 0.1em 0.4em;
    border-radius: 3px;
    font-size: 0.85em;
    color: var(--gold-pale);
  }

  .theme-content {
    font-size: 1.05rem;
    line-height: 1.8;
  }

  /* ------------------------------------------------------------ */
  /* Default theme card — dark background, default component styles */
  /* ------------------------------------------------------------ */
  .theme-card:first-child {
    background: var(--stone);
  }

  /* ------------------------------------------------------------ */
  /* Light theme — overrides all --wt-* variables                 */
  /* ------------------------------------------------------------ */
  .light-theme {
    background: #f8f6f0;
    border-color: #d0d0d0;
    color: #333;

    --wt-popover-bg: #ffffff;
    --wt-popover-border: 1px solid #d0d0d0;
    --wt-popover-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    --wt-popover-arrow-fill: #ffffff;
    --wt-popover-arrow-stroke: #d0d0d0;
    --wt-welsh-color: #1a3a5c;
    --wt-english-color: #333333;
    --wt-radical-color: #666666;
    --wt-note-color: #666666;
    --wt-note-border-color: rgba(0, 0, 0, 0.1);
    --wt-word-border-color: rgba(26, 58, 92, 0.4);
    --wt-word-hover-bg: rgba(26, 58, 92, 0.08);
    --wt-word-hover-border-color: rgba(26, 58, 92, 1);
    --wt-word-active-bg: rgba(26, 58, 92, 0.15);
    --wt-word-active-border-color: rgba(26, 58, 92, 1);
    --wt-word-focus-outline: 2px solid rgba(26, 58, 92, 0.3);
  }

  .light-theme .theme-title {
    color: #1a3a5c;
  }

  .light-theme .theme-desc {
    color: #666;
  }

  .light-theme .theme-desc code {
    background: rgba(26, 58, 92, 0.1);
    color: #1a3a5c;
  }

  /* ------------------------------------------------------------ */
  /* Forest theme — green palette                                 */
  /* ------------------------------------------------------------ */
  .forest-theme {
    background: #0d1f0d;
    border-color: rgba(76, 175, 80, 0.2);
    color: #c8e6c9;

    --wt-popover-bg: #1a2e1a;
    --wt-popover-border: 1px solid rgba(76, 175, 80, 0.3);
    --wt-popover-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    --wt-popover-arrow-fill: #1a2e1a;
    --wt-popover-arrow-stroke: rgba(76, 175, 80, 0.3);
    --wt-welsh-color: #a5d6a7;
    --wt-english-color: #c8e6c9;
    --wt-radical-color: #81c784;
    --wt-note-color: #81c784;
    --wt-note-border-color: rgba(76, 175, 80, 0.2);
    --wt-word-border-color: rgba(76, 175, 80, 0.45);
    --wt-word-hover-bg: rgba(76, 175, 80, 0.12);
    --wt-word-hover-border-color: rgba(76, 175, 80, 1);
    --wt-word-active-bg: rgba(76, 175, 80, 0.18);
    --wt-word-active-border-color: rgba(76, 175, 80, 1);
    --wt-word-focus-outline: 2px solid rgba(76, 175, 80, 0.4);
  }

  .forest-theme .theme-title {
    color: #a5d6a7;
  }

  .forest-theme .theme-desc {
    color: #81c784;
  }

  .forest-theme .theme-desc code {
    background: rgba(76, 175, 80, 0.15);
    color: #a5d6a7;
  }

  /* ------------------------------------------------------------ */
  /* Code example                                                  */
  /* ------------------------------------------------------------ */
  .instructions {
    text-align: center;
    margin-top: 2rem;
    color: #8a9bb0;
    font-size: 0.9rem;
  }

  .code-example {
    margin-top: 2rem;
    background: var(--stone);
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 8px;
    padding: 1rem 1.5rem;
  }

  .code-example summary {
    cursor: pointer;
    color: var(--gold);
    font-size: 0.85rem;
    letter-spacing: 0.05em;
  }

  .code-example pre {
    margin: 1rem 0 0;
    overflow-x: auto;
  }

  .code-example code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.78rem;
    line-height: 1.6;
    color: #b0bec5;
  }
</style>
