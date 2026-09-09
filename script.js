// Main Application Logic
let currentSubject = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeLeft = 1200; // 20 minutes in seconds
let quizStartTime = null;
let hasAccess = false;
let selectedSubjectForQuiz = null;

// WhatsApp Links
const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbCJXuCDeON8S6aCk43B";
const WHATSAPP_CONTACT = "https://wa.me/message/WHTP63YEENQ4C1";

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    loadSubjects();
    loadLeaderboard();
    updateStats();
    checkAccess();
});

// Check if user has access
function checkAccess() {
    const accessGranted = localStorage.getItem('quizAccessGranted');
    const accessDate = localStorage.getItem('quizAccessDate');
    
    if (accessGranted === 'true' && accessDate) {
        const lastAccess = new Date(accessDate);
        const now = new Date();
        const hoursSinceAccess = (now - lastAccess) / (1000 * 60 * 60);
        
        if (hoursSinceAccess < 24) {
            hasAccess = true;
            console.log('Access already granted');
        } else {
            localStorage.removeItem('quizAccessGranted');
            localStorage.removeItem('quizAccessDate');
            hasAccess = false;
        }
    }
}

// Load Subjects
function loadSubjects() {
    const subjectsGrid = document.getElementById('subjectsGrid');
    if (!subjectsGrid) {
        console.error('Subjects grid not found!');
        return;
    }
    
    subjectsGrid.innerHTML = '';
    
    Object.keys(quizData).forEach(subjectKey => {
        const subject = quizData[subjectKey];
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.setAttribute('data-subject', subjectKey);
        card.onclick = function() {
            console.log('Subject clicked:', subjectKey);
            handleSubjectClick(subjectKey);
        };
        card.innerHTML = `
            <div class="subject-icon">${subject.icon}</div>
            <div class="subject-name">${subject.name}</div>
            <div class="subject-count">${subject.questions.length} Questions</div>
            ${!hasAccess ? '<div class="lock-icon">🔒</div>' : ''}
        `;
        subjectsGrid.appendChild(card);
    });
    
    console.log('Subjects loaded:', Object.keys(quizData).length);
}

// Handle subject click
function handleSubjectClick(subjectKey) {
    if (hasAccess) {
        startQuiz(subjectKey);
    } else {
        selectedSubjectForQuiz = subjectKey;
        showAccessRequiredModal();
    }
}

// Show Access Required Modal
function showAccessRequiredModal() {
    const existingModal = document.getElementById('accessModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div id="accessModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: white; border-radius: 20px; padding: 40px; max-width: 500px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🔓</div>
                <h2 style="color: #2C3E50; margin-bottom: 15px; font-size: 1.8rem;">Unlock Full Access</h2>
                <p style="color: #666; margin-bottom: 30px; font-size: 1.1rem; line-height: 1.6;">
                    To start practicing, please complete these steps:
                </p>
                
                <div style="text-align: left; margin-bottom: 30px;">
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <h3 style="color: #2C3E50; margin-bottom: 10px; font-size: 1.1rem;">Step 1: Join WhatsApp Channel</h3>
                        <a href="${WHATSAPP_CHANNEL}" target="_blank" id="whatsappJoinBtn" 
                           style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s;"
                           onmouseover="this.style.transform='translateY(-2px)'" 
                           onmouseout="this.style.transform='translateY(0)'"
                           onclick="markWhatsAppJoined()">
                            💬 Join WhatsApp Channel
                        </a>
                    </div>
                    
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 10px;">
                        <h3 style="color: #2C3E50; margin-bottom: 10px; font-size: 1.1rem;">Step 2: Share with Friends</h3>
                        <p style="color: #666; margin-bottom: 10px; font-size: 0.9rem;">Share this quiz platform with at least 1 friend</p>
                        <button onclick="shareToUnlock()" 
                                style="background: #4A90E2; color: white; padding: 12px 24px; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; transition: all 0.3s;"
                                onmouseover="this.style.transform='translateY(-2px)'" 
                                onmouseout="this.style.transform='translateY(0)'">
                            📤 Share Now
                        </button>
                    </div>
                </div>
                
                <button id="verifyAccessBtn" 
                        style="width: 100%; background: #2C3E50; color: white; padding: 15px; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1rem; font-weight: 600; opacity: 0.5; transition: all 0.3s;"
                        disabled>
                    Complete Both Steps to Continue
                </button>
                
                <button onclick="closeAccessModal()" 
                        style="margin-top: 15px; background: none; border: none; color: #666; cursor: pointer; text-decoration: underline;">
                    Maybe Later
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        if (localStorage.getItem('whatsappJoined') === 'true') {
            const joinBtn = document.getElementById('whatsappJoinBtn');
            if (joinBtn) {
                joinBtn.innerHTML = '✅ Channel Joined';
                joinBtn.style.background = '#27AE60';
            }
        }
        if (localStorage.getItem('hasShared') === 'true') {
            updateShareButton();
            checkUnlockConditions();
        }
    }, 1000);
}

