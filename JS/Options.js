var audio = new Audio();

function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev, el) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	if (el.id === "playlistSongs") {
		el.insertBefore(
			document.getElementById(data),
			document.getElementById("saveAndStartButton")
		);
	} else {
		el.appendChild(document.getElementById(data));
	}
}

function startUp() {
	startMusic();
	adjustBackground();
}

function encodeImageFileAsURL(element) {
	let file = element.files[0];
	let reader = new FileReader();
	reader.onloadend = function () {
		const body = document.querySelector("body");
		let url = "url('" + reader.result.replace(/(\r\n|\n|\r)/gm, "") + "')";
		localStorage.setItem("backgroundImage", url);
		body.style.backgroundImage = localStorage.getItem(
			"backgroundImage",
			reviver
		);
		body.style.backgroundSize = "cover";
		body.style.backgroundPosition = "center";
		body.style.backgroundRepeat = "no-repeat";
	};
	reader.readAsDataURL(file);
}

function changeSong(songName) {
	audio.src = "/../Assets/" + songName + ".mp3";
	localStorage.setItem("backgroundMusic", songName);
	audio.play();
}

function testSong(songName) {
	audio.src = "/../Assets/" + songName + ".mp3";
	audio.play();
}

function createPlaylist() {
	let addedSongs = document.querySelector("#playlistSongs").children;
	let savedSongs = new Array();
	for (let i = 1; i < addedSongs.length - 1; i++) {
		savedSongs.push(addedSongs[i].id);
	}
	if (savedSongs.length < 1) {
		audio.pause();
		alert("Music playlist has been deleted. No more music will be played");
		localStorage.removeItem("backgroundMusic");
	}
	else {
		localStorage.setItem("backgroundMusic", JSON.stringify(savedSongs, replacer));
		alert("Music playlist was updated. Music will continue to play");
		startMusic();
	}
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

startUp();

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
