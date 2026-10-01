// NOIRSON Mix 資料
// 每一筆資料代表一部 Mix，之後 Music Detail 會依照網址的 id 讀取對應內容。

const mixes = {
    M001: {
        title: "Somewhere far from everyone",
        series: "Main Album / Chill Vibe",
        cover: "images/00.png",
        audio: "music/01.mp3",
        gallery: [
            "images/01.png",
            "images/02.png",
            "images/03.png",
            "images/07.png",
            "images/08.png",
            "images/10.png",
            "images/14.png"
        ],
        description: 
            `Drifting in the evening sea breeze, where thoughts intertwine with the rhythm of the waves and music.

             A collection of unfinished beats from the past, reimagined and reshaped into a new groove-filled, soulful journey.`,

        youtube: "https://youtu.be/Ev5VGcJDWQs?si=FHmQCpH8gId8BtsP"
    },

    M002: {
        title: "Train to Nowhere",
        series: "Chill / Lofi / Jazz",
        cover: "images/16.png",
        audio: "music/02.mp3",
        gallery: [
            "images/01.png",
            "images/03.png",
            "images/04.png",
            "images/05.png",
            "images/10.png",
            "images/12.png",
            "images/13.png",
            "images/15.png"
        ],
        description: 
            `A calm Chill Jazz Hop mix for early mornings — a quiet train moving toward nowhere,

             letting the music pull your mind away from everything.

             Soft drums, warm jazz chords, and light rain ambience blend into a wide, breathable daytime vibe.`,

        youtube: "https://youtu.be/RhC5WEjfyzA?si=1tl7Net8d7WUIjtD"
    },

    M003: {
        title: "Still Awake Above the City",
        series: "Chill / Lofi / Jazz",
        cover: "images/10.png",
        audio: "music/03.mp3",
        gallery: [
            "images/01.png",
            "images/03.png",
            "images/04.png",
            "images/05.png",
            "images/12.png",
            "images/13.png",
            "images/15.png",
            "images/16.png"
        ],
        description: 
            `Somewhere above the city, still raining. Lights flicker through the mist, windows still glowing, streets quietly alive below. 

             Sit back, headphones on, letting the night pass without needing to rush anywhere.`,

        youtube: "https://youtu.be/OtMjs8U9fnQ?si=K6DL2KBrMCdYXATf"
    },

    M004: {
        title: "Quieter thoughts",
        series: "Chill / Lofi / Jazz",
        cover: "images/01.png",
        audio: "music/04.mp3",
        gallery: [
            "images/01.png",
            "images/03.png",
            "images/04.png",
            "images/05.png",
            "images/10.png",
            "images/12.png",
            "images/13.png",
            "images/15.png",
            "images/16.png"
        ],
        description: 
            `A late-night journey through groove, warmth, and silence. This mix starts with smooth jazzy grooves and head-nodding rhythms, 

             slowly drifting into warm lofi textures and sleepy late-night ambience.` ,

        youtube: "https://youtu.be/5Gh2PNsqhEU?si=u3VtTq9-HjAW0kxY"
    },

    M005: {
        title: "Don't know which way to go",
        series: "Midnight Jersey",
        cover: "images/07.png",
        audio: "music/05.mp3",
        gallery: [
            "images/06.png"
        ],
        description: 
            `NOIRSON RADIO presents a chill mix 🌃 blending midnight jersey, urban rain lounge,

             ambient trap garage, chill electronic, and atmospheric night drive vibes.`,

        youtube: "https://youtu.be/wcY82PJDVoU?si=FC7W6lh_c3rhSkjk"
    },

    M006: {
        title: "After the Rain",
        series: "Ethereal Trap / Cloud Trap",
        cover: "images/08.png",
        audio: "music/06.mp3",
        gallery: [
            "images/02.png",
            "images/11.png",
            "images/14.png"
        ],
        description: 
            `No sleep. Just vibes.
             
             A mix for slow mornings after the rain. The city is quiet, the air is fresh,

             and everything feels a little lighter. Sit back, breathe, and let the fog drift.`,

        youtube: "https://youtu.be/h1QDKb8Vwq0?si=IwX28DP95t7b2L_E"
    },

    M007: {
        title: "Stay Floating",
        series: "Ethereal Trap / Cloud Trap",
        cover: "images/11.png",
        audio: "music/07.mp3",
        gallery: [
            "images/02.png",
            "images/08.png",
            "images/14.png"
        ],
        description: 
            `A quiet journey above the clouds. Soft cloud-trap rhythms, dreamy melodies, warm pads, and floating energy.

             The highway drifts through misty skies as your thoughts fade into the distance.

             Perfect for night drives, creative sessions, chilling, studying, or getting lost in your own head.`,

        youtube: "https://youtu.be/6_7VAqd07Dk?si=slwy3J-nDMIw7Dng"
    },

    M008: {
        title: "Tokyo Slow Nights",
        series: "City Pop",
        cover: "images/09.png",
        audio: "music/08.mp3",
        gallery: [
            "images/04.png",
            "images/12.png"
        ],
        description:
            `Tokyo Slow Nights marks a new chapter — crafted while staying in the quiet winter streets of Tokyo.

             A blend of city pop, slow groove, mellow beats, and that soft neon glow only late-night Japan can give.

             Perfect for solo walks, late-night editing, coding, journaling, or zoning out in your own world.`,

        youtube: "https://youtu.be/gbvJuF5Hoyk?si=SAvDF0HZ6cp-REHh"
    }
};