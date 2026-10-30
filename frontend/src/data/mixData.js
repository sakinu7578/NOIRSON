// NOIRSON Mix 資料
// 每一筆資料代表一部 Mix，之後 Music Detail 會依照網址的 id 讀取對應內容。

const mixes = {
    M001: {
        title: "Somewhere far from everyone",
        series: "Main Album / Chill Vibe",
        cover: "images/00.png",
        audio: "musicDemo/01-preview.mp3",
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
        descriptionZh: `遠離喧囂之地，無人打擾 ─── 漂泊在傍晚的海風裡，讓思緒隨浪潮與音樂交織。把過去未完成的節奏重新編曲，譜成一段充滿律動與靈魂的旅程。`,

        youtube: "https://youtu.be/Ev5VGcJDWQs?si=FHmQCpH8gId8BtsP"
    },

    M002: {
        title: "Train to Nowhere",
        series: "Chill / Lofi / Jazz",
        cover: "images/16.png",
        audio: "musicDemo/02-preview.mp3",
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
        descriptionZh: `無目的的地列車 ─── 適合清晨的 Chill Jazz Hop Mix。像一班安靜駛向遠方的列車，柔和鼓點、溫暖爵士和弦與細雨交融，帶你暫時離開日常。`,

        youtube: "https://youtu.be/RhC5WEjfyzA?si=1tl7Net8d7WUIjtD"
    },

    M003: {
        title: "Still Awake Above the City",
        series: "Chill / Lofi / Jazz",
        cover: "images/10.png",
        audio: "musicDemo/03-preview.mp3",
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
        descriptionZh: `城市上空，仍未入眠 ─── 城市上空仍下著雨，燈光在霧裡閃爍，街道安靜地延續著夜晚。戴上耳機坐一會，不必急著前往任何地方。`,

        youtube: "https://youtu.be/OtMjs8U9fnQ?si=K6DL2KBrMCdYXATf"
    },

    M004: {
        title: "Quieter thoughts",
        series: "Chill / Lofi / Jazz",
        cover: "images/01.png",
        audio: "musicDemo/04-preview.mp3",
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
        descriptionZh: `思緒漸靜 ─── 一段穿過律動、溫度與寂靜的深夜旅程。從流暢的爵士節奏出發，慢慢沉入溫暖的 Lofi 質感與昏昏欲睡的夜色。`,

        youtube: "https://youtu.be/5Gh2PNsqhEU?si=u3VtTq9-HjAW0kxY"
    },

    M005: {
        title: "Don't know which way to go",
        series: "Midnight Jersey",
        cover: "images/07.png",
        audio: "musicDemo/05-preview.mp3",
        gallery: [
            "images/06.png"
        ],
        description:
            `NOIRSON RADIO presents a chill mix 🌃 blending midnight jersey, urban rain lounge,

             ambient trap garage, chill electronic, and atmospheric night drive vibes.`,
        descriptionZh: `隨意漫遊 ─── 再公路某處休息一會，黃昏 Chill Mix，融合 Midnight Jersey、城市雨夜、Ambient Trap Garage、Chill Electronic 與夜間駕駛氛圍。`,

        youtube: "https://youtu.be/wcY82PJDVoU?si=FC7W6lh_c3rhSkjk"
    },

    M006: {
        title: "After the Rain",
        series: "Ethereal Trap / Cloud Trap",
        cover: "images/08.png",
        audio: "musicDemo/06-preview.mp3",
        gallery: [
            "images/02.png",
            "images/11.png",
            "images/14.png"
        ],
        description:
            `No sleep. Just vibes.
             
             A mix for slow mornings after the rain. The city is quiet, the air is fresh,

             and everything feels a little lighter. Sit back, breathe, and let the fog drift.`,
        descriptionZh: `雨後 ─── 不睡，只感受此刻。雨後的慢速清晨，城市安靜、空氣清新，一切都輕盈了一些。坐下來呼吸，讓霧緩緩飄遠。`,

        youtube: "https://youtu.be/h1QDKb8Vwq0?si=IwX28DP95t7b2L_E"
    },

    M007: {
        title: "Stay Floating",
        series: "Ethereal Trap / Cloud Trap",
        cover: "images/11.png",
        audio: "musicDemo/07-preview.mp3",
        gallery: [
            "images/02.png",
            "images/08.png",
            "images/14.png"
        ],
        description:
            `A quiet journey above the clouds. Soft cloud-trap rhythms, dreamy melodies, warm pads, and floating energy.

             The highway drifts through misty skies as your thoughts fade into the distance.

             Perfect for night drives, creative sessions, chilling, studying, or getting lost in your own head.`,
        descriptionZh: `保持漂浮 ─── 雲層之上的安靜旅程。柔和的 Cloud Trap 節奏、夢幻旋律與溫暖音色，適合夜間駕駛、創作、讀書，或只是沉浸在自己的思緒裡。`,

        youtube: "https://youtu.be/6_7VAqd07Dk?si=slwy3J-nDMIw7Dng"
    },

    M008: {
        title: "Tokyo Slow Nights",
        series: "City Pop",
        cover: "images/09.png",
        audio: "musicDemo/08-preview.mp3",
        gallery: [
            "images/04.png",
            "images/12.png"
        ],
        description:
            `Tokyo Slow Nights marks a new chapter — crafted while staying in the quiet winter streets of Tokyo.

             A blend of city pop, slow groove, mellow beats, and that soft neon glow only late-night Japan can give.

             Perfect for solo walks, late-night editing, coding, journaling, or zoning out in your own world.`,
        descriptionZh: `東京夜遊 ─── 東京安靜的冬日街頭，感受新的靈感。City Pop、慢速律動與柔和霓虹交織，陪伴獨自散步、深夜剪輯、寫程式或記錄心情。`,

        youtube: "https://youtu.be/gbvJuF5Hoyk?si=SAvDF0HZ6cp-REHh"
    }
};

export default mixes;
