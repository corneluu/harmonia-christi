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
                console.warn(`Could not find song for "${item.title}"`);
            }

            // Update Parts
            if (item.parts) {
                for (const partType of Object.keys(item.parts)) {
                    // key is "Sopran", "Alto", etc.
                    // We need to find a song named "Title | PartType"
                    // The base title is 'item.title' (cleaned).

                    const baseTitle = cleanTitle(item.title);

                    // Variations to try:
                    // "Title | Part"
                    // "Title | Part " (trailing space?)
                    // "Title | PartType" (case sensitive?)

                    // Specific fix for "Bas" vs "Bass"
                    let searchPart = partType;
                    if (partType === 'Bass') searchPart = 'Bas'; // songs.json seems to use "Bas" often

                    const variations = [
                        `${baseTitle} | ${partType}`,
                        `${baseTitle} | ${searchPart}`,
                        `${baseTitle} | ${partType.toLowerCase()}`,
                        `${baseTitle} | ${searchPart.toLowerCase()}`,
                        `${baseTitle} ${partType}`, // "Song Name Bas"
                    ];

                    let foundPartId = null;
                    for (const v of variations) {
                        foundPartId = findSongId(v);
                        if (foundPartId) break;
                    }

                    if (foundPartId) {
                        if (item.parts[partType] !== foundPartId) {
                            // console.log(`  Updating part ${partType}: ${item.parts[partType]} -> ${foundPartId}`);
                            item.parts[partType] = foundPartId;
                        }
                    } else {
                        // Fallback: If not found, look for "Bass" if we searched "Bas"
                        // songs.json has "Bless the lord | Bas" (lowercase lord, Bas)
                        // My cleanedMap should handle case.
                        console.warn(`  Could not find part "${partType}" for "${baseTitle}"`);
                    }
                }
            }

            // Update Pages
            if (item.pages) {
                for (const page of item.pages) {
                    // Usually pages link to the main song ID or specific ID. 
                    // If the page has an ID, we assume it refers to the same song ID or we need to find it?
                    // Usually pages id matches the main song id.
                    // Let's just update match the main song ID if we found one.
                    if (newSongId) {
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
