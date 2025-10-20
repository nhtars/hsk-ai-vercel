const OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxx"; // 🟢 Dán API key của bạn
const HSK_BASE = "https://raw.githubusercontent.com/nhtars/hsk-dataset/main/data";

let level = 1;

document.getElementById("start").onclick = async () => {
  level = document.getElementById("level").value;
  const chat = document.getElementById("chat");
  chat.innerHTML = "";
  addMsg("ai", `Chúng ta bắt đầu luyện nói HSK ${level}!`);
  const msg = await chatWithAI("Xin chào! Hôm nay chúng ta học gì?");
  addMsg("ai", msg);
};

async function chatWithAI(message) {
  const vocab = await loadHSK(level);
  const sys = `Bạn là giáo viên tiếng Trung. 
  Chỉ dùng từ HSK 1 đến ${level}.
  Tạo câu hỏi tự nhiên, có cấu trúc đầy đủ (không chỉ “có/không”).
  Luôn trả bằng tiếng Trung.`;
  
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: message }
      ]
    })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

async function loadHSK(level) {
  let all = [];
  for (let i = 1; i <= level; i++) {
    const res = await fetch(`${HSK_BASE}/hsk${i}.json`);
    const j = await res.json();
    all = all.concat(j.map(w => w.simplified));
  }
  return all;
}

function addMsg(role, text) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerHTML = `<span class="hanzi">${text}</span>
    <div class="pinyin">${pinyinPro.pinyin(text, {toneType:'mark'})}</div>
    <div class="translation">(${text})</div>`;
  div.onclick = () => {
    const py = div.querySelector(".pinyin");
    const tr = div.querySelector(".translation");
    const show = py.style.display === "block";
    py.style.display = show ? "none" : "block";
    tr.style.display = show ? "none" : "block";
  };
  document.getElementById("chat").appendChild(div);
}