// Share to Unlock
function shareToUnlock() {
    const shareText = encodeURIComponent("🎯 Join me on QuizMaster NG! Test your JAMB knowledge with standard questions. Free access to all subjects!");
    const shareUrl = encodeURIComponent(window.location.href);
    
    if (navigator.share) {
        navigator.share({
            title: 'QuizMaster NG',
            text: 'Join me on QuizMaster NG! Test your JAMB knowledge with standard questions.',
            url: window.location.href
        }).then(() => {
            localStorage.setItem('hasShared', 'true');
            updateShareButton();
            checkUnlockConditions();
        }).catch((error) => {
            console.log('Share cancelled', error);
            localStorage.setItem('hasShared', 'true');
            updateShareButton();
            checkUnlockConditions();
        });
    } else {
        showShareOptions();
    }
}

// Show Share Options
function showShareOptions() {
    const text = encodeURIComponent("🎯 Join me on QuizMaster NG! Test your JAMB knowledge with standard questions. Free access to all subjects!");
    const url = encodeURIComponent(window.location.href);
    
    const shareModal = `
        <div id="shareOptionsModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 10001; width: 90%; max-width: 400px;">
            <h3 style="margin-bottom: 20px; color: #2C3E50;">Share with Friends</h3>
            <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <button onclick="shareToWhatsAppAndUnlock()" style="background: #25D366; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">WhatsApp</button>
                <button onclick="shareToFacebookAndUnlock()" style="background: #3b5998; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Facebook</button>
                <button onclick="shareToTwitterAndUnlock()" style="background: #1DA1F2; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Twitter</button>
            </div>
            <button onclick="document.getElementById('shareOptionsModal').remove()" style="background: #666; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', shareModal);
}

// Share functions that unlock
function shareToWhatsAppAndUnlock() {
    const text = encodeURIComponent("🎯 Join me on QuizMaster NG! Test your JAMB knowledge with standard questions.");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    
    setTimeout(() => {
        localStorage.setItem('hasShared', 'true');
        updateShareButton();
        checkUnlockConditions();
        const modal = document.getElementById('shareOptionsModal');
        if (modal) modal.remove();
    }, 2000);
}

function shareToFacebookAndUnlock() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    
    setTimeout(() => {
        localStorage.setItem('hasShared', 'true');
        updateShareButton();
        checkUnlockConditions();
        const modal = document.getElementById('shareOptionsModal');
        if (modal) modal.remove();
    }, 2000);
}

function shareToTwitterAndUnlock() {
    const text = encodeURIComponent("🎯 Join me on QuizMaster NG! Test your JAMB knowledge with standard questions.");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}%20${url}`, '_blank');
    
    setTimeout(() => {
        localStorage.setItem('hasShared', 'true');
        updateShareButton();
        checkUnlockConditions();
        const modal = document.getElementById('shareOptionsModal');
        if (modal) modal.remove();
    }, 2000);
}

// Update Share Button State
function updateShareButton() {
    const shareButtons = document.querySelectorAll('button');
    shareButtons.forEach(btn => {
        if (btn.textContent.includes('Share Now') || btn.textContent.includes('📤 Share')) {
            btn.innerHTML = '✅ Shared';
            btn.style.background = '#27AE60';
        }
    });
}

// Check Unlock Conditions
function checkUnlockConditions() {
    const whatsappJoined = localStorage.getItem('whatsappJoined') === 'true';
    const hasShared = localStorage.getItem('hasShared') === 'true';
    
    const whatsappBtn = document.getElementById('whatsappJoinBtn');
    const whatsappClicked = whatsappBtn && whatsappBtn.innerHTML.includes('✅');
    
    const verifyBtn = document.getElementById('verifyAccessBtn');
    
    if ((whatsappJoined || whatsappClicked) && hasShared) {
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.style.opacity = '1';
            verifyBtn.textContent = '✅ Unlock Quiz Access';
            verifyBtn.onclick = grantAccess;
        }
    } else {
        if (verifyBtn) {
            if (!whatsappJoined && !whatsappClicked) {
                verifyBtn.textContent = '⚠️ Join WhatsApp Channel First';
            } else if (!hasShared) {
                verifyBtn.textContent = '⚠️ Share with Friends First';
            }
        }
    }
}

// Grant Access
function grantAccess() {
    hasAccess = true;
    localStorage.setItem('quizAccessGranted', 'true');
    localStorage.setItem('quizAccessDate', new Date().toISOString());
    localStorage.setItem('whatsappJoined', 'true');
    
    closeAccessModal();
    loadSubjects();
    
    if (selectedSubjectForQuiz) {
        startQuiz(selectedSubjectForQuiz);
    } else {
        alert('✅ Access Granted! You can now take all quizzes.');
    }
}

