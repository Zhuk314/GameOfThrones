// API description https://thronesapi.com/swagger/index.html?urls.primaryName=Game%20of%20Thrones%20API%20v2
let answerJSONIndex;
const numOfChoices = 4;
let correctAnswers = 0;
let incorrectAnswers = 0;

const GAME_CANVAS = document.getElementById("gameCanvas");
const UPDATE_FORM = document.getElementById("updateForm");
const CHAR_INFO = document.getElementById("characterInfo");

/**The function to fetch data.
 * Use get request to get data from https://thronesapi.com/api/v2/Characters endpoint.
 * The endpoint gives access to all characters with all stats.
 *
 * @param thenFunction the function which may be executed on .then
 */
function fetchData(thenFunction) {
    //get all Characters from the web api at https://thronesapi.com/api/v2/Characters
    let uri = "https://thronesapi.com/api/v2/Characters";
    let params = {
        method: "get",
        mode: "cors",
    };

    fetch(uri, params)
        .then(function(response) {
            //console.log(response);
            return response.json(); //return another promise
        })
        .then(thenFunction);
}

/** The function to fetch data from https://thronesapi.com/api/v2/Characters/{id} endpoint
 * by using specific id.
 *
 * @param id the id of character
 */
function fetchCharacterById(id) {
    //get all Characters from the web api at https://thronesapi.com/api/v2/Characters/id
    let uri = "https://thronesapi.com/api/v2/Characters/" + id;
    let params = {
        method: "get",
        mode: "cors",
    };

    fetch(uri, params)
        .then(function(response) {
            console.log(response);
            return response.json(); //return another promise
        })
        .then(displayCharacterToUpdate);
}

/**
 * Helper function to reset results.
 * Sets correct and incorrect answers to 0, and updates the information on the page.
 */
function resetResults() {
    correctAnswers = 0;
    incorrectAnswers = 0;
    displayIncorrect();
    displayCorrect();
}

/** The function to execute when user clicks on start new game button.
 * Resets all old results(if exist) and displays new data on the page.
 */
function startGame() {
    resetResults();

    fetchData(displayData);
}

/** The function to be executed while fetching in .then.
 * Accepts the json element and based on that information display
 * the main information of the game. It includes the image of the
 * character and options to select.
 *
 * @param json object with all characters info
 */
function displayData(json) {
    // set new random selected index
    answerJSONIndex = getRandom(json.length);

    let answersDiv = document.getElementById("answersSelectorsDiv");
    answersDiv.innerHTML = ''; //clear all answers from previous question

    // select the random position of correct question
    let correctAnswerPosition = getRandom(numOfChoices);

    // make visible the container with question
    GAME_CANVAS.style.display = "block";
    UPDATE_FORM.style.display = "none";
    CHAR_INFO.style.display = "none";


    // add image on page based on new random selected index
    document.getElementById("img").src = json[answerJSONIndex]["imageUrl"].toString();
    document.getElementById("img").alt = json[answerJSONIndex]["fullName"];
    // add answers on the page. Correct answer has random position based on correctAnswerPosition
    for (let i = 0; i < numOfChoices; i++) {
        // add correct answer
        if (i === correctAnswerPosition) {
            answersDiv.innerHTML += '<input type="radio" class="radioBigger" id="answer_' + i + '" name="answer" value="' + json[answerJSONIndex].id + '">';
            answersDiv.innerHTML += '<label class="answerLabel" for="answer_' + i + '">' + json[answerJSONIndex]["fullName"] + ' </label><br>';
        }
        // add incorrect answer
        else {
            answersDiv.innerHTML += '<input type="radio" class="radioBigger" id="answer_' + i + '" name="answer" value="-1">';
            answersDiv.innerHTML += '<label class="answerLabel" for="answer_' + i + '">' + json[getRandom(json.length)]["fullName"] + ' </label><br>';
        }
    }
}

/** Checks the selection made by user and returns the value of that selection.
 * If user didn't make any selection returns null.
 *
 * @return {null|number} value of user selection or null if not selected.
 */
function getUserSelection() {
    let button;
    let buttonId;
    for (let i = 0; i < numOfChoices; i++) {
        buttonId = "answer_" + i;
        button = document.getElementById(buttonId);
        if (button.checked) {
            return button.value;
        }
    }

    return null;
}

/** The function to be executed while click next button.
 *  It checks submitted user's selection and decides is it correct or incorrect.
 *  All incorrect answers have -1 value.
 *  The correct answer has positive value or `0` which represents the character Id number.
 */
function onNextClick() {
    let userSelection = getUserSelection();
    if (userSelection === null) {
        return;
    }

    if (userSelection < 0) {
        incorrectAnswers++;
        displayIncorrect();
    } else if (userSelection >= 0) {
        correctAnswers++;
        displayCorrect();
    }

    fetchData(displayData);
}

/** Helper function to display (update) incorrect number on the page */
function displayIncorrect() {
    document.getElementById("incorrectSpan").innerHTML = incorrectAnswers.toString();
}

/** Helper function to display (update) correct number on the page */
function displayCorrect() {
    document.getElementById("correctSpan").innerHTML = correctAnswers.toString();
}

/** The function to handle on `Update Character` button click event */
function onUpdateClick() {
    fetchData(displayUpdateForm);
}

/** The function to be executed while fetching in .then.
 * Accepts the json element and displays all character to user.
 *
 * @param json object with all characters info
 */
function displayUpdateForm(json) {
    GAME_CANVAS.style.display = "none";
    UPDATE_FORM.style.display = "block";
    CHAR_INFO.style.display = "none";
    for (let i = 0; i < json.length; i++) {
        let charName = json[i]["fullName"];
        UPDATE_FORM.innerHTML +=
            '<button class="list-group-item charButtons" onclick="fetchCharacterById(' + i + ')">' + charName + '</button>';
    }
}

/** Receives json object and based on that data displays
 * the character information on the page in input fields to future editing.
 *
 * @param json object with single character info
 */
function displayCharacterToUpdate(json) {
    GAME_CANVAS.style.display = "none";
    UPDATE_FORM.style.display = "none";
    CHAR_INFO.style.display = "block";

    // add info from json to containers
    document.getElementById("charId").value = json.id;
    document.getElementById("charFirstName").value = json["firstName"];
    document.getElementById("charLastName").value = json["lastName"];
    document.getElementById("charFullName").value = json["fullName"];
    document.getElementById("charImageUrl").value = json["imageUrl"];

    document.getElementById("charImage").src = json["imageUrl"];
}

/** The function which sends POST request to https://thronesapi.com/api/v2/Characters endpoint.
 * The request body must contain information to be updated to API.
 *
 */
function saveData() {
    let charId = document.getElementById("charId").value;
    let charFirstName = document.getElementById("charFirstName").value;
    let charLastName = document.getElementById("charLastName").value;
    let charFullName = document.getElementById("charFullName").value;
    let charImageUrl = document.getElementById("charImageUrl").value;

    let body = JSON.stringify({
        id: charId,
        firstName: charFirstName,
        lastName: charLastName,
        fullName: charFullName,
        imageUrl: charImageUrl,
    });

    let uri = "https://thronesapi.com/api/v2/Characters";
    let params = {
        method: "POST",
        mode: "cors",
        headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
        },
        body: body,
    };

    fetch(uri, params)
        .then(data => {
            console.log(data);
        })
}

/** The healer function to get random number between 0 and max
 *
 * @param max the maximum possible value
 * @return {number} the integer between 0 and max.
 */
function getRandom(max) {
    return Math.floor(Math.random() * max);
}