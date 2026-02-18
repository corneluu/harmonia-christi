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

const DEBUG_FILE = path.join(__dirname, 'sync_debug.log');
fs.writeFileSync(DEBUG_FILE, ''); // Clear file

function logDebug(msg) {
    fs.appendFileSync(DEBUG_FILE, msg + '\n');
    console.log(msg);
}

function run() {
    logDebug('Reading files...');
    const songs = JSON.parse(fs.readFileSync(SONGS_PATH, 'utf8'));
    const concerts = JSON.parse(fs.readFileSync(CONCERTS_PATH, 'utf8'));
    // ...


    // Build lookup maps
    // 1. Exact Title Map
    const titleMap = new Map();
    // 2. Cleaned Title Map (lower case)
    const cleanedMap = new Map();

    songs.forEach(song => {
        titleMap.set(song.title, song.id);
        cleanedMap.set(song.title.toLowerCase(), song.id);
        if (song.title.includes("Elijah")) {
            const codes = song.title.split('').map(c => c.charCodeAt(0)).join(',');
            logDebug(`Loaded song: "${song.title}" Codes: ${codes} ID: ${song.id}`);
        }
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


    // Manual mapping for title variations or English -> Romanian
    const titleMapping = {
        "The Days of Elijah": "The days of Elijah",
        "Heaven Is in My Heart": "Cerul e in inima mea",
        "E piu bello Insieme": "Împreună i mai frumos",
        "Doamne intr-o zi m-ai chemat": "Doamne, intr o zi m ai chemat",
        "Spera in Domnul": "Spera in domnul",
        "Verso l’alto (doar cu orga)": "Verso l'alto"
    };

    const sections = Object.keys(concerts);
    let updatedCount = 0;

    for (const section of sections) {
        if (!concerts[section].items) continue;

        for (const item of concerts[section].items) {

            // Clean title and check mapping
            let cleanItemTitle = cleanTitle(item.title);
            if (titleMapping[cleanItemTitle]) {
                console.log(`Mapping "${cleanItemTitle}" -> "${titleMapping[cleanItemTitle]}"`);
                cleanItemTitle = titleMapping[cleanItemTitle];
            }

            // Update Main Song ID
            // Try finding by mapped title first, then original
            let newSongId = findSongId(cleanItemTitle) || findSongId(item.title);

            if (newSongId) {
                if (item.songId !== newSongId) {
                    console.log(`Updating "${item.title}": ${item.songId} -> ${newSongId}`);
                    item.songId = newSongId;
                    updatedCount++;
                }
            } else {
                console.warn(`Could not find song for "${item.title}" (mapped: "${cleanItemTitle}") - Removing Link`);
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
                    // Try matches with mapped title AND original/aliased titles
                    const baseTitles = [cleanItemTitle];

                    // Specific aliases for cross-language parts
                    if (cleanItemTitle === "Heaven Is in My Heart") baseTitles.push("Cerul e in inima mea");
                    if (cleanItemTitle === "Cerul e in inima mea") baseTitles.push("Heaven Is in My Heart");
                    if (cleanItemTitle === "Doamne intr-o zi m-ai chemat") baseTitles.push("Doamne, intr o zi m ai chemat");
                    if (cleanItemTitle.includes("Te caut")) baseTitles.push("Te caut o Doamne");
                    if (cleanItemTitle.includes("Emmanuel")) baseTitles.push("Emmanuel"); // Ensure clean title is used for strict matching
                    if (cleanItemTitle.includes("In veci voi canta")) baseTitles.push("In veci voi canta");
                    if (cleanItemTitle.includes("Kyrie Bunoza")) baseTitles.push("Kyrie Bunoza");
                    if (cleanItemTitle.includes("Verso")) {
                        baseTitles.push("Verso l'alto");
                        baseTitles.push("Verso l’alto");
                    }
                    if (cleanItemTitle.includes("Marching")) baseTitles.push("Marching song");

                    // Debug specific songs
                    const isDebug = cleanItemTitle.includes("Marching") || cleanItemTitle.includes("Verso");

                    // Specific fix for "Bass" vs "Bas"
                    let searchPart = partType;
                    if (partType === 'Bass') searchPart = 'Bas';

                    let foundPartId = null;

                    // Loop through all base title variations
                    for (const base of baseTitles) {
                        const variations = [
                            `${base} | ${partType}`,
                            `${base} | ${searchPart}`,
                            `${base} | ${partType.toLowerCase()}`,
                            `${base} | ${searchPart.toLowerCase()}`,
                            `${base} - ${partType}`,
                            `${base} (${partType})`,
                        ];

                        if (base.includes("Elijah")) {
                            const vCodes = variations[0].split('').map(c => c.charCodeAt(0)).join(',');
                            logDebug(`Checking Elijah vars for base "${base}": ${vCodes}`);
                        }

                        for (const v of variations) {
                            if (base.includes("Elijah") || isDebug) {
                                const res = findSongId(v);
                                if (isDebug) console.log(`  [DEBUG] Checking: "${v}" -> Found: ${res}`);

                                if (base.includes("Elijah")) {
                                    const vCodes = v.split('').map(c => c.charCodeAt(0)).join(',');
                                    logDebug(`  Checking: "${v}" Codes: ${vCodes} -> Found: ${res}`);
                                }
                                foundPartId = res;
                            } else {
                                foundPartId = findSongId(v);
                            }
                            if (foundPartId) break;
                        }
                        if (foundPartId) break; // Found a match with this base title
                    }

                    // (Redundant loop removed)

                    if (foundPartId) {
                        if (item.parts[partType] !== foundPartId) {
                            console.log(`  Updating part ${partType} for "${cleanItemTitle}": ${item.parts[partType]} -> ${foundPartId}`);
                            item.parts[partType] = foundPartId;
                        }
                    } else {
                        // STRICT: If not found, set to null. User said "dont put it".
                        if (item.parts[partType] !== null) {
                            console.log(`  Removing part ${partType} for "${cleanItemTitle}" (Not found)`);
                            item.parts[partType] = null;
                        }
                    }
                }
            }

            // Update Pages & Special Fixes
            const emmanuelCheck = cleanTitle(item.title).toLowerCase();
            if (emmanuelCheck.includes('emmanuel')) {
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
                        page.id = newSongId;
                    }
                }
            }

            // Sync Title with Song Title (Preserve Number & Suffix)
            if (newSongId) {
                // Find the song object to get the exact clean title
                // We built maps: titleMap (exact), cleanedMap (lower).
                // We need to look up the song by ID strictly to get the formatting.
                const songObj = songs.find(s => s.id === newSongId);
                if (songObj) {
                    const originalTitle = item.title;

                    // Extract Prefix (Number)
                    const prefixMatch = originalTitle.match(/^(\d+[\.\s]*\s*)/);
                    const prefix = prefixMatch ? prefixMatch[1] : '';

                    // Extract Suffix ( – Soloist etc)
                    // We split by ' – ' or ' - ' to find the separator used
                    let separator = '';
                    let suffix = '';
                    if (originalTitle.includes(' – ')) {
                        separator = ' – ';
                        suffix = originalTitle.split(' – ').slice(1).join(' – ');
                    } else if (originalTitle.includes(' - ')) {
                        separator = ' - ';
                        suffix = originalTitle.split(' - ').slice(1).join(' - ');
                    }

                    // Construct New Title
                    let newTitle = prefix + songObj.title;
                    if (suffix) {
                        newTitle += separator + suffix;
                    }

                    if (item.title !== newTitle) {
                        console.log(`  Renaming "${item.title}" -> "${newTitle}"`);
                        item.title = newTitle;
                        updatedCount++;
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
