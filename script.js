class Game {
    constructor() {
        this.guesses = 6;
        this.wordLength = 5;
        this.currentRow = 0;
        this.tiles = document.querySelector(".tiles");
        this.setWord();
        this.createTiles();
    }
    createTiles() {
        for (let i=0; i<this.guesses; i++) {
            let tileRow = `<div class="tile-row">`;
            for (let j=0; j<this.wordLength; j++) {
                tileRow += `<div class="tile" data-state="empty"></div>`;
            }
            tileRow += `</div>`;
            this.tiles.innerHTML += tileRow;
        }
    }
    addLetter(button) {
        const currentTiles = this.tiles.childNodes[this.currentRow].childNodes;
        for (let tile of currentTiles) {
            if (tile.dataset.state == "empty") {
                tile.innerText = button.innerText;
                tile.dataset.state = "TBD";
                break;
            }
        }
        this.checkGameStatus();
    }
    currentRowIsFull() {
        const currentTiles = this.tiles.childNodes[this.currentRow].childNodes;
        let full = true;
        for (let tile of currentTiles) {
            if (tile.dataset.state == "empty") {
                full = false;
                break;
            }
        }
        return full;
    }
    maxWordsGuessed() {
        const lastTiles = this.tiles.lastChild.childNodes;
        let full = true;
        for (let tile of lastTiles) {
            if (tile.dataset.state == "empty") {
                full = false;
                break;
            }
        }
        return full;
    }
    checkGameStatus() {
        if (this.maxWordsGuessed()) {
            this.currentRow -= 1;
            this.evaluateTiles();
            if (!this.wordCorrectlyGuessed()) {
                this.disableButtons();
                document.getElementById("result").innerText = `You lose!`;
                const resetButton = document.querySelector(".reset-button");
                resetButton.style.display = "block";
            }
        }
        if (this.currentRowIsFull()) {
            this.evaluateTiles();
        }
    }
    async evaluateTiles() {
        const wordExists = await this.wordExists();
        if (!wordExists) {
            this.clearTileRow();
        } else {
            this.checkLetters();
            this.checkIfGameWon();
            this.currentRow += 1;
        }
    }
    countLetters(word) {
        let wordLetters = {}
        for (let i=0; i<word.length; i++) {
            wordLetters[word[i]] = word.split(word[i]).length - 1;
        }
        return wordLetters;
    }
    getGuessedWord() {
        const currentTiles = this.tiles.childNodes[this.currentRow].childNodes;
        let wordGuessed = "";
        for (let tile of currentTiles) {
            wordGuessed += tile.innerText;
        } 
        return wordGuessed.toLowerCase();
    }
    checkLetters() {
        const currentTiles = this.tiles.childNodes[this.currentRow].childNodes;
        this.showIncorrectLetterGuesses(currentTiles); 
        this.showCorrectLetterGuesses(currentTiles);  
        this.showWrongSpotLetterGuesses(currentTiles); 
    }
    showCorrectLetterGuesses(currentTiles) {
        for (let [index, tile] of currentTiles.entries()) {
            let letter = tile.innerText.toLowerCase();
            if (this.word.indexOf(letter, index) === index) {
                tile.dataset.state = "correctSpot";
                let keyboardKey = document.querySelector(`[data-key="${letter}"]`);
                keyboardKey.dataset.state = "correctKey";
            } 
        }     
    }
    showWrongSpotLetterGuesses(currentTiles) {       
        const guessedWord = this.getGuessedWord();
        const letterGuessCount = this.countLetters(guessedWord);
        const letterWordCount = this.countLetters(this.word);
        for (let tile of currentTiles) {
            let letter = tile.innerText.toLowerCase();
            let keyboardKey = document.querySelector(`[data-key="${letter}"]`);
            if (tile.dataset.state == "empty" || tile.dataset.state == "TBD") {
                if (letterGuessCount[letter] <= letterWordCount[letter]) {
                    tile.dataset.state = "wrongSpot";
                    keyboardKey.dataset.state = "wrongKey";                    
                } else {
                    tile.dataset.state = "notPresent";
                    keyboardKey.dataset.state = "used";
                }
            }
        }
    }
    showIncorrectLetterGuesses(currentTiles) {
        for (let tile of currentTiles) {
            let letter = tile.innerText.toLowerCase();
            let keyboardKey = document.querySelector(`[data-key="${letter}"]`);
            if (!this.word.includes(letter)) {
                tile.dataset.state = "notPresent";
                keyboardKey.dataset.state = "used";
            }
        }
    }
    checkIfGameWon() {
        if (this.wordCorrectlyGuessed()) {
            document.getElementById("showWordSection").style.display = "none";
            this.disableButtons();
            document.getElementById("result").innerText = `You win!`;
            const resetButton = document.querySelector(".reset-button");
            resetButton.style.display = "block";
        }
    }
    clearTileRow() {
        document.getElementById("message").innerText = "That word doesn't exist!"
        setTimeout(function () {
            document.getElementById("message").innerText = "";
        }, 3000);
        
        const currentTiles = this.tiles.childNodes[this.currentRow].childNodes;
        for (let tile of currentTiles) {
            tile.innerText = "";
            tile.dataset.state = "empty";
        }
    }
    wordCorrectlyGuessed() {
        let correctlyGuessed = true;
        const currentTiles = this.tiles.childNodes[this.currentRow].childNodes;
        for (let tile of currentTiles) {
            if (tile.dataset.state == "wrongSpot" || tile.dataset.state == "notPresent") {
                correctlyGuessed = false;
                break;
            }
        }
        return correctlyGuessed;
    }
    disableButtons() {
        let buttons = document.querySelectorAll(".keyboard-button");
        for (let button of buttons) {
            button.dataset.disabled = "true";
        }
    }
    reset() {
        document.getElementById("showWordSection").style.display = "block";
        document.getElementById("word").innerText = "";
        this.currentRow = 0;
        this.setWord();
        this.tiles.innerHTML = "";
        this.createTiles();
        let buttons = document.querySelectorAll(".keyboard-button");
        for (let button of buttons) {
            button.dataset.state = "notUsed";
        }
    }
    async getNewWord() {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'random-words5.p.rapidapi.com',
                'X-RapidAPI-Key': '9eb2d42ff5msh1b24b10e0b5ead9p149210jsn7a46b5bf07a0'
            }
        };

        let data = fetch('https://random-words5.p.rapidapi.com/getMultipleRandom?count=10&wordLength=5', options)
            .then(response => response.json())
            .then(response => {
                return response[Math.floor(Math.random()*response.length)];
            })
            .catch(error => console.log(error)); 
        return data; 
    }
    async setWord() {
        const word = await this.getNewWord();
        this.word = word;
    }
    async checkIfWordExists() {
        const guessedWord = this.getGuessedWord()
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'lingua-robot.p.rapidapi.com',
                'X-RapidAPI-Key': '9eb2d42ff5msh1b24b10e0b5ead9p149210jsn7a46b5bf07a0'
            }
        };
        
        let data = fetch(`https://lingua-robot.p.rapidapi.com/language/v1/entries/en/${guessedWord.toLowerCase()}`, options)
            .then(response => response.json())
            .then(json => JSON.stringify(json))
            .then(jsonString => {
                return JSON.parse(jsonString)
            })
            .catch(err => console.error("error: " + err));
        return data;
    }
    async wordExists() {
        var dictionaryResults = await this.checkIfWordExists();
        if (dictionaryResults["entries"].length > 0) {
            return true;
        } else {
            return false;
        }
    }
    showWord() {
        const location = document.getElementById("word");
        if (location.innerText == "") {
            location.innerText = this.word;
        } else {
            location.innerText = "";
        }
        
    }
}

document.addEventListener("DOMContentLoaded", () => {
    var game = new Game();
    const buttons = document.querySelectorAll(".keyboard-button");
    for (let button of buttons) {
        button.addEventListener("click", () => game.addLetter(button));
    }

    const resetButton = document.querySelector(".reset-button");
    resetButton.addEventListener("click", () => game.reset());

    const showWord = document.getElementById("showWord");
    showWord.addEventListener("click", () => game.showWord());
})
