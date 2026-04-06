import { LookupEngine, tokenise } from '../../src/core/index.js';
import { vocabulary, pois } from '../data.js';

// 1. Initialize the engine
const engine = LookupEngine.fromEntries(vocabulary);
const poi = pois[0];

// 2. Select DOM elements
const poiNameEl = document.getElementById('poi-name')!;
const poiBodyEl = document.getElementById('poi-body')!;
const translationBox = document.getElementById('translation-box')!;
const ttWord = document.getElementById('tt-word')!;
const ttRadical = document.getElementById('tt-radical')!;
const ttEnglish = document.getElementById('tt-english')!;

// 3. Render name
poiNameEl.textContent = poi.name;

// 4. Render interactive words
const tokens = tokenise(poi.body);

tokens.forEach(token => {
  if (token.type === 'word') {
    const hasTranslation = engine.hasTranslation(token.word);
    
    // Create a container for the word and its surrounding punctuation
    const container = document.createElement('span');
    
    if (token.pre) container.appendChild(document.createTextNode(token.pre));
    
    const wordSpan = document.createElement('span');
    wordSpan.textContent = token.word;
    wordSpan.className = 'word';
    wordSpan.setAttribute('data-translatable', String(hasTranslation));
    
    if (hasTranslation) {
      wordSpan.addEventListener('click', () => {
        const result = engine.lookup(token.word);
        if (result.entry) {
          showTranslation(token.word, result.radical, result.entry.english);
        }
      });
    }
    
    container.appendChild(wordSpan);
    
    if (token.post) container.appendChild(document.createTextNode(token.post));
    
    poiBodyEl.appendChild(container);
  } else {
    // Just append whitespace or other punctuation tokens
    poiBodyEl.appendChild(document.createTextNode(token.raw));
  }
});

function showTranslation(word: string, radical: string | null, english: string) {
  ttWord.textContent = word;
  ttRadical.textContent = radical ? `radical: ${radical}` : '';
  ttEnglish.textContent = english;
  translationBox.style.display = 'block';
}
