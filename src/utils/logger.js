
// This is where you will paste your Discord Webhook URL.
// SECURITY WARNING: This URL is visible to anyone who knows how to inspect the website code.
// For a low-stakes choir website, this is usually acceptable, but do not use for sensitive data.
const WEBHOOK_URL = "https://discord.com/api/webhooks/1466219853990985893/Fku8E-ru_3r1EpCry7hGiR1PUzbJnpvg0tVgMn26pOS2QGzJJqx2aruN16l3t0qDVmu5";

export const logAccess = async (code, name = "Unknown") => {
    if (!WEBHOOK_URL) {
        console.warn("Discord Webhook URL not set. Logging disabled.");
        return;
    }

    const timestamp = new Date().toLocaleString('ro-RO');

    const message = {
        username: "Harmonia Christi Log",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png", // Generic music icon
        embeds: [
            {
                title: "🔐 Acces Nou",
                color: 5763719, // Green
                fields: [
                    {
                        name: "Membru",
                        value: `**${name}**`,
                        inline: true
                    },
                    {
                        name: "Cod Folosit",
                        value: `\`${code}\``,
                        inline: true
                    },
                    {
                        name: "Data și Ora",
                        value: timestamp,
                        inline: false
                    }
                ],
                footer: {
                    text: "Corneluu Security"
                }
            }
        ]
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    } catch (error) {
        console.error("Failed to log to Discord:", error);
    }
};

export const logFileOpen = async (songTitle, fileType) => {
    if (!WEBHOOK_URL) return;

    const timestamp = new Date().toLocaleString('ro-RO');

    const message = {
        username: "Harmonia Christi Files",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/2991/2991112.png",
        embeds: [
            {
                title: "📂 Fisier Deschis",
                color: 3447003, // Blue
                fields: [
                    {
                        name: "Piesa",
                        value: `**${songTitle}**`,
                        inline: true
                    },
                    {
                        name: "Tip",
                        value: `\`${fileType}\``,
                        inline: true
                    },
                    {
                        name: "Data",
                        value: timestamp,
                        inline: false
                    }
                ],
                footer: {
                    text: "Harmonia Christi Logger"
                }
            }
        ]
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });
    } catch (error) {
        console.error("Discord Log Error:", error);
    }
};
