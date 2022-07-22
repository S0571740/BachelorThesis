const availableExercisesNames = ["Kniebeugen", "Planking", "Yoga1"];
const loadedExercises = [];
const lookUp = new Map();

const allElement = document.querySelector(".all");

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
	let title = `<h1 class="title">${exercise.name}</h1>`;
	let trainedAreas = `<p class="areas">Trains: ${exercise.trainedAreas}</p>`;
	let repetitions = `<p class="repetitions">${exercise.repetitions} repetitions, each ${exercise.duration}</p>`;
	let playlistLabel = `<label class="playlistLabel">Add to playlist:</label>`;
	let playlistText = `<input type="text" class="playlistText" placeholder="Name of the playlist">`;
	let playlistButton = `<button type="button" class="playlistButton" onClick="addFunction('${exercise.name}')">Add to playlist</button>`;
	let startButton = `<button type="button" class="startButton" onClick="startFunction('${exercise.name}')">Start</button>`;
	let container = `<div class="container" id="${exercise.name}Container">${img}${title}${repetitions}${trainedAreas}${playlistLabel}${playlistText}${playlistButton}${startButton}</div>`;
	return container;
}

async function startUp() {
	await loadExercises();
	let divs = "";
	for (let i = 0; i < loadedExercises.length; i++) {
		divs += createDivs(loadedExercises[i]);
	}
	allElement.innerHTML = divs;
}

function startFunction(name) {
	let playlist = new Array();
	playlist.push(name);
	localStorage.setItem("exercising", JSON.stringify(playlist, replacer));
	window.location.href = "http://127.0.0.1:5500/HTML/Exercise.html";
}

function addFunction(exerciseName) {
	let playlists = JSON.parse(localStorage.getItem("playlists"), reviver);
	if (playlists === null) {
		console.log("created new map");
		playlists = new Map();
	}

	let container = document.querySelector("#" + exerciseName + "Container");
	let playlistName = container.getElementsByClassName("playlistText")[0].value;

	let playlist = undefined;
	console.log(playlists);
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
			value: Array.from(value.entries())
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
