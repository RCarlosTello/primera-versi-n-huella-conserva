import { detectLinea, handleMAN, detectManualDesdeQuery } from '../app/modules.js';
import fs from 'fs';

async function testBot() {
    console.log("=== INICIANDO PRUEBAS DEL BOT ===\n");

    const tests = [
        {
            modulo: 'MAN',
            linea: 'Conserva T Activa',
            query: '¿Cuál es el monto mínimo y el monto máximo del crédito Conserva T-Activa?',
            expected_min: '10,000'
        },
        {
            modulo: 'MAN',
            linea: 'Tu Hogar',
            query: '¿Cuáles son los plazos disponibles para crédito Tu Hogar?',
            expected: 'Hasta $70,000: 6, 12, 18, 24 y 36 meses'
        },
        {
            modulo: 'MAN',
            linea: 'Caja Chica',
            query: '¿Cuál es el monto máximo del fondo de Caja Chica para sucursales?',
            expected: '2,000'
        }
    ];

    for (const test of tests) {
        console.log(`Prueba: ${test.query}`);
        const lineaInfo = detectLinea(test.linea);
        if (!lineaInfo) {
            console.log(`Error: No se detectó la línea ${test.linea}`);
            continue;
        }
        const result = handleMAN(test.query, lineaInfo);
        console.log(`✓ Bot responde:\n${result.content}\n`);
    }

    console.log("=== FIN DE PRUEBAS ===");
}

testBot();
