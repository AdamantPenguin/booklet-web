// Main in-game script for booklet-web

// firebase imports
// https://firebase.google.com/docs/web/alt-setup
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js'
import { getAuth, signInWithCustomToken } from 'https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js'
import { getDatabase, ref, onValue, set, onDisconnect, get } from 'https://www.gstatic.com/firebasejs/9.6.2/firebase-database.js'

// jquery-like selector shortcuts
const $ = selector => document.querySelector(selector)
const $$ = selector => document.querySelectorAll(selector)

// get variables passed by join.html
const queryParams = new URLSearchParams(window.location.search)
const gameId = queryParams.get('id')
const username = queryParams.get('nick')

var gameSet, setId
var isGameInProgress = false


// configurate the firebase
// blooket uses a different databaseURL depending on the game ID,
//  so this absolute mess is required
//  if someone wants to make this neater please PR :)
const dbUrlIndex = gameId < 149999 ? 0 :
    gameId < 200000 ? 1 :
    gameId < 249999 ? 2 :
    gameId < 300000 ? 3 :
    gameId < 349999 ? 4 :
    gameId < 400000 ? 5 :
    gameId < 449999 ? 6 :
    gameId < 500000 ? 7 :
    gameId < 549999 ? 8 :
    gameId < 600000 ? 9 :
    gameId < 649999 ? 10 :
    gameId < 700000 ? 11 :
    gameId < 749999 ? 12 :
    gameId < 800000 ? 13 :
    gameId < 849999 ? 14 :
    gameId < 900000 ? 15 :
    gameId < 949999 ? 16 :
    17
const dbUrl = `https://blooket-${dbUrlIndex + 2020}.firebaseio.com`
const firebaseConfig = { // copied from https://www.blooket.com/main~793450d6.f9ca723029c6f31914e1.js?2d5498724e97d6d5568c
    apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
    authDomain: "blooket-2020.firebaseapp.com",
    projectId: "blooket-2020",
    storageBucket: "blooket-2020.appspot.com",
    messagingSenderId: "741533559105",
    appId: "1:741533559105:web:b8cbb10e6123f2913519c0",
    measurementId: "G-S3H5NGN10Z",
    databaseURL: dbUrl
}

const fb = initializeApp(firebaseConfig)

// authenticate to blooket api
const authenticate = async (username, gameId) => {
    const request = await fetch('https://blooket-api-getter.glitch.me/join', {
        method: 'POST',
        body: JSON.stringify({
            id: gameId,
            name: username
        }),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/json'
        }
    })
    const response = await request.json()
    const fbToken = response['fbToken']

    const auth = getAuth()
    await signInWithCustomToken(auth, fbToken)
    return response['blook']
}

// log in and do stuff
const playGame = async () => {
    var blook
    try {
        blook = await authenticate(username, gameId)
    } catch (e) {
        $('#statusContainer').innerHTML =
          `<p>Auth failed:<br>${e}<br>Did you enter the Game ID correctly?</p>`
        return
    }

    // database references
    const db = getDatabase()
    const dbRoot = `${gameId}/`
    const players = `${dbRoot}c/`

    // detect when the game is connected and act accordingly
    onValue(ref(db, dbRoot + 'ho'), (snapshot) => {
        const host = snapshot.val()
        if (host) {
            // join the lobby
            set(ref(db, players + username), { b: blook })
            // make sure the game is left when leaving page
            onDisconnect(ref(db, players + username)).remove()
            // erase loading icon and show game info on screen
            $('#statusContainer').innerHTML = ''
            $('#statusContainer').appendChild(document.createElement('p'))
            // get more data
            get(ref(db, dbRoot)).then(async (snapshot) => {
                const data = snapshot.val()
                $('#statusContainer > p')
                    .innerHTML = `Host: ${host}<br>`
                               + `Gamemode: ${data.s.t}<br>`
                               + 'Waiting for host to start game.'
                // change the page title
                $('#pageTitle').innerText = 'Waiting in Lobby'

                setId = data.set

                onValue(ref(db, dbRoot + 'stg'), (snapshot) => {
                    const stg = snapshot.val()
                    console.log(stg)
                    if (!stg) {
                        $('#statusContainer > p').innerText = 'Game offline'
                        return
                    } else if (stg === 'fin') {
                        onGameEnd()
                    } else if (stg === 'inst') {
                        switchToScreen('instruction')
                    } else if (stg !== 'join') {
                        onGameStart(stg)
                    }
                })
            })
            
        }
    }, { onlyOnce: true })
}

// when the game starts
const onGameStart = async (stg) => {
    console.log('onGameStart called')
    $('#pageTitle').innerText = ''
    isGameInProgress = true

    // get question set
    gameSet = await (await fetch(
        'https://blooket-api-getter.glitch.me/games?gameId='
        + setId
    )).json()
    
    console.log(gameSet)
    runQuestion()
}


// when the game ends but is not yet closed
const onGameEnd = () => {
    isGameInProgress = false
    // placeholder
    switchToScreen()
    $('#statusContainer > p').innerText = 'Game ended'
}

// show a question and return the correct answer if it was wrong or nothing if
//   it was right
const runQuestion = () => {
    switchToScreen('question')

    const qId = Math.floor(Math.random() * gameSet.numQuestions)
    const question = gameSet.questions[qId]
    $('#questionImage').src = question.image.url
    $('#question').innerText = question.question
    $('#answer1').innerText = question.answers[0]
    $('#answer2').innerText = question.answers[1]
    $('#answer3').innerText = question.answers[2]
    $('#answer4').innerText = question.answers[3]

    question.answers.forEach((text, index) => {
        if (question.correctAnswers.includes(text)) {
            $(`#answer${index+1}`).onclick = () => choseCorrectAnswer()
        } else {
            $(`#answer${index+1}`).onclick = () => choseIncorrectAnswer(
                question.correctAnswers[0]
            )
        }
    })
}

// handle correct answer being chosen
const choseCorrectAnswer = () => {
    switchToScreen('correct')
}

// handle incorrect answer being chosen
const choseIncorrectAnswer = (correctAnswer) => {
    $('#correctAnswer').innerText = correctAnswer
    switchToScreen('incorrect')
}

// onclicks for correct and incorrect screens
$('#correctScreen').onclick = runQuestion  // TODO: money & mode-specific stuff
$('#incorrectScreen').onclick = runQuestion


// switch screen
const switchToScreen = (screen) => {
    const screens = {
        'question': $('#questionScreen'),
        'instruction': $('#instructionScreen'),
        'correct': $('#correctScreen'),
        'incorrect': $('#incorrectScreen')
    }
    Object.values(screens).forEach(node => node.style.display = 'none')
    if (screen) {
        screens[screen].style.display = 'flex'
    }
}
window.globalThis.switchToScreen = switchToScreen // allow use in debug console

playGame()
