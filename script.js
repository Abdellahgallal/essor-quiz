// --- GÉNÉRATION DES DONNÉES (250+ QUESTIONS) ---
function generateData() {
    const subjects = ["Je", "Tu", "Il/Elle", "Nous", "Vous", "Ils/Elles"];
    
    // Terminaisons Présent
    const tPres1 = ["e", "es", "e", "ons", "ez", "ent"];
    const tPres2 = ["is", "is", "it", "issons", "issez", "issent"];
    
    // Verbes 3ème groupe (Radicaux irréguliers)
    const v3Pres = [
        {v: "Prendre", r: ["prend", "prend", "prend", "pren", "pren", "prenn"], t: ["s", "s", "", "ons", "ez", "ent"]},
        {v: "Vouloir", r: ["veu", "veu", "veu", "voul", "voul", "veul"], t: ["x", "x", "t", "ons", "ez", "ent"]},
        {v: "Pouvoir", r: ["peu", "peu", "peu", "pouv", "pouv", "peuv"], t: ["x", "x", "t", "ons", "ez", "ent"]},
        {v: "Faire", r: ["fai", "fai", "fai", "fais", "fai", "fo"], t: ["s", "s", "t", "ons", "tes", "nt"]},
        {v: "Aller", r: ["vai", "va", "va", "all", "all", "vo"], t: ["s", "s", "", "ons", "ez", "nt"]}
    ];

    const res = { 
        evalV1V2: [], evalV3: [], // Évaluations (30Q chacune)
        futur: [], conditionnel: [], feelings: [], calcul: [] // Modules (250Q total)
    };

    // 1. GÉNÉRATION ÉVALUATION : PRÉSENT 1er & 2e GROUPE (30 Questions)
    const v1 = ["Chanter", "Marcher", "Aimer", "Jouer", "Porter"];
    const v2 = ["Finir", "Choisir", "Réussir", "Grandir", "Bâtir"];
    for(let i=0; i<30; i++) {
        const isV1 = i < 15;
        const verb = isV1 ? v1[i % 5] : v2[i % 5];
        const sIdx = i % 6;
        const correct = isV1 ? verb.slice(0, -2) + tPres1[sIdx] : verb.slice(0, -2) + tPres2[sIdx];
        res.evalV1V2.push({
            q: `${subjects[sIdx]} (${verb}) au présent de l'indicatif.`,
            options: shuffle([correct, verb + "er", correct + "s"]),
            correct: correct,
            exp: isV1 ? "1er groupe : -e, -es, -e, -ons, -ez, -ent" : "2e groupe : -is, -is, -it, -issons..."
        });
    }

    // 2. GÉNÉRATION ÉVALUATION : PRÉSENT 3e GROUPE (30 Questions)
    for(let i=0; i<30; i++) {
        const vObj = v3Pres[i % v3Pres.length];
        const sIdx = i % 6;
        const correct = vObj.r[sIdx] + vObj.t[sIdx];
        res.evalV3.push({
            q: `${subjects[sIdx]} (${vObj.v}) au présent de l'indicatif.`,
            options: shuffle([correct, vObj.v.toLowerCase(), "allait"]),
            correct: correct,
            exp: "Le 3ème groupe a souvent des radicaux irréguliers."
        });
    }

    // 3. MODULE FUTUR SIMPLE (50 Questions)
    const vFut = [{v:"Être",r:"ser"}, {v:"Avoir",r:"aur"}, {v:"Aller",r:"ir"}, {v:"Faire",r:"fer"}, {v:"Venir",r:"viendr"}];
    for(let i=0; i<50; i++){
        const v = vFut[i % 5]; const sIdx = i % 6; const t = ["ai","as","a","ons","ez","ont"][sIdx];
        res.futur.push({ q: `${subjects[sIdx]} (${v.v}) au futur.`, options: shuffle([v.r+t, v.v+"er", v.r+"ais"]), correct: v.r+t, exp: "Radical futur + ai, as, a..." });
    }

    // 4. MODULE CONDITIONNEL (50 Questions)
    for(let i=0; i<50; i++){
        const v = vFut[i % 5]; const sIdx = i % 6; const t = ["ais","ais","ait","ions","iez","aient"][sIdx];
        res.conditionnel.push({ q: `${subjects[sIdx]} (${v.v}) au conditionnel présent.`, options: shuffle([v.r+t, v.r+"ons", v.v+"ai"]), correct: v.r+t, exp: "Radical futur + terminaison imparfait." });
    }

    // 5. MODULE FEELINGS (50 Questions)
    const feels = [["Happy","Heureux"], ["Sad","Triste"], ["Angry","En colère"], ["Hungry","Affamé"], ["Thirsty","Soif"]];
    for(let i=0; i<50; i++){
        const pair = feels[i % 5];
        res.feelings.push({ q: `Anglais : Comment dit-on "${pair[1]}" ?`, options: shuffle([pair[0], "Bored", "Tired"]), correct: pair[0], exp: `Le mot est ${pair[0]}.` });
    }

    // 6. MODULE CALCUL MENTAL (100 Questions)
    for(let i=0; i<100; i++){
        const a = Math.floor(Math.random()*90)+10; const b = Math.floor(Math.random()*90)+10;
        res.calcul.push({ q: `${a} + ${b} = ?`, options: shuffle([a+b, a+b+5, a+b-2]), correct: a+b, exp: "Addition simple." });
    }

    return res;
}

