import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SONGS_PATH = path.join(__dirname, '../src/data/songs.json');
const CONCERTS_PATH = path.join(__dirname, '../src/data/concerts.json');

function cleanTitle(title) {
    if (!title) return '';
    // Basic cleaning to match the style in songs.json if needed
    // But mostly we want to match the "Concert Item Title" (which might have " - Soloist") 
    // to the "Song Title" (which usually doesn't).

    // Remove " – Soloist" or " - Soloist"
    let cleaned = title.split(' – ')[0].split(' - ')[0];

    // Remove leading numbering if present (e.g. "1 ", "1. ", "1.", "10 ")
    // Regex: Start of string, one or more digits, optional dot, optional space, then rest
    cleaned = cleaned.replace(/^\d+[\.\s]*\s*/, '');

    return cleaned.trim();
}

function run() {
    console.log('Reading files...');
    const songs = JSON.parse(fs.readFileSync(SONGS_PATH, 'utf8'));
    const concerts = JSON.parse(fs.readFileSync(CONCERTS_PATH, 'utf8'));

    // Build lookup maps
    // 1. Exact Title Map
    const titleMap = new Map();
    // 2. Cleaned Title Map (lower case)
    const cleanedMap = new Map();

    songs.forEach(song => {
        titleMap.set(song.title, song.id);
        cleanedMap.set(song.title.toLowerCase(), song.id);
    });

    console.log(`Loaded ${songs.length} songs.`);

    // Helper to find song ID
    function findSongId(title, context = '') {
        if (!title) return null;

        // 1. Exact match
        if (titleMap.has(title)) return titleMap.get(title);

        // 2. Case insensitive
        const lower = title.toLowerCase();
        if (cleanedMap.has(lower)) return cleanedMap.get(lower);

        // 3. Cleaned match (remove soloist etc)
        const cleaned = cleanTitle(title);
        const cleanedLower = cleaned.toLowerCase();
        if (cleanedMap.has(cleanedLower)) return cleanedMap.get(cleanedLower);

        // 4. Try matching "Title | Part" format if looking for a part?
        // No, this function is specific.

        return null;
    }

    const sections = Object.keys(concerts);
    let updatedCount = 0;

    for (const section of sections) {
        if (!concerts[section].items) continue;

        for (const item of concerts[section].items) {
            // Update Main Song ID
            const newSongId = findSongId(item.title);
            if (newSongId) {
                if (item.songId !== newSongId) {
                    console.log(`Updating "${item.title}": ${item.songId} -> ${newSongId}`);
                    item.songId = newSongId;
                    updatedCount++;
                }
            } else {
                console.warn(`Could not find song for "${item.title}" - Removing Link`);
                // CRITICAL: Clear the ID if not found, to avoid linking to wrong (old) IDs
                if (item.songId !== null) {
                    item.songId = null;
                    updatedCount++;
                }
                // Also clear pages if no song found
                if (item.pages && item.pages.length > 0) {
                    item.pages = [];
                }
            }

            // Update Parts
            if (item.parts) {
                // Special handling for "Emmanuel" to have only 1 page if requested? 
                // Actually the user said "put only one sheet" for Emmanuel. This is about 'pages', not 'parts'.
                // But let's fix parts first.

                for (const partType of Object.keys(item.parts)) {
                    const baseTitle = cleanTitle(item.title);

                    // Specific fix for "Bass" vs "Bas"
                    let searchPart = partType;
                    if (partType === 'Bass') searchPart = 'Bas';

                    // STRICT variations only. 
                    // We expect "Title | Part" or "Title (Part)" or "Title - Part".
                    // We DO NOT match just "Title" (main song).

                    const variations = [
                        `${baseTitle} | ${partType}`,
                        `${baseTitle} | ${searchPart}`,
                        `${baseTitle} | ${partType.toLowerCase()}`,
                        `${baseTitle} | ${searchPart.toLowerCase()}`,
                        `${baseTitle} - ${partType}`,
                        `${baseTitle} (${partType})`,
                        // Handle "Title Part" e.g. "Song Bas" if that is a pattern, but be careful.
                        // songs.json usually has "|".
                    ];

                    let foundPartId = null;
                    for (const v of variations) {
                        // We need a way to find EXACT or very close match, checking our titleMap/cleanedMap.
                        // Our findSongId does exact or cleaned match.
                        // But we want to ensure we don't accidentally match the main song if the main song IS "Title".
                        // The variations above include the part name, so they shouldn't match "Title" unless "Title" literally contains the part name.
                        foundPartId = findSongId(v);
                        if (foundPartId) break;
                    }

                    if (foundPartId) {
                        if (item.parts[partType] !== foundPartId) {
                            console.log(`  Updating part ${partType} for "${baseTitle}": ${item.parts[partType]} -> ${foundPartId}`);
                            item.parts[partType] = foundPartId;
                        }
                    } else {
                        // STRICT: If not found, set to null. User said "dont put it".
                        if (item.parts[partType] !== null) {
                            console.log(`  Removing part ${partType} for "${baseTitle}" (Not found)`);
                            item.parts[partType] = null;
                        }
                    }
                }
            }

            // Update Pages & Special Fixes
            if (cleanTitle(item.title).toLowerCase().includes('emmanuel')) {
                // User wants "put only one sheet".
                // Let's keep the first page if it exists, or just the main song as a single page?
                // Usually pages array is [ {label: "Pg 1", id: ...}, ... ]
                // If we just want 1 sheet, we can reduce it.
                // Assuming the main song ID is the sheet.
                if (item.pages && item.pages.length > 1) {
                    console.log(`  Fixing Emmanuel pages (reducing to 1)`);
                    item.pages = [
                        { label: "Partitură", id: newSongId || item.songId }
                    ];
                }
            } else if (item.pages) {
                // For other songs, update IDs if we have a new main song ID
                for (const page of item.pages) {
                    if (newSongId) {
                        // Only update if it was pointing to the old main song? 
                        // Or just always update to main song?
                        // User said "if the song name isnt the same... dont put it".
                        // But for pages, typically "Pg 1" IS the main song PDF.

                        // Heuristic: If page.id was same as old item.songId, update it.
                        // Or if we are confident newSongId is correct.
                        page.id = newSongId;
                    }
                }
            }

        }
    }

    console.log(`Updated ${updatedCount} items.`);
    fs.writeFileSync(CONCERTS_PATH, JSON.stringify(concerts, null, 2));
    console.log('Saved concerts.json');
}

run();
