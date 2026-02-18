/**
 * HARMONIA CHRISTI - UPDATE CHECKER (SEQUENTIAL IDs)
 * ==================================================
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Apps Script editor (extensions > Apps Script).
 * 2. Create a new file or replace the old one.
 * 3. COPY the content of your `songs.json` file.
 * 4. PASTE it inside the variable `EXISTING_SONGS` below (between the brackets []).
 * 5. Run `checkForUpdates`.
 * 6. It will print ONLY the new songs found, with IDs continuing from your last ID (e.g. 150 -> 151, 152).
 */

var FOLDER_ID = "1XBC9i0OGJqAUwF4q8Z8wCUGgYIYsS8jj"; // Your Drive Folder ID

// --- PASTE YOUR CURRENT SONGS.JSON CONTENT HERE ---
var EXISTING_SONGS = [
    // Paste content here, e.g.:
    // { "id": "1", "title": "...", ... },
];
// --------------------------------------------------

function checkForUpdates() {
    var knownPdfIds = [];
    var knownAudioIds = [];
    var knownTitles = [];
    var maxId = 0;

    // 1. Index existing IDs and find Max ID
    for (var i = 0; i < EXISTING_SONGS.length; i++) {
        var s = EXISTING_SONGS[i];
        if (s.driveIdPdf) knownPdfIds.push(s.driveIdPdf);
        if (s.driveIdAudio) knownAudioIds.push(s.driveIdAudio);
        if (s.title) knownTitles.push(s.title.toLowerCase().trim());

        // Parse ID to find max
        var currentId = parseInt(s.id, 10);
        if (!isNaN(currentId) && currentId > maxId) {
            maxId = currentId;
        }
    }

    Logger.log("Analyzed " + EXISTING_SONGS.length + " existing songs.");
    Logger.log("Max ID found: " + maxId);
    Logger.log("Next ID will start from: " + (maxId + 1));

    // 2. Scan Drive
    var foundMap = {};
    try {
        var rootFolder = DriveApp.getFolderById(FOLDER_ID);
        // We pass maxId as an object so it can be incremented by reference logic or returned? 
        // Actually best to create a list of *new* items first, then assign IDs.
        var newFilesFlat = [];
        scanFolder(rootFolder, newFilesFlat, knownPdfIds, knownAudioIds);

        // Process files into songs
        var nextId = maxId + 1;
        var newItemsMap = {};

        for (var i = 0; i < newFilesFlat.length; i++) {
            var file = newFilesFlat[i]; // {name, id, mime}

            // Normalize Name
            var fileName = file.name;
            var dotIndex = fileName.lastIndexOf('.');
            var baseName = dotIndex > -1 ? fileName.substring(0, dotIndex) : fileName;
            var key = baseName.trim().toLowerCase();
            key = key.replace(/\(\d+\)$/, "").trim(); // Remove (1), (2)

            // Check if title already exists in songs.json (Title dup check)
            if (knownTitles.indexOf(key) > -1) {
                // Already have this song by title, maybe different file ID?
                // Logic: If it wasn't in knownPdfIds, but title exists, it's an update to an existing song?
                // This script is "checkForUpdates" (New Items). 
                // If the user wants to FILL missing IDs for existing songs, that's different.
                // Assuming this is for COMPLETELY NEW songs.
                continue;
            }

            if (!newItemsMap[key]) {
                newItemsMap[key] = {
                    id: String(nextId++), // Assign next ID
                    title: baseName,
                    composer: "Unknown",
                    category: "General",
                    driveIdPdf: "",
                    driveIdAudio: ""
                };

                if (baseName.includes("-")) {
                    var parts = baseName.split("-");
                    newItemsMap[key].title = parts[0].trim();
                    newItemsMap[key].composer = parts[1].trim();
                }
            }

            var type = file.mime;
            if (type === "application/pdf" || type.includes("image")) {
                newItemsMap[key].driveIdPdf = file.id;
            } else if (type.includes("audio") || type === "video/mp4") {
                newItemsMap[key].driveIdAudio = file.id;
            }
        }

        // Convert map to list
        var newItems = [];
        for (var k in newItemsMap) {
            newItems.push(newItemsMap[k]);
        }

        if (newItems.length === 0) {
            Logger.log("✅ No new files found.");
            return;
        }

        Logger.log("🚨 Found " + newItems.length + " NEW items. Copy below:");
        Logger.log(JSON.stringify(newItems, null, 2));

    } catch (e) {
        Logger.log("ERROR: " + e.toString());
    }
}

function scanFolder(folder, list, knownPdf, knownAudio) {
    var files = folder.getFiles();
    while (files.hasNext()) {
        var file = files.next();
        var id = file.getId();

        // Skip known files
        if (knownPdf.indexOf(id) > -1 || knownAudio.indexOf(id) > -1) continue;

        var mime = file.getMimeType();
        var isAudio = mime.includes("audio") || mime === "video/mp4";
        var isVisual = mime === "application/pdf" || mime.includes("image");

        if (isAudio || isVisual) {
            list.push({
                name: file.getName(),
                id: id,
                mime: mime
            });
        }
    }

    var subs = folder.getFolders();
    while (subs.hasNext()) {
        scanFolder(subs.next(), list, knownPdf, knownAudio);
    }
}