function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

// --- LOGIQUE DE NAVIGATION ET ÉTAT ---
const allQuizzes = generateData();
let currentQuiz = [], currentIdx = 0, isEval = false, studentName = "";

// Système de navigation compatible avec les flèches du navigateur (Chrome)
window.navigateTo = function(id, addToHistory = true) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden-section'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.remove('hidden-section');
        // On ajoute l'ID à l'historique pour que Chrome active ses flèches
        if (addToHistory) {
            history.pushState({ sectionId: id }, "", `#${id}`);
        }
    }
    window.scrollTo(0,0);
};

// Gère le clic sur la flèche "Précédent" de Chrome
window.onpopstate = function(event) {
    if (event.state && event.state.sectionId) {
        window.navigateTo(event.state.sectionId, false);
    } else {
        window.navigateTo('home', false);
    }
};

window.checkAndStartEval = function(key) {
    const input = document.getElementById('student-name-eval');
    if(!input.value.trim()) return alert("Veuillez entrer votre NOM et PRÉNOM.");
    studentName = input.value;
    window.startQuiz(key, true);
};

window.startQuiz = function(key, evalMode = false) {
    currentQuiz = JSON.parse(JSON.stringify(allQuizzes[key])); 
    currentIdx = 0;
    isEval = evalMode;
    document.getElementById('quiz-title-display').innerText = isEval ? "ÉVALUATION OFFICIELLE" : key.toUpperCase();
    loadQuestion();
    window.navigateTo('quiz-player');
};

function loadQuestion() {
    const q = currentQuiz[currentIdx];
    document.getElementById('question-count').innerText = `${currentIdx + 1}/${currentQuiz.length}`;
    document.getElementById('question-text').innerText = q.q;
    
    const cont = document.getElementById('options-container');
    const valCont = document.getElementById('validate-container');
    cont.innerHTML = '';
    
    valCont.classList.toggle('hidden', isEval || q.validated);

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = `option-btn ${q.userAnswer === opt ? 'selected' : ''}`;
        
        if(q.validated || (isEval && q.userAnswer)) {
            if(opt === q.correct) btn.classList.add('correct');
            else if(opt === q.userAnswer) btn.classList.add('wrong');
            btn.style.pointerEvents = "none";
        }
        
        btn.innerText = opt;
        btn.onclick = () => {
            if(!q.validated) {
                q.userAnswer = opt;
                if(isEval) setTimeout(window.nextQuestion, 400); 
                loadQuestion();
            }
        };
        cont.appendChild(btn);
    });

    document.getElementById('next-btn').classList.toggle('hidden', currentIdx === currentQuiz.length - 1);
    document.getElementById('finish-btn').classList.toggle('hidden', currentIdx !== currentQuiz.length - 1);
    renderSidebar();
}

window.validateAnswer = function() {
    const q = currentQuiz[currentIdx];
    if(!q.userAnswer) return alert("Sélectionnez une réponse !");
    q.validated = true;
    loadQuestion();
};

function renderSidebar() {
    const side = document.getElementById('question-sidebar');
    side.innerHTML = currentQuiz.map((q, i) => `
        <div class="q-dot ${q.userAnswer ? 'answered' : ''} ${i === currentIdx ? 'active' : ''}" 
             onclick="window.jumpTo(${i})">${i + 1}</div>
    `).join('');
}

window.jumpTo = (i) => { currentIdx = i; loadQuestion(); };
window.nextQuestion = () => { if(currentIdx < currentQuiz.length-1) { currentIdx++; loadQuestion(); } };
window.prevQuestion = () => { if(currentIdx > 0) { currentIdx--; loadQuestion(); } };

window.handleFinish = function() {
    const score = currentQuiz.filter(q => q.userAnswer === q.correct).length;
    document.getElementById('result-student-name').innerText = isEval ? studentName : "ENTRAÎNEMENT";
    document.getElementById('final-score').innerText = `${score} / ${currentQuiz.length}`;
    
    if(isEval) {
        let ranks = JSON.parse(localStorage.getItem('essor_rank') || '[]');
        ranks.push({name: studentName, score, total: currentQuiz.length});
        ranks.sort((a,b) => b.score - a.score);
        localStorage.setItem('essor_rank', JSON.stringify(ranks.slice(0, 10)));
    }
    updateLeaderboard();
    window.navigateTo('results-screen');
};

function updateLeaderboard() {
    const ranks = JSON.parse(localStorage.getItem('essor_rank') || '[]');
    const tableBody = document.getElementById('leaderboard-body');
    if(tableBody) {
        tableBody.innerHTML = ranks.map((r, i) => `
            <tr class="rank-item ${i<3?'top-rank':''}">
                <td class="p-3 gold-text font-black">#${i+1}</td>
                <td class="p-3 uppercase text-sm">${r.name}</td>
                <td class="p-3 text-right font-black">${r.score}/${r.total}</td>
            </tr>
        `).join('');
    }
}

// Fonction pour le bouton retour du header
window.goBack = function() {
    window.history.back();
};

window.onload = () => {
    updateLeaderboard();
    // On initialise le premier état de l'historique
    history.replaceState({ sectionId: 'home' }, "", "#home");
    window.navigateTo('home', false);
};
