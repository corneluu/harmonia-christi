/**
 * HARMONIA CHRISTI - SONG JSON GENERATOR (IMAGES SUPPORT)
 * =======================================================
 * 
 * VERSION 5: Now includes PHOTOS (jpg, png) as sheet music.
 * 
 * INSTRUCTIONS:
 * 1. Replace ALL code with this version.
 * 2. Run `generateSongJson`.
 * 3. Copy the output chunks from the Log.
 */

function generateSongJson() {
    // --- CONFIGURATION ---
    var FOLDER_ID = "1XBC9i0OGJqAUwF4q8Z8wCUGgYIYsS8jj";
    // ---------------------

    var songsMap = {};

    try {
        var rootFolder = DriveApp.getFolderById(FOLDER_ID);
        processFolder(rootFolder, songsMap);

        // Convert map to array
        var songList = [];
        for (var key in songsMap) {
            songList.push(songsMap[key]);
        }

        // Sort alphabetically by title
        songList.sort(function (a, b) {
            return a.title.localeCompare(b.title);
        });

        var fullJson = JSON.stringify(songList, null, 2);

        var chunkSize = 4000;
        var totalLength = fullJson.length;
        var chunks = Math.ceil(totalLength / chunkSize);

        Logger.log("Found " + songList.length + " items (Audio + Photos). Printing in " + chunks + " parts.");
        Logger.log("--- START COPYING BELOW ---");

        for (var i = 0; i < chunks; i++) {
            var start = i * chunkSize;
            var end = Math.min(start + chunkSize, totalLength);
            Logger.log(fullJson.substring(start, end));
        }

        Logger.log("--- END COPYING ---");

    } catch (e) {
        Logger.log("ERROR: " + e.toString());
    }
}

function processFolder(folder, map) {
    var files = folder.getFiles();
    while (files.hasNext()) {
        var file = files.next();
        processFile(file, map);
    }

    var subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
        var subfolder = subfolders.next();
        processFolder(subfolder, map);
    }
}

function processFile(file, map) {
    var fileName = file.getName();
    var mimeType = file.getMimeType();
    var fileId = file.getId();

    // SUPPORTED TYPES: PDF, Audio, Video, AND NOW IMAGES (JPG, PNG, HEIC)
    var isAudio = mimeType.includes("audio") || mimeType === "video/mp4";
    var isVisual = mimeType === "application/pdf" || mimeType.includes("image");

    if (!isAudio && !isVisual) {
        return;
    }

    var dotIndex = fileName.lastIndexOf('.');
    var baseName = dotIndex > -1 ? fileName.substring(0, dotIndex) : fileName;
    var key = baseName.trim().toLowerCase();

    key = key.replace(/\(\d+\)$/, "").trim();

    if (!map[key]) {
        map[key] = {
            id: Math.random().toString(36).substr(2, 9),
            title: baseName,
            composer: "Unknown",
            category: "General",
            driveIdPdf: "", // Will hold PDF or Image ID
            driveIdAudio: ""
        };

        if (baseName.includes("-")) {
            var parts = baseName.split("-");
            map[key].title = parts[0].trim();
            map[key].composer = parts[1].trim();
        }
    }

    if (isVisual) {
        // If multiple images exist for the same song, this might overwrite. 
        // Ideally we'd have a list, but the UI expects one link. We'll take the first one we see.
        // If it's already set and this is a PDF, prefer PDF?
        // For now, simple assignment.
        if (!map[key].driveIdPdf) {
            map[key].driveIdPdf = fileId;
        }
    } else if (isAudio) {
        map[key].driveIdAudio = fileId;
    }
}
