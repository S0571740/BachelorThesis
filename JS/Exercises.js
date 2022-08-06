const availableExercisesNames = ["Squats", "Planking", "WarriorII"];
const loadedExercises = [];
const lookUp = new Map();

const allElement = document.querySelector(".all");
var audio = new Audio();

async function loadExercises() {
	for (let i = 0; i < availableExercisesNames.length; i++) {
		let temp = getExercise(availableExercisesNames[i]);
		temp = await temp;
		loadedExercises.push(temp);
		lookUp.set(temp.name, loadedExercises.indexOf(temp));
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

function createDivs(exercise) {
	let img = `<img class="image" src="https://via.placeholder.com/150">`;
	let title = `<h2 class="title">${exercise.name}</h2>`;
	let instructionText = "";
	exercise.instructions.forEach(
		(paragragh) => (instructionText += paragragh + `<br/>`)
	);
	let instructions = `<label class="instructions">Exercise instructions: <br/>${instructionText}</label>`;
	let trainedAreas = `<p class="areas">Trains: ${exercise.trainedAreas}</p>`;
	let duration = `<p class="duration">Exercise duration: ${exercise.duration}</p>`;
	let playlistLabel = `<label class="playlistLabel">Add to playlist:</label>`;
	let playlistText = `<input type="text" class="playlistText" placeholder="Name of the playlist">`;
	let playlistButton = `<button type="button" class="playlistButton" onClick="addFunction('${exercise.name}')">Add to playlist</button>`;
	let playlist = `<div class="playlist">${playlistLabel}${playlistText}${playlistButton}</div>`;
	let startButton = `<button type="button" class="startButton" onClick="startFunction('${exercise.name}')">Start</button>`;
	let container = `<div class="container" id="${exercise.name}Container">${img}${title}${instructions}${duration}${trainedAreas}${playlist}${startButton}</div>`;
	return container;
}

async function startUp() {
	localStorage.setItem("lastLocation", "Exercises");
	startMusic();
	adjustBackground();
	await loadExercises();
	let divs = "";
	for (let i = 0; i < loadedExercises.length; i++) {
		divs += createDivs(loadedExercises[i]);
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

function startFunction(name) {
	let playlist = new Array();
	playlist.push(name);
	localStorage.setItem("exercising", JSON.stringify(playlist, replacer));
	window.location.href = "http://127.0.0.1:8000/HTML/Exercise.html";
}

function addFunction(exerciseName) {
	let playlists = JSON.parse(localStorage.getItem("playlists"), reviver);
	if (playlists === null) {
		playlists = new Map();
	}

	let container = document.querySelector("#" + exerciseName + "Container");
	let playlistName = container.getElementsByClassName("playlistText")[0].value;

	let playlist = undefined;
	if (playlists.get(playlistName) !== undefined) {
		playlist = playlists.get(playlistName);
	}

	if (playlist === undefined) {
		let playlist = new Array();
		playlist.push(exerciseName);
		playlists.set(playlistName, playlist);
		localStorage.setItem("playlists", JSON.stringify(playlists, replacer));
	} else {
		if (playlist.indexOf(exerciseName) === -1) {
			playlist.push(exerciseName);
			playlists.set(playlistName, playlist);
			localStorage.setItem("playlists", JSON.stringify(playlists, replacer));
		} else {
			alert("already in playlist");
		}
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

startUp();
