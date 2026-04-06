import type { VocabularyEntry } from '../src/core/types.js';

export const vocabulary: VocabularyEntry[] = [
  { id: "v01", welsh: "nant", english: "stream / valley", site: "nant-gwrtheyrn", note: "Also used in place names" },
  { id: "v02", welsh: "môr", english: "sea", site: "nant-gwrtheyrn" },
  { id: "v03", welsh: "mynydd", english: "mountain", site: "nant-gwrtheyrn" },
  { id: "v04", welsh: "llwybr", english: "path / trail", site: "nant-gwrtheyrn" },
  { id: "v05", welsh: "maen", english: "stone", site: "nant-gwrtheyrn", note: "Plural: meini" },
  { id: "v06", welsh: "coed", english: "trees / woodland", site: "nant-gwrtheyrn" },
  { id: "v07", welsh: "carreg", english: "rock / stone", site: "nant-gwrtheyrn" },
  { id: "v08", welsh: "pysgodyn", english: "fish", site: "nant-gwrtheyrn" },
  { id: "v09", welsh: "gorsaf", english: "station", site: "nant-gwrtheyrn" },
  { id: "v10", welsh: "tad", english: "father", site: "nant-gwrtheyrn" },
  { id: "v11", welsh: "pen", english: "head / headland", site: "nant-gwrtheyrn", note: "Common in place names" },
  { id: "v12", welsh: "bwthyn", english: "cottage", site: "nant-gwrtheyrn" },
  { id: "v13", welsh: "capel", english: "chapel", site: "nant-gwrtheyrn" },
  { id: "v14", welsh: "traeth", english: "beach", site: "nant-gwrtheyrn" },
  { id: "v15", welsh: "cwm", english: "valley / glen", site: "nant-gwrtheyrn" },
  { id: "v16", welsh: "golau", english: "light", site: "nant-gwrtheyrn" },
  { id: "v17", welsh: "dŵr", english: "water", site: "nant-gwrtheyrn" },
  { id: "v18", welsh: "pentref", english: "village", site: "nant-gwrtheyrn" },
  { id: "v19", welsh: "porthladd", english: "harbour / port", site: "nant-gwrtheyrn" },
  { id: "v20", welsh: "iaith", english: "language", site: "nant-gwrtheyrn" },
];

export const pois = [
  {
    id: "poi01",
    name: "Porthladd yr Iaith",
    nameEnglish: "Harbour of the Language",
    type: "Heritage Site",
    site: "nant-gwrtheyrn",
    body: `Ar lan y môr, mae bwthyn bach yn sefyll uwchlaw'r traeth. Adeiladwyd y pentref hwn gan chwarelwyr y mynydd, ac mae'r llwybr arfordirol yn dilyn ymyl y graig. Gwelir carreg fawr wrth ymyl y capel, a elwir yn Faen y Gorffennol. Mae'r nant yn llifo i lawr o'r cwm, heibio i'r coed trwchus, gan gario dŵr oer o'r bryniau. Unwaith roedd gorsaf fechan yma, a hen dad y pentref a'i hadeiladodd. Dyma ganolfan yr iaith Gymraeg ar Benrhyn Llŷn.`,
  },
];
