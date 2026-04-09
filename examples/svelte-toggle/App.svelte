<script lang="ts">
  import { LookupEngine } from '../../src/core/index.js';
  import { TranslatableText, TranslatableHTML } from '../../src/svelte/index.js';
  import { vocabulary, pois } from '../data.js';

  const engine = LookupEngine.fromEntries(vocabulary);
  const poi = pois[0];

  let translationEnabled = $state(true);

  const htmlContent = `
    <p>Ar lan y <strong>môr</strong>, mae <em>bwthyn</em> bach yn sefyll
    uwchlaw'r <strong>traeth</strong>. Adeiladwyd y <em>pentref</em> hwn gan
    chwarelwyr y <strong>mynydd</strong>, ac mae'r llwybr arfordirol yn dilyn
    ymyl y graig.</p>

    <p>Gwelir <strong>carreg</strong> fawr wrth ymyl y <em>capel</em>, a elwir
    yn Faen y Gorffennol. Mae'r <strong>nant</strong> yn llifo i lawr o'r
    <em>cwm</em>, heibio i'r <strong>coed</strong> trwchus, gan gario
    <em>dŵr</em> oer o'r bryniau.</p>
  `;
</script>

<main class="example-container">
  <div class="site-header">
    <span class="site-label">Svelte 5 Toggle Example</span>
    <h1>Nant Gwrtheyrn</h1>
  </div>

  <div class="toggle-bar">
    <span class="toggle-label">Translation</span>
    <button
      class="toggle-btn"
      class:toggle-btn--on={translationEnabled}
      onclick={() => (translationEnabled = !translationEnabled)}
      aria-pressed={translationEnabled}
    >
      {translationEnabled ? 'On' : 'Off'}
    </button>
  </div>

  <div class="poi-card">
    <header class="poi-header">
      <h2 class="poi-name">{poi.name}</h2>
      <p class="poi-meta">{poi.nameEnglish} • {poi.type}</p>
    </header>

    <div class="poi-content">
      <h3 class="section-label">TranslatableText</h3>
      <TranslatableText text={poi.body} {engine} enabled={translationEnabled} />
    </div>

    <div class="poi-content poi-content--html">
      <h3 class="section-label">TranslatableHTML</h3>
      <TranslatableHTML html={htmlContent} {engine} enabled={translationEnabled} />
    </div>
  </div>

  <div class="instructions">
    {#if translationEnabled}
      <p><em>Tap any underlined word to see its English translation.</em></p>
    {:else}
      <p><em>Translation is disabled — text renders with no overhead.</em></p>
    {/if}
  </div>
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
    max-width: 800px;
    margin: 4rem auto;
    padding: 0 1rem;
    font-family: 'Libre Baskerville', Georgia, serif;
    color: var(--cream);
  }

  .site-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .site-label {
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    color: var(--gold);
    text-transform: uppercase;
  }

  .toggle-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .toggle-label {
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a9bb0;
  }

  .toggle-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(201, 168, 76, 0.3);
    border-radius: 20px;
    color: var(--cream);
    cursor: pointer;
    font-family: inherit;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    padding: 0.4rem 1.2rem;
    transition: background 0.2s, border-color 0.2s;
  }

  .toggle-btn--on {
    background: rgba(201, 168, 76, 0.15);
    border-color: var(--gold);
    color: var(--gold-pale);
  }

  .toggle-btn:hover {
    background: rgba(201, 168, 76, 0.2);
    border-color: var(--gold);
  }

  .poi-card {
    background: var(--stone);
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 8px;
    padding: 2.5rem;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .poi-name {
    font-size: 1.5rem;
    color: var(--gold-pale);
    margin: 0 0 0.5rem;
  }

  .poi-meta {
    font-size: 0.8rem;
    color: #8a9bb0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 2rem;
  }

  .poi-content {
    font-size: 1.1rem;
    line-height: 1.8;
  }

  .poi-content--html {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(201, 168, 76, 0.15);
  }

  .section-label {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #8a9bb0;
    margin: 0 0 0.75rem;
  }

  .instructions {
    text-align: center;
    margin-top: 2rem;
    color: #8a9bb0;
    font-size: 0.9rem;
  }
</style>
