const availableExercisesNames = new Array();
const loadedExercises = [];
const lookUp = new Map();

const playlists = JSON.parse(localStorage.getItem("playlists"), reviver);

const allElement = document.querySelector(".all");
var audio = new Audio();

async function loadExercises() {
	let exerciseNames = loadExerciseNames();
	exerciseNames = await exerciseNames;
	for (let i = 0; i < exerciseNames.length; i++) {
		availableExercisesNames.push(exerciseNames[i]);
	}
	let userCreatedExercises = JSON.parse(
		localStorage.getItem("userCreatedExercises"),
		reviver
	);
	for (let i = 0; i < availableExercisesNames.length; i++) {
		let temp = getExercise(availableExercisesNames[i]);
		temp = await temp;
		loadedExercises.push(temp);
		lookUp.set(temp.name, loadedExercises.indexOf(temp));
	}
	if (userCreatedExercises != null) {
		userCreatedExercises.forEach((exercise) =>
			loadUserCreatedExercise(exercise)
		);
	}
}

function loadUserCreatedExercise(exercise) {
	loadedExercises.push(exercise);
	lookUp.set(exercise.name, loadedExercises.indexOf(exercise));
}

async function loadExerciseNames() {
	let response = await fetch("./../Assets/AvailableExercises.json");
	if (response.ok) {
		let json = await response.json();
		return json;
	} else {
		alert("could'nt find Assets/AvailableExercises.json");
	}
}

async function getExercise(name) {
	let response = await fetch("./../Exercises/" + name + ".json");
	if (response.ok) {
		let json = await response.json();
		return json;
	} else {
		alert("could'nt get Exercises/" + name + ".json");
	}
}

function createDivsPlaylist(playlistName, playlistExercises) {
	let titel = playlistName;
	let totalDuration = 0;
	let exercises = "";
	let exerciseNames = [];
	for (let i = 0; i < playlistExercises.length; i++) {
		let exercise = loadedExercises[lookUp.get(playlistExercises[i])];
		totalDuration
		exercises += createDivsExercises(
			exercise,
			playlistName
		);
		totalDuration += exercise.duration;
		if (i == 0) {
			exerciseNames.push("['" + playlistExercises[i] + "'");
		} else {
			exerciseNames.push("'" + playlistExercises[i] + "'");
		}
	}
	exerciseNames.push("]");
	let playlistStartButton = `<button type="button" class="playlistStartButton" onClick="startPlaylistFunction(${exerciseNames})")>${playlistName}: Start this playlist</button>`;
	let label = `<label class="totalDuration">${toTimeFormat(totalDuration)}</label>`
	let playlistContainer = `<div class="playlistContainer" id="${playlistName}Container">${playlistStartButton}${label}${exercises}</div>`;
	return playlistContainer;
}

function createDivsExercises(exercise, playlistName) {
	let img = `<img class="image" src="../Assets/${exercise.name}.gif">`;
	let title = `<h2 class="title">${exercise.name}</h2>`;
	let instructionText = "";
	exercise.instructions.forEach(
		(paragragh) => (instructionText += paragragh + `<br/>`)
	);
	let instructions = `<label class="instructions">Exercise instructions: <br/>${instructionText}</label>`;
	let trainedAreas = `<p class="areas">Trains: ${exercise.trainedAreas}</p>`;
	let duration = `<p class="duration">Exercise duration: ${exercise.duration}</p>`;
	let startButton = `<button type="button" class="startButton" onClick="startFunction('${exercise.name}')">Start single exercise</button>`;
	let exerciseContainer = `<div class="exerciseContainer" id="${playlistName}${exercise.name}Container">${img}${title}${instructions}${duration}${trainedAreas}${startButton}</div>`;
	return exerciseContainer;
}

function toTimeFormat(integerTime){
	let minutes = 0;
	let seconds = 0;
	while(integerTime >= 60){
		integerTime -= 60;
		minutes++;
	}
	seconds = integerTime;
	if(minutes < 10){
		minutes = "0" + minutes;
	}
	if(seconds < 10){
		seconds = "0" + seconds;
	}
	return minutes + ":" + seconds;
}

async function startUp() {
	localStorage.setItem("lastLocation", "exerciseplaylists");
	startMusic();
	adjustBackground();
	await loadExercises();
	let divs = "";
	if (playlists != null) {
		playlists.forEach(function (value, key) {
			divs += createDivsPlaylist(key, value);
		});
	} else {
		let a = `<a href="http://loquacious-cat-52d8b6.netlify.app/HTML/Exercises.html">exercises</a>`;
		divs = `<h1>No Playlists created yet. Head over to ${a} and create a playlist.</h1>`;
	}
	allElement.innerHTML = divs;
}

function startMusic() {
	if (localStorage.getItem("backgroundMusic", reviver)) {
		audio.onended = onEndedFunction;
		audio.src =
			"/../Assets/" +
			JSON.parse(localStorage.getItem("backgroundMusic", reviver))[0] +
			".mp3";
		audio.play();
	} else {
		audio.pause();
	}
}

function onEndedFunction() {
	let songs = JSON.parse(localStorage.getItem("backgroundMusic", reviver));
	let lastSong = songs.shift();
	songs.push(lastSong);
	localStorage.setItem("backgroundMusic", JSON.stringify(songs, replacer));
	audio.src = "/../Assets/" + songs[0] + ".mp3";
	audio.play();
}

function adjustBackground() {
	if (localStorage.getItem("backgroundImage", reviver)) {
		let body = document.querySelector("body");
		body.style.backgroundImage = localStorage.getItem(
			"backgroundImage",
			reviver
		);
		body.style.backgroundSize = "cover";
		body.style.backgroundPosition = "center";
		body.style.backgroundRepeat = "no-repeat";
	}
}

//see https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
function replacer(key, value) {
	if (value instanceof Map) {
		return {
			dataType: "Map",
			value: Array.from(value.entries()),
		};
	} else {
		return value;
	}
}

function reviver(key, value) {
	if (typeof value === "object" && value !== null) {
		if (value.dataType === "Map") {
			return new Map(value.value);
		}
	}
	return value;
}

function startFunction(name) {
	let playlist = new Array();
	playlist.push(name);
	localStorage.setItem("exercising", JSON.stringify(playlist, replacer));
	window.location.href = "http://loquacious-cat-52d8b6.netlify.app/HTML/Exercise.html";
}

function startPlaylistFunction(exerciseArray) {
	localStorage.setItem("exercising", JSON.stringify(exerciseArray, replacer));
	window.location.href = "http://loquacious-cat-52d8b6.netlify.app/HTML/Exercise.html";
}
startUp();
