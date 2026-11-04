let logicalQuestions = JSON.parse(localStorage.getItem('logicalQuestions')) || [
    // Эгер база бош болсо, дефолт катары категорияларга бөлүнгөн мисал суроолор
    { question: "Анын үч көзү бар, бирок башы жок...", answer: "Светофор", category: "school_1_4" },
    { question: "Дүйнөдөгү эң биринчи компьютердик вирус кандай аталган?", answer: "Creeper", category: "school_9_11" },
    { question: "Космосто жүргөн космонавттардын бою канча см өзгөрөт?", answer: "5 см", category: "university" },
    { question: "Кванттык физиканын негизги мыйзамы эмнени түшүндүрөт?", answer: "Энергиянын квантталышын", category: "expert" }
];

let currentSortMode = 'question'; 
let currentCategory = 'all';     
let activeLetter = null;
let activeSearchQuery = "";
let countdownTimers = {};

document.addEventListener("DOMContentLoaded", () => {
    initControlBar();
    initLiveClock(); // Сайттын бурчуна саат кошуу
    renderQuestions();
});

// 1. Башкаруу тилкеси жана деңгээлдер
function initControlBar() {
    const bar = document.getElementById("alphabetBar");
    if (!bar) return;

    bar.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; width: 100%; position: relative;">
            <!-- «Баары» баскычы -->
            <button class="alpha-btn active" id="btnShowAll" onclick="resetAllFilters()" style="width: auto; padding: 8px 16px;">Баары</button>
            
            <!-- Сорттоо режими -->
            <button class="btn btn-secondary" id="btnSortMode" onclick="toggleSortMode()" style="font-size: 0.85rem; padding: 8px 14px;">
                🔀 Сорттоо: Суроо боюнча
            </button>

            <!-- Деңгээлдер жана Категориялар Dropdown -->
            <div style="position: relative; display: inline-block;">
                <button class="btn btn-secondary" onclick="toggleDropdown('categoryDropdown')" style="font-size: 0.85rem; padding: 8px 14px;">
                    🎓 Деңгээлдер ▼
                </button>
                <div id="categoryDropdown" class="custom-dropdown-menu" style="display: none;">
                    <div onclick="selectCategory('all', 'Бардык деңгээлдер')">🌐 Бардык суроолор</div>
                    <div onclick="selectCategory('school_1_4', '1-4 Класстар (Оңой)')">🟢 1-4 Класстар (Оңой)</div>
                    <div onclick="selectCategory('school_5_9', '5-9 Класстар (Орто)')">🟡 5-9 Класстар (Орто)</div>
                    <div onclick="selectCategory('school_9_11', '9-11 Класстар (Кыйын)')">🟠 9-11 Класстар (Кыйын)</div>
                    <div onclick="selectCategory('university', '1-4 Курстар (Студенттер)')">🔵 1-4 Курстар</div>
                    <div onclick="selectCategory('expert', 'Эксперттер үчүн (Эң кыйын)')">🔴 Эксперттер үчүн</div>
                </div>
            </div>

            <!-- Тамгалар Dropdown -->
            <div style="position: relative; display: inline-block;">
                <button class="btn btn-secondary" onclick="toggleDropdown('alphabetDropdown')" style="font-size: 0.85rem; padding: 8px 14px;">
                    🔤 Тамга ▼
                </button>
                <div id="alphabetDropdown" class="custom-dropdown-menu letters-grid" style="display: none; width: 300px; padding: 12px; gap: 6px; grid-template-columns: repeat(6, 1fr);"></div>
            </div>

            <!-- Издөө -->
            <div style="flex: 1; min-width: 180px;">
                <input type="text" id="searchInput" placeholder="🔍 Издөө..." oninput="onSearchInput(this.value)" style="width: 100%; padding: 8px 14px; border-radius: 8px; background: #1e293b; color: white; border: 1px solid rgba(255,255,255,0.1); outline: none; font-size: 0.9rem;">
            </div>

            <!-- Сайттын бурчундагы Жандуу Саат -->
            <div id="liveClockBadge" style="margin-left: auto; font-size: 0.85rem; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.2);">
                🕒 00:00:00
            </div>
        </div>

        <div id="activeFilterBadge" style="margin-top: 10px; font-size: 0.85rem; color: #94a3b8; display: none;"></div>
    `;

    // Тамгаларды толтуруу
    const alphabetDropdown = document.getElementById("alphabetDropdown");
    const letters = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ".split("");
    letters.forEach(letter => {
        const btn = document.createElement("button");
        btn.className = "alpha-btn";
        btn.style.width = "100%";
        btn.innerText = letter;
        btn.onclick = (e) => {
            e.stopPropagation();
            filterByLetter(letter);
            toggleDropdown('alphabetDropdown');
        };
        alphabetDropdown.appendChild(btn);
    });

    window.onclick = function(event) {
        if (!event.target.matches('.btn-secondary')) {
            document.querySelectorAll('.custom-dropdown-menu').forEach(el => el.style.display = 'none');
        }
    };
}

// 2. Жандуу Саат функциясы
function initLiveClock() {
    const clockEl = document.getElementById("liveClockBadge");
    if (!clockEl) return;

    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        clockEl.innerHTML = `🕒 ${timeString}`;
    }, 1000);
}

// Dropdown ачуу/жабуу
function toggleDropdown(id) {
    const el = document.getElementById(id);
    const isOpen = el.style.display === 'flex' || el.style.display === 'grid';
    document.querySelectorAll('.custom-dropdown-menu').forEach(m => m.style.display = 'none');
    if (!isOpen) {
        el.style.display = id === 'alphabetDropdown' ? 'grid' : 'flex';
    }
}

// Сорттоо режимин өзгөртүү (Суроо / Жооп)
function toggleSortMode() {
    if (currentSortMode === 'question') {
        currentSortMode = 'answer';
        document.getElementById("btnSortMode").innerText = "🔀 Сорттоо: Жооп боюнча";
    } else {
        currentSortMode = 'question';
        document.getElementById("btnSortMode").innerText = "🔀 Сорттоо: Суроо боюнча";
    }
    renderQuestions();
}

// Категория тандоо
function selectCategory(catKey, catLabel) {
    currentCategory = catKey;
    updateBadge(`Деңгээл: ${catLabel}`);
    renderQuestions();
}

function filterByLetter(letter) {
    activeLetter = letter;
    updateBadge(`Тамга: ${letter}`);
    renderQuestions();
}

function onSearchInput(val) {
    activeSearchQuery = val.toLowerCase().trim();
    renderQuestions();
}

function resetAllFilters() {
    activeLetter = null;
    currentCategory = 'all';
    activeSearchQuery = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("activeFilterBadge").style.display = "none";
    renderQuestions();
}

function updateBadge(text) {
    const badge = document.getElementById("activeFilterBadge");
    if (badge) {
        badge.style.display = "block";
        badge.innerHTML = `Фильтр: <b style="color: #6366f1;">${text}</b> <span onclick="resetAllFilters()" style="cursor:pointer; color:#ef4444; margin-left:8px;">[Тазалоо ✖]</span>`;
    }
}

// 3. Суроолорду категорияга жана тандалган сорттоого карата экранга чыгаруу
function renderQuestions() {
    const display = document.getElementById("alphabetDisplay");
    if (!display) return;

    let list = [...logicalQuestions];

    // Категория боюнча фильтрлөө (Эгер суроодо категория жок болсо, автоматтык түрдө school_1_4 же баарына кошулат)
    if (currentCategory !== 'all') {
        list = list.filter(q => q.category === currentCategory || (!q.category && currentCategory === 'school_1_4'));
    }

    // Тамга боюнча фильтрлөө
    if (activeLetter) {
        list = list.filter(q => {
            let target = currentSortMode === 'question' ? q.question : q.answer;
            return target.toUpperCase().startsWith(activeLetter);
        });
    }

    // Издөө
    if (activeSearchQuery !== "") {
        list = list.filter(q => 
            q.question.toLowerCase().includes(activeSearchQuery) || 
            q.answer.toLowerCase().includes(activeSearchQuery)
        );
    }

    // Сорттоо (Суроо же Жооп боюнча алфавиттик)
    list.sort((a, b) => {
        let textA = currentSortMode === 'question' ? a.question : a.answer;
        let textB = currentSortMode === 'question' ? b.question : b.answer;
        return textA.localeCompare(textB);
    });

    if (list.length === 0) {
        display.innerHTML = `
            <div style="text-align: center; padding: 40px; background: rgba(30,41,59,0.3); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                <h3 style="color: #f8fafc; margin-bottom: 8px;">Бул категорияда азырынча суроолор жок</h3>
                <p style="color: #94a3b8; font-size: 0.9rem;">Башка деңгээлди тандап же админ панелден кошуп коюңуз.</p>
            </div>
        `;
        return;
    }

    let html = "";
    list.forEach((item, idx) => {
        let firstLetter = currentSortMode === 'question' ? item.question.charAt(0).toUpperCase() : item.answer.charAt(0).toUpperCase();
        
        html += `
            <div class="daily-quiz-card" style="margin-bottom: 20px; text-align: left; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="card-badge">❓ СУРОО #${idx + 1} (${firstLetter} тамгасы)</div>
                    <div id="timerBadge_${idx}" style="display: none; font-size: 0.85rem; font-weight: 700; color: #f59e0b; background: rgba(245, 158, 11, 0.15); padding: 4px 10px; border-radius: 20px;">
                        ⏳ 30с
                    </div>
                </div>

                <h3 class="quiz-question" style="font-size: 1.1rem; margin: 15px 0; color: #f8fafc;">${item.question}</h3>
                
                <div class="quiz-answer-blur" id="blurCard_${idx}" onclick="toggleAnswer(${idx}, '${escapeHtml(item.answer)}')" style="cursor: pointer;">
                    <span class="blur-text" id="blurText_${idx}">👁️ Жоопту көрүү үчүн басыңыз</span>
                </div>
            </div>
        `;
    });

    display.innerHTML = html;
}

// Жоопту ачуу жана 30 секунддук таймер
function toggleAnswer(index, fullAnswer) {
    const blurBox = document.getElementById(`blurCard_${index}`);
    const blurText = document.getElementById(`blurText_${index}`);
    const timerBadge = document.getElementById(`timerBadge_${index}`);

    if (!blurBox) return;

    if (countdownTimers[index]) {
        clearInterval(countdownTimers[index].interval);
        delete countdownTimers[index];
    }

    if (blurBox.classList.contains("revealed")) {
        blurBox.classList.remove("revealed");
        blurText.innerHTML = "👁️ Жоопту көрүү үчүн басыңыз";
        if(timerBadge) timerBadge.style.display = "none";
    } else {
        blurBox.classList.add("revealed");
        blurText.innerHTML = `<b>Жооп:</b> ${fullAnswer}`;
        
        let timeLeft = 30;
        if(timerBadge) {
            timerBadge.style.display = "inline-block";
            timerBadge.innerText = `⏳ ${timeLeft}с`;
        }

        let interval = setInterval(() => {
            timeLeft--;
            if(timerBadge) timerBadge.innerText = `⏳ ${timeLeft}с`;

            if (timeLeft <= 0) {
                clearInterval(interval);
                blurBox.classList.remove("revealed");
                blurText.innerHTML = "👁️ Жоопту көрүү үчүн басыңыз";
                if(timerBadge) timerBadge.style.display = "none";
                delete countdownTimers[index];
            }
        }, 1000);

        countdownTimers[index] = { interval: interval };
    }
}

function escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}