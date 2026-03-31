/**
 * app/llm-worker.js
 * Web Worker — Inferencia local con @huggingface/transformers
 *
 * Se ejecuta fuera del hilo principal para no bloquear la UI.
 * El modelo se descarga una vez y queda en caché del navegador (Cache Storage).
 *
 * Mensajes entrantes (self.onmessage):
 *   { type: 'init' }
 *   { type: 'generate', payload: { messages, maxTokens } }
 *
 * Mensajes salientes (self.postMessage):
 *   { type: 'progress', payload: { status, name, progress } }
 *   { type: 'ready' }
 *   { type: 'token',   payload: string }
 *   { type: 'done' }
 *   { type: 'error',   payload: string }
 */

import { pipeline, TextStreamer, env } from '@huggingface/transformers';

// Usar caché del navegador (Cache Storage), no intentar carga local de archivos
env.allowLocalModels = false;
env.useBrowserCache  = true;

// Modelo cuantizado pequeño con buen soporte de español
// TinyLlama 1.1B Chat — ~600 MB en q4, excelente para respuestas institucionales
const MODEL_ID = 'Xenova/TinyLlama-1.1B-Chat-v1.0';
const DTYPE     = 'q4';

let generator = null;

self.onmessage = async (event) => {
    const { type, payload } = event.data;

    // ── Inicializar modelo ──────────────────────────────────────
    if (type === 'init') {
        try {
            generator = await pipeline('text-generation', MODEL_ID, {
                dtype: DTYPE,
                progress_callback: (info) => {
                    self.postMessage({ type: 'progress', payload: info });
                },
            });
            self.postMessage({ type: 'ready' });
        } catch (err) {
            self.postMessage({ type: 'error', payload: String(err?.message || err) });
        }
        return;
    }

    // ── Generar respuesta ───────────────────────────────────────
    if (type === 'generate') {
        if (!generator) {
            self.postMessage({ type: 'error', payload: 'Modelo no inicializado. Llama a init primero.' });
            return;
        }

        const { messages, maxTokens = 512 } = payload || {};

        try {
            // Construir prompt usando la plantilla de chat del modelo
            const tokenizer = generator.tokenizer;
            const prompt = tokenizer.apply_chat_template(messages, {
                tokenize: false,
                add_generation_prompt: true,
            });

            // Streamer: emite cada token al hilo principal en tiempo real
            const streamer = new TextStreamer(tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function: (token) => {
                    self.postMessage({ type: 'token', payload: token });
                },
            });

            await generator(prompt, {
                max_new_tokens: maxTokens,
                temperature: 0.7,
                do_sample: true,
                top_p: 0.9,
                repetition_penalty: 1.1,
                streamer,
            });

            self.postMessage({ type: 'done' });
        } catch (err) {
            self.postMessage({ type: 'error', payload: String(err?.message || err) });
        }
        return;
    }
};
