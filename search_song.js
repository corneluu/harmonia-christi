
import fs from 'fs';
const songs = JSON.parse(fs.readFileSync('src/data/songs.json', 'utf8'));

const query = process.argv[2] || '';
console.log(`Searching for "${query}"...`);

songs.forEach(s => {
    if (s.title.toLowerCase().includes(query.toLowerCase())) {
        console.log(`Found: [${s.id}] ${s.title}`);
    }
});