// Close Access Modal
function closeAccessModal() {
    const modal = document.getElementById('accessModal');
    if (modal) {
        modal.remove();
    }
}

// Mark WhatsApp as joined
function markWhatsAppJoined() {
    localStorage.setItem('whatsappJoined', 'true');
    setTimeout(() => {
        const joinBtn = document.getElementById('whatsappJoinBtn');
        if (joinBtn) {
            joinBtn.innerHTML = '✅ Channel Joined';
            joinBtn.style.background = '#27AE60';
        }
        checkUnlockConditions();
    }, 3000);
}

// Start Quiz
function startQuiz(subjectKey) {
    console.log('Starting quiz for:', subjectKey);
    
    if (!quizData[subjectKey]) {
        console.error('Subject not found:', subjectKey);
        alert('Sorry, this subject is not available yet.');
        return;
    }
    
    if (!hasAccess) {
        selectedSubjectForQuiz = subjectKey;
        showAccessRequiredModal();
        return;
    }
    
    currentSubject = subjectKey;
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData[subjectKey].questions.length).fill(null);
    
    const subjectsSection = document.getElementById('subjects');
    if (subjectsSection) {
        subjectsSection.style.display = 'none';
    }
    
    const quizSection = document.getElementById('quiz');
    if (quizSection) {
        quizSection.style.display = 'block';
        console.log('Quiz section displayed');
    } else {
        console.error('Quiz section not found!');
        return;
    }
    
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    
    quizSection.scrollIntoView({ behavior: 'smooth' });
    
    timeLeft = 1200;
    quizStartTime = Date.now();
    startTimer();
    
    loadQuestion();
    
    console.log('Quiz started successfully');
}

// Load Question
function loadQuestion() {
    console.log('Loading question:', currentQuestionIndex);
    
    const subject = quizData[currentSubject];
    if (!subject) {
        console.error('Subject data not found');
        return;
    }
    
    const questions = subject.questions;
    if (!questions || questions.length === 0) {
        console.error('No questions found for subject');
        return;
    }
    
    const question = questions[currentQuestionIndex];
    if (!question) {
        console.error('Question not found');
        return;
    }
    
    document.getElementById('quizSubject').textContent = subject.name;
    document.getElementById('quizProgress').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1}`;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('optionsContainer');
    if (!optionsContainer) {
        console.error('Options container not found');
        return;
    }
    
    optionsContainer.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D'];
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.onclick = function() {
            selectOption(index);
        };
        
        if (userAnswers[currentQuestionIndex] === index) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span>${option}</span>
        `;
        optionsContainer.appendChild(optionDiv);
    });
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-flex';
    }
    
    if (nextBtn) {
        nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next';
    }
}

