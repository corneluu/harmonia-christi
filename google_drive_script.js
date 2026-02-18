/**
 * HARMONIA CHRISTI - SONG JSON GENERATOR (SEQUENTIAL IDs)
 * =======================================================
 * 
 * INSTRUCTIONS:
 * 1. Replace ALL code with this version.
 * 2. Run `generateSongJson`.
 * 3. Copy the output chunks from the Log.
 * 4. This will generate a FRESH list with IDs 1, 2, 3...
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

        // RE-ASSIGN IDs SEQUENTIALLY AFTER SORTING
        // This ensures ID 1 is the first alphabetical song, etc.
        for (var i = 0; i < songList.length; i++) {
            songList[i].id = String(i + 1);
        }

        var fullJson = JSON.stringify(songList, null, 2);

        var chunkSize = 4000;
        var totalLength = fullJson.length;
        var chunks = Math.ceil(totalLength / chunkSize);

        Logger.log("Found " + songList.length + " items. IDs assigned 1 to " + songList.length + ".");
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
            id: "TEMP", // Will be re-assigned after sorting
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
        if (!map[key].driveIdPdf) {
            map[key].driveIdPdf = fileId;
        }
    } else if (isAudio) {
        map[key].driveIdAudio = fileId;
    }
}
