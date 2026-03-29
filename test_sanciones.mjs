import { handleMAN } from './app/modules.js';

const linea = { id: 'MAN_AUD' };

const res1 = handleMAN('8 Sanciones progresivas reales', linea);
console.log('Result for button click:', JSON.stringify(res1, null, 2));

const res2 = handleMAN('sanciones progresivas reales', linea);
console.log('Result for text:', JSON.stringify(res2, null, 2));
