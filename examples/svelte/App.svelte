<script lang="ts">
  import { LookupEngine } from '../../src/core/index.js';
  import { TranslatableText } from '../../src/svelte/index.js';
  import { vocabulary, pois } from '../data.js';

  // Initialize the engine with our sample vocabulary
  const engine = LookupEngine.fromEntries(vocabulary);
  const poi = pois[0];
</script>

<main class="example-container">
  <div class="site-header">
    <span class="site-label">Svelte 5 Example</span>
    <h1>Nant Gwrtheyrn</h1>
  </div>

  <div class="poi-card">
    <header class="poi-header">
      <h2 class="poi-name">{poi.name}</h2>
      <p class="poi-meta">{poi.nameEnglish} • {poi.type}</p>
    </header>

    <div class="poi-content">
      <TranslatableText text={poi.body} {engine} />
    </div>
  </div>

  <div class="instructions">
    <p><em>Tap any underlined word to see its English translation.</em></p>
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
