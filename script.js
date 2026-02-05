// --- GÉNÉRATION DES QUESTIONS ---
function generateVerbQuestions() {
    const subjects = [
        { s: "Je", e1: "e", e2: "is", f: "ai", c: "ais" },
        { s: "Tu", e1: "es", e2: "is", f: "as", c: "ais" },
        { s: "Il/Elle", e1: "e", e2: "it", f: "a", c: "ait" },
        { s: "Nous", e1: "ons", e2: "issons", f: "ons", c: "ions" },
        { s: "Vous", e1: "ez", e2: "issez", f: "ez", c: "iez" },
        { s: "Ils/Elles", e1: "ent", e2: "issent", f: "ont", c: "aient" }
    ];

    const v1 = ["marcher", "chanter", "manger", "lancer", "jouer", "regarder", "aider", "arriver", "chercher", "écouter"];
    const v2 = ["finir", "choisir", "bondir", "réussir", "grandir", "réfléchir", "punir", "remplir", "obéir", "bâtir"];

    const evalPresent = [];
    for(let i=0; i<30; i++) {
        const isGroup1 = Math.random() > 0.5;
        const verb = isGroup1 ? v1[i % v1.length] : v2[i % v2.length];
        const sub = subjects[Math.floor(Math.random() * subjects.length)];
        const rad = verb.slice(0, -2);
        const correct = isGroup1 ? rad + sub.e1 : rad + sub.e2;
        evalPresent.push({
            q: `${sub.s} (${verb}) au présent.`,
            options: shuffle([correct, rad + "er", rad + "ant", rad + (isGroup1 ? "ez" : "it")]),
            correct: correct
        });
    }

    const futur = [];
    const conditionnel = [];
    const allVerbs = [...v1, ...v2, "être", "avoir", "aller", "prendre"];
    for(let i=0; i<50; i++) {
        const verb = allVerbs[i % allVerbs.length];
        const sub = subjects[Math.floor(Math.random() * subjects.length)];
        let base = verb;
        if(verb === "être") base = "ser";
        else if(verb === "avoir") base = "aur";
        else if(verb === "aller") base = "ir";
        else if(verb === "prendre") base = "prendr";
        
        const fCorrect = (verb.length > 3 && !["être","avoir","aller","prendre"].includes(verb)) ? verb + sub.f : base + sub.f;
        const cCorrect = (verb.length > 3 && !["être","avoir","aller","prendre"].includes(verb)) ? verb + sub.c : base + sub.c;

        futur.push({ q: `Futur : ${sub.s} (${verb})`, options: shuffle([fCorrect, verb + "ait", base + "ons"]), correct: fCorrect });
        conditionnel.push({ q: `Conditionnel : ${sub.s} (${verb})`, options: shuffle([cCorrect, verb + "ai", base + "ez"]), correct: cCorrect });
    }
    return { evalPresent, futur, conditionnel };
}

function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

// --- VARIABLES ÉTAT ---
const verbData = generateVerbQuestions();
const allQuizzes = {
    present: verbData.evalPresent,
    futur: verbData.futur,
    conditionnel: verbData.conditionnel,
    calcul: []
};

// Génération 100 calculs
for(let i=0; i<100; i++) {
    const n1 = Math.floor(Math.random() * 100), n2 = Math.floor(Math.random() * 100);
    allQuizzes.calcul.push({ q: `${n1} + ${n2} = ?`, options: shuffle([n1+n2, n1+n2+5, n1+n2-2]), correct: n1+n2 });
}

let currentQuiz = [], currentKey = '', currentIdx = 0, isEval = false, studentName = "", timerInterval, timeLeft = 1800, historyStack = ['home'];

// --- NAVIGATION ---
function navigateTo(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden-section'));
    document.getElementById(id).classList.remove('hidden-section');
    if(historyStack[historyStack.length-1] !== id) historyStack.push(id);
    window.scrollTo(0,0);
}

function goBack() { if(historyStack.length > 1) { historyStack.pop(); navigateTo(historyStack[historyStack.length-1]); } }

// --- LOGIQUE QUIZ ---
function checkAndStartEval() {
    const input = document.getElementById('student-name');
    if(!input.value.trim()) { alert("⚠️ Identification requise !"); return; }
    studentName = input.value; startQuiz('present', true);
}

