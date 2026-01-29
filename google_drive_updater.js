
/**
 * HARMONIA CHRISTI - UPDATE CHECKER
 * =================================
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Apps Script editor (extensions > Apps Script).
 * 2. Create a new file or replace the old one.
 * 3. COPY the content of your `songs.json` file.
 * 4. PASTE it inside the variable `EXISTING_SONGS` below (between the brackets []).
 * 5. Run `checkForUpdates`.
 * 6. It will print ONLY the new songs found.
 */

var FOLDER_ID = "1XBC9i0OGJqAUwF4q8Z8wCUGgYIYsS8jj"; // Your Drive Folder ID

// --- PASTE YOUR CURRENT SONGS.JSON CONTENT HERE ---
var EXISTING_SONGS = [
    // Paste content here, e.g.:
    // { "id": "...", "baseName": "...", "driveIdPdf": "...", ... },
];
// --------------------------------------------------

function checkForUpdates() {
    var knownPdfIds = [];
    var knownAudioIds = [];

    // 1. Index existing IDs
    for (var i = 0; i < EXISTING_SONGS.length; i++) {
        var s = EXISTING_SONGS[i];
        if (s.driveIdPdf) knownPdfIds.push(s.driveIdPdf);
        if (s.driveIdAudio) knownAudioIds.push(s.driveIdAudio);
    }

    Logger.log("Analyzed " + EXISTING_SONGS.length + " existing songs.");
    Logger.log("Known PDFs: " + knownPdfIds.length);
    Logger.log("Known Audio: " + knownAudioIds.length);

    // 2. Scan Drive like before
    var foundMap = {};
    try {
        var rootFolder = DriveApp.getFolderById(FOLDER_ID);
        scanFolder(rootFolder, foundMap, knownPdfIds, knownAudioIds);

        // 3. Convert map to list
        var newItems = [];
        for (var key in foundMap) {
            newItems.push(foundMap[key]);
        }

        if (newItems.length === 0) {
            Logger.log("✅ No new files found.");
            return;
        }

        Logger.log("🚨 Found " + newItems.length + " NEW items. Copy below:");
        Logger.log("--- START NEW DATA ---");
        Logger.log(JSON.stringify(newItems, null, 2));
        Logger.log("--- END NEW DATA ---");

    } catch (e) {
        Logger.log("ERROR: " + e.toString());
    }
}

function scanFolder(folder, map, knownPdf, knownAudio) {
    var files = folder.getFiles();
    while (files.hasNext()) {
        var file = files.next();
        checkFile(file, map, knownPdf, knownAudio);
    }

    var subs = folder.getFolders();
    while (subs.hasNext()) {
        scanFolder(subs.next(), map, knownPdf, knownAudio);
    }
}

function checkFile(file, map, knownPdf, knownAudio) {
    var id = file.getId();

    // If we already have this file in our system, SKIP IT completely.
    if (knownPdf.indexOf(id) > -1 || knownAudio.indexOf(id) > -1) {
        return;
    }

    // If logic reaches here, this is a NEW file (or at least a file ID we don't track).

    var fileName = file.getName();
    var mime = file.getMimeType();
    var isAudio = mime.includes("audio") || mime === "video/mp4";
    var isVisual = mime === "application/pdf" || mime.includes("image");

    if (!isAudio && !isVisual) return;

    // Grouping Logic
    var dotIndex = fileName.lastIndexOf('.');
    var baseName = dotIndex > -1 ? fileName.substring(0, dotIndex) : fileName;
    var key = baseName.trim().toLowerCase();

    // Clean key
    key = key.replace(/\(\d+\)$/, "").trim();

    if (!map[key]) {
        map[key] = {
            id: Math.random().toString(36).substr(2, 9),
            title: baseName,
            composer: "Unknown",
            category: "General",
            driveIdPdf: "",
            driveIdAudio: ""
        };

        if (baseName.includes("-")) {
            var parts = baseName.split("-");
            map[key].title = parts[0].trim();
            map[key].composer = parts[1].trim();
        }
    }

    if (isVisual) {
        map[key].driveIdPdf = id;
    } else if (isAudio) {
        map[key].driveIdAudio = id;
    }
}
