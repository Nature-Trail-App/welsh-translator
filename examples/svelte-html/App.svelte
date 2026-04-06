<script lang="ts">
  import { LookupEngine } from '../../src/core/index.js';
  import { TranslatableHTML } from '../../src/svelte/index.js';
  import { vocabulary } from '../data.js';

  // Initialize the engine with our sample vocabulary
  const engine = LookupEngine.fromEntries(vocabulary);

  // HTML-formatted Welsh prose — the same content as the plain-text example,
  // but with paragraph breaks, bold, and italic formatting.
  const htmlContent = `
    <p>Ar lan y <strong>m\u00F4r</strong>, mae <em>bwthyn</em> bach yn sefyll
    uwchlaw'r <strong>traeth</strong>. Adeiladwyd y <em>pentref</em> hwn gan
    chwarelwyr y <strong>mynydd</strong>, ac mae'r llwybr arfordirol yn dilyn
    ymyl y graig.</p>

    <p>Gwelir <strong>carreg</strong> fawr wrth ymyl y <em>capel</em>, a elwir
    yn Faen y Gorffennol. Mae'r <strong>nant</strong> yn llifo i lawr o'r
    <em>cwm</em>, heibio i'r <strong>coed</strong> trwchus, gan gario
    <em>d\u0175r</em> oer o'r bryniau.</p>

    <p>Unwaith roedd <em>gorsaf</em> fechan yma, a hen <strong>dad</strong> y
    pentref a'i hadeiladodd. Dyma ganolfan yr <strong>iaith</strong> Gymraeg ar
    Benrhyn Ll\u0177n.</p>
  `;
</script>

<main class="example-container">
  <div class="site-header">
    <span class="site-label">Svelte 5 HTML Example</span>
    <h1>Nant Gwrtheyrn</h1>
  </div>

  <div class="poi-card">
    <header class="poi-header">
      <h2 class="poi-name">Porthladd yr Iaith</h2>
      <p class="poi-meta">Harbour of the Language &bull; Heritage Site</p>
    </header>

    <div class="poi-content">
      <TranslatableHTML html={htmlContent} {engine} />
    </div>
  </div>

  <div class="instructions">
    <p><em>Tap any underlined word to see its English translation.</em></p>
    <p><em>HTML formatting (bold, italic, paragraphs) is preserved.</em></p>
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
    margin-bottom: 3rem;
  }

  .site-label {
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    color: var(--gold);
    text-transform: uppercase;
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

  .instructions {
    text-align: center;
    margin-top: 2rem;
    color: #8a9bb0;
    font-size: 0.9rem;
  }
</style>
