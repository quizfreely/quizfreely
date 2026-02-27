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
    processAndUpdateTermImage: async function (termId, termDefSide, file) {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        const QUALITY = 0.8;

        const side = termDefSide.toUpperCase();
        if (side != "TERM" && side != "DEF") {
            console.error("processAndUpdateTermImage: termDefSide param must be \"TERM\" or \"DEF\"");
            return null;
        }

        const terms = await db.terms.where("studysetId").equals(termId).toArray();
        if (terms?.length != 1) {
            console.error("processAndUpdateTermImage: No terms found with termId " + termId);
            return null;
        }

        const term = terms[0];

        const blob = await this.processImage(file, MAX_WIDTH, MAX_HEIGHT, QUALITY);
        const newKey = await db.termImages.add({ blob: blob });

        const oldKey = term[side == "DEF" ? "defImageKey" : "termImageKey"];
        if (oldKey != null) {
            await db.termImages.delete(oldKey);
        }

        const rnISOString = (new Date()).toISOString();
        let updates = {
            updatedAt: rnISOString
        }
        if (side == "DEF") {
            updates.defImageKey = newKey;
        } else {
            updates.termImageKey = newKey;
        }
        await db.terms.update(termId, updates);

        return blob;
    },
    getTermImageObjectUrl: async function (key) {
        return URL.createObjectURL(
            (await db.termImages.get(key)).blob
        );
    }
}
