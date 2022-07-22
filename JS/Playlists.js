const availableExercisesNames = ["Kniebeugen", "Planking", "Yoga1"];
const loadedExercises = [];
const lookUp = new Map();

const playlists = JSON.parse(localStorage.getItem("playlists"), reviver);

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

function createDivsPlaylist(playlistName, playlistExercises) {
	let titel = playlistName;
	let exercises = "";
	let exerciseNames = [];
	for (let i = 0; i < playlistExercises.length; i++) {
		exercises += createDivsExercises(loadedExercises[lookUp.get(playlistExercises[i])], playlistName);
		if(i == 0){
			exerciseNames.push("['" + playlistExercises[i] + "'");
		}
		else{
			exerciseNames.push("'" + playlistExercises[i] + "'");
		}
	}
	exerciseNames.push("]");
	console.log(exerciseNames);
	let playlistStartButton = `<button type="button" class="playlistStartButton" onClick="startPlaylistFunction(${exerciseNames})")>Start this playlist</button>`;
	let playlistContainer = `<div class="playlistContainer" id="${playlistName}Container">${playlistStartButton}${exercises}</div>`;
	return playlistContainer;
}

function createDivsExercises(exercise, playlistName) {
	let img = `<img class="image" src="https://via.placeholder.com/150">`;
	let title = `<h1 class="title">${exercise.name}</h1>`;
	let trainedAreas = `<p class="areas">Trains: ${exercise.trainedAreas}</p>`;
	let repetitions = `<p class="repetitions">${exercise.repetitions} repetitions, each ${exercise.duration}</p>`;
	let startButton = `<button type="button" class="startButton" onClick="startFunction('${exercise.name}')">Start single exercise</button>`;
	let exerciseContainer = `<div class="exerciseContainer" id="${playlistName}${exercise.name}Container">${img}${title}${repetitions}${trainedAreas}${startButton}</div>`;
	return exerciseContainer;
}

async function startUp() {
	await loadExercises();
	let divs = "";
	playlists.forEach(function (value, key) {
		divs += createDivsPlaylist(key, value);
	});
	allElement.innerHTML = divs;
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

function startFunction(name) {
	let playlist = new Array();
	playlist.push(name);
	localStorage.setItem("exercising", JSON.stringify(playlist, replacer));
	window.location.href = "http://127.0.0.1:5500/HTML/Exercise.html";
}

function startPlaylistFunction (exerciseArray) {
	localStorage.setItem("exercising", JSON.stringify(exerciseArray, replacer));
	window.location.href = "http://127.0.0.1:5500/HTML/Exercise.html";
}
startUp();