function startQuiz(key, evalMode = false) {
    currentKey = key; currentQuiz = allQuizzes[key]; currentIdx = 0; isEval = evalMode;
    document.getElementById('quiz-title-display').innerText = key.toUpperCase();
    if(isEval) {
        timeLeft = 1800; document.getElementById('timer-container').classList.remove('hidden');
        timerInterval = setInterval(() => {
            timeLeft--; let m = Math.floor(timeLeft/60), s = timeLeft%60;
            document.getElementById('timer-display').innerText = `${m}:${s<10?'0':''}${s}`;
            if(timeLeft <= 0) handleFinish();
        }, 1000);
    } else { clearInterval(timerInterval); document.getElementById('timer-container').classList.add('hidden'); }
    loadQuestion(); navigateTo('quiz-player');
}

function loadQuestion() {
    const q = currentQuiz[currentIdx];
    document.getElementById('question-count').innerText = `${currentIdx + 1} / ${currentQuiz.length}`;
    document.getElementById('question-text').innerText = q.q;
    const cont = document.getElementById('options-container');
    const valContainer = document.getElementById('validate-container');
    cont.innerHTML = '';
    valContainer.classList.toggle('hidden', isEval || q.validated);

    q.options.forEach(opt => {
        const b = document.createElement('button');
        b.className = "option-btn font-bold";
        b.innerText = opt;
        if(q.validated) {
            b.classList.add('disabled');
            if(opt == q.correct) b.classList.add('correct');
            else if(opt == q.userAnswer) b.classList.add('wrong');
        } else if(q.userAnswer == opt) b.classList.add('selected');
        
        b.onclick = () => { if(!q.validated) { q.userAnswer = opt; updateProgressDisplay(currentKey); loadQuestion(); renderSidebar(); } };
        cont.appendChild(b);
    });
    document.getElementById('next-btn').classList.toggle('hidden', currentIdx === currentQuiz.length - 1);
    document.getElementById('finish-btn').classList.toggle('hidden', !isEval || currentIdx !== currentQuiz.length - 1);
    renderSidebar();
}

function validateAnswer() {
    const q = currentQuiz[currentIdx];
    if(!q.userAnswer) return;
    q.validated = true; updateProgressDisplay(currentKey); loadQuestion();
}

function handleFinish() {
    clearInterval(timerInterval);
    let score = 0; currentQuiz.forEach(q => { if(q.userAnswer == q.correct) score++; });
    document.getElementById('result-student-name').innerText = studentName;
    document.getElementById('final-score').innerText = `${score} / ${currentQuiz.length}`;
    if(isEval) saveToLeaderboard(studentName, score, currentQuiz.length);
    updateLeaderboardDisplay(); navigateTo('results-screen');
}

function updateProgressDisplay(key) {
    const qList = allQuizzes[key];
    const answered = qList.filter(q => q.userAnswer !== undefined).length;
    const percent = Math.round((answered / qList.length) * 100);
    const badge = document.getElementById(`prog-${key}`);
    if(badge) badge.innerText = `${percent}%`;
}

function renderSidebar() {
    document.getElementById('question-sidebar').innerHTML = currentQuiz.map((q, i) => {
        let s = q.userAnswer !== undefined ? 'answered' : '';
        return `<div class="q-dot ${s} ${i===currentIdx?'active':''}" onclick="goTo(${i})">${i+1}</div>`;
    }).join('');
}

function goTo(i) { currentIdx = i; loadQuestion(); }
function nextQuestion() { if(currentIdx < currentQuiz.length-1) { currentIdx++; loadQuestion(); } }
function prevQuestion() { if(currentIdx > 0) { currentIdx--; loadQuestion(); } }

// --- CLASSEMENT ---
function saveToLeaderboard(name, score, total) {
    let lb = JSON.parse(localStorage.getItem('essor_lb') || '[]');
    lb.push({ name, score, total }); lb.sort((a,b) => b.score - a.score);
    localStorage.setItem('essor_lb', JSON.stringify(lb.slice(0,10)));
}

function updateLeaderboardDisplay() {
    const lb = JSON.parse(localStorage.getItem('essor_lb') || '[]');
    document.getElementById('leaderboard-body').innerHTML = lb.map((e,i) => `
        <tr class="rank-item ${i===0?'top-rank':''}">
            <td class="py-4 px-2 text-center font-black">${i+1}</td>
            <td class="py-4 px-2 text-left font-bold uppercase text-[10px]">${e.name}</td>
            <td class="py-4 px-2 text-right gold-text font-black">${e.score}/${e.total}</td>
        </tr>`).join('');
}

window.onload = () => navigateTo('home');