/*!
 * Quizfreely IDB API Layer, licensed under GPL-3.0-or-later.
 * Copyright (c) 2025-2026 Ehan Ahamed and contributors
 *
 * https://codeberg.org/quizfreely/idb-api-layer
 * https://github.com/quizfreely/idb-api-layer
 */
import db from "./db.js";

export default {
    processImage: function (file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let { width, height } = img;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error("Canvas is empty"));
                        resolve(blob);
                    },
                    "image/webp",
                    quality
                );
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    processAndUpdateTermImage: async function (termId, defSide, file) {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        const QUALITY = 0.8;

        if (defSide !== true && defSide != false) {
            console.error("processAndUpdateTermImage: defSide param must be a boolean");
            return null;
        }

        const term = await db.terms.get(termId);
        if (term === undefined) {
            console.error("processAndUpdateTermImage: No term found with termId " + termId);
            return null;
        }

        const blob = await this.processImage(file, MAX_WIDTH, MAX_HEIGHT, QUALITY);

        await db.termImages.delete([termId, defSide]);
        await db.termImages.add({ termId, defSide, blob: blob });

        return blob;
    },
    getTermDefImageObjectUrls: async function (termId) {
        const termImage = await db.termImages.get([termId, false]);
        const defImage = await db.termImages.get([termId, true]);
        return {
            termImageUrl: termImage === undefined ? null : URL.createObjectURL(termImage.blob),
            defImageUrl: defImage === undefined ? null : URL.createObjectURL(defImage.blob)
        }
    },
    deleteTermImages: async function (termIds) {
        await db.termImages.where("termId").anyOf(termIds).delete();
    }
}