// Select Option
function selectOption(index) {
    console.log('Option selected:', index);
    userAnswers[currentQuestionIndex] = index;
    
    const options = document.querySelectorAll('.option');
    options.forEach((option, i) => {
        if (i === index) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Navigation
function nextQuestion() {
    console.log('Next button clicked');
    const questions = quizData[currentSubject].questions;
    
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    console.log('Previous button clicked');
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

// Timer
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            finishQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Finish Quiz
function finishQuiz() {
    console.log('Finishing quiz...');
    clearInterval(timerInterval);
    
    const questions = quizData[currentSubject].questions;
    let correctCount = 0;
    
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correctCount++;
        }
    });
    
    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const timeUsed = Math.floor((Date.now() - quizStartTime) / 1000);
    const timeFormatted = formatTime(timeUsed);
    
    saveResult({
        subject: currentSubject,
        score: score,
        correct: correctCount,
        wrong: totalQuestions - correctCount,
        timeUsed: timeUsed,
        date: new Date().toISOString()
    });
    
    document.getElementById('quiz').style.display = 'none';
    
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    
    document.getElementById('finalScore').textContent = `${score}%`;
    document.getElementById('correctAnswers').textContent = correctCount;
    document.getElementById('wrongAnswers').textContent = totalQuestions - correctCount;
    document.getElementById('timeUsed').textContent = timeFormatted;
    
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    updateStats();
    loadLeaderboard();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Save Results to localStorage
function saveResult(result) {
    const userName = prompt("Enter your name for the leaderboard:", localStorage.getItem('userName') || '');
    if (userName) {
        localStorage.setItem('userName', userName);
        result.userName = userName;
    } else {
        result.userName = 'Anonymous';
    }
    
    let results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    results.push(result);
    localStorage.setItem('quizResults', JSON.stringify(results));
}

// Load Leaderboard
function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    
    leaderboardBody.innerHTML = '';
    
    let results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    
    results.sort((a, b) => b.score - a.score);
    
    const topResults = results.slice(0, 10);
    
    if (topResults.length === 0) {
        leaderboardBody.innerHTML = `
            <div style="padding: 30px; text-align: center; color: var(--ash-dark);">
                No results yet. Be the first to take a quiz!
            </div>
        `;
        return;
    }
    
    topResults.forEach((result, index) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        row.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span>${result.userName}</span>
            <span>${quizData[result.subject]?.name || result.subject}</span>
            <span>${result.score}%</span>
        `;
        leaderboardBody.appendChild(row);
    });
}

// Update Stats
function updateStats() {
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    
    const totalQuizzes = document.getElementById('totalQuizzes');
    if (totalQuizzes) {
        totalQuizzes.textContent = results.length;
    }
    
    const uniqueUsers = new Set(results.map(r => r.userName));
    const totalUsers = document.getElementById('totalUsers');
    if (totalUsers) {
        totalUsers.textContent = uniqueUsers.size;
    }
}

// Share Functions
function shareOnWhatsApp() {
    const text = encodeURIComponent("🎯 Test your JAMB knowledge with QuizMaster NG! Challenge yourself and your friends. Join our WhatsApp channel for daily quizzes and updates!");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
}

function shareResults() {
    const score = document.getElementById('finalScore').textContent;
    const text = encodeURIComponent(`🎉 I just scored ${score} on QuizMaster NG! Can you beat my score? Try now!`);
    const url = encodeURIComponent(window.location.href);
    
    if (navigator.share) {
        navigator.share({
            title: 'QuizMaster NG Results',
            text: `I scored ${score} on QuizMaster NG!`,
            url: window.location.href
        }).catch(console.error);
    } else {
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    }
}

function shareToFriends() {
    const text = encodeURIComponent("👥 Challenge your friends! Test your JAMB knowledge with QuizMaster NG. Multiple subjects, leaderboard, and more!");
    const url = encodeURIComponent(window.location.href);
    
    const shareOptions = `
        <div id="shareDialog" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 9999; width: 90%; max-width: 400px;">
            <h3 style="margin-bottom: 20px; color: #2C3E50;">Share with Friends</h3>
            <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <button onclick="window.open('https://wa.me/?text=${text}%20${url}', '_blank')" style="background: #25D366; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">WhatsApp</button>
                <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${url}', '_blank')" style="background: #3b5998; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Facebook</button>
                <button onclick="window.open('https://twitter.com/intent/tweet?text=${text}%20${url}', '_blank')" style="background: #1DA1F2; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Twitter</button>
            </div>
            <button onclick="document.getElementById('shareDialog').remove()" style="background: #666; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
        </div>
    `;
    
    const existingDialog = document.getElementById('shareDialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', shareOptions);
}

// Contact for JAMB Assistance
function contactForAssistance() {
    window.open(WHATSAPP_CONTACT, '_blank');
}

// Retake Quiz
function retakeQuiz() {
    document.getElementById('results').style.display = 'none';
    startQuiz(currentSubject);
}

// Try Another Subject
function tryAnotherSubject() {
    document.getElementById('results').style.display = 'none';
    const subjectsSection = document.getElementById('subjects');
    subjectsSection.style.display = 'block';
    subjectsSection.scrollIntoView({ behavior: 'smooth' });
}

// Add WhatsApp Channel button in header
function addWhatsAppChannelButton() {
    const nav = document.querySelector('.nav');
    if (nav) {
        const existingBtn = nav.querySelector('.whatsapp-btn');
        if (existingBtn) return;
        
        const channelBtn = document.createElement('a');
        channelBtn.href = WHATSAPP_CHANNEL;
        channelBtn.target = '_blank';
        channelBtn.className = 'whatsapp-btn';
        channelBtn.innerHTML = '<span>💬</span> Join Channel';
        channelBtn.onclick = markWhatsAppJoined;
        nav.appendChild(channelBtn);
    }
}

// Initialize WhatsApp Channel button
addWhatsAppChannelButton();

// Make functions globally available
window.startQuiz = startQuiz;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.selectOption = selectOption;
window.retakeQuiz = retakeQuiz;
window.tryAnotherSubject = tryAnotherSubject;
window.shareOnWhatsApp = shareOnWhatsApp;
window.shareResults = shareResults;
window.shareToFriends = shareToFriends;
window.shareToUnlock = shareToUnlock;
window.grantAccess = grantAccess;
window.closeAccessModal = closeAccessModal;
window.markWhatsAppJoined = markWhatsAppJoined;
window.shareToWhatsAppAndUnlock = shareToWhatsAppAndUnlock;
window.shareToFacebookAndUnlock = shareToFacebookAndUnlock;
window.shareToTwitterAndUnlock = shareToTwitterAndUnlock;
window.contactForAssistance = contactForAssistance;
```
