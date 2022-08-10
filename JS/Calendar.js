// see https://github.com/lashaNoz/Calendar

const date = new Date();
var audio = new Audio();

const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function startUp() {
	startMusic();
	adjustBackground();
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

const trainedDaysOfCurrentMonth =
	JSON.parse(localStorage.getItem("trainedDays"), reviver) === null
		? new Array()
		: JSON.parse(localStorage.getItem("trainedDays"), reviver);

const renderCalendar = () => {
	date.setDate(1);

	const monthDays = document.querySelector(".days");

	const lastDay = new Date(
		date.getFullYear(),
		date.getMonth() + 1,
		0
	).getDate();

	const prevLastDay = new Date(
		date.getFullYear(),
		date.getMonth(),
		0
	).getDate();

	const firstDayIndex = date.getDay();

	const lastDayIndex = new Date(
		date.getFullYear(),
		date.getMonth() + 1,
		0
	).getDay();

	const nextDays = 7 - lastDayIndex - 1;

	document.querySelector(".date h1").innerHTML = months[date.getMonth()];

	let days = "";

	for (let x = firstDayIndex; x > 0; x--) {
		days += `<div class="prev-date">${prevLastDay - x + 1}</div>`;
	}

	for (let i = 1; i <= lastDay; i++) {
		if (
			i === new Date().getDate() &&
			date.getMonth() === new Date().getMonth()
		) {
			if (trainedDaysOfCurrentMonth.indexOf(i) != -1) {
				days += `<div class="todayTrained">${i}</div>`;
			} else {
				days += `<div class="today">${i}</div>`;
			}
		} else {
			if (
				trainedDaysOfCurrentMonth.indexOf(i) != -1 &&
				date.getMonth() === new Date().getMonth()
			) {
				days += `<div class="trained">${i}</div>`;
			} else {
				days += `<div>${i}</div>`;
			}
		}
	}

	for (let j = 1; j <= nextDays; j++) {
		days += `<div class="next-date">${j}</div>`;
		monthDays.innerHTML = days;
	}
};

document.querySelector(".prev").addEventListener("click", () => {
	date.setMonth(date.getMonth() - 1);
	renderCalendar();
});

document.querySelector(".next").addEventListener("click", () => {
	date.setMonth(date.getMonth() + 1);
	renderCalendar();
});

renderCalendar();

function exportFunction() {
	let exportData = "";
	for (let i = 0; i < trainedDaysOfCurrentMonth.length; i++) {
		let dd = padNumber(trainedDaysOfCurrentMonth[i]);
		let mm = padNumber(date.getMonth() + 1);
		let yyyy = date.getFullYear();
		exportData += yyyy + "-" + mm + "-" + dd + "\n";
	}
	if(exportData === ""){
		alert("No data available. Please Exercise atleast one day, before trying to export")
	}
	else{
		save(exportData);
	}
}

function padNumber(number) {
	if (number < 10) {
		return "0" + number;
	} else {
		return number;
	}
}

function save(data) {
	let downloadElement = document.createElement("a");
	let month = months[date.getMonth()];
	downloadElement.download = "export-" + month + ".txt";

	let textFile = new Blob([data], {
		type: "text/plain",
	});
	console.log(textFile);
	downloadElement.href = window.URL.createObjectURL(textFile);
	downloadElement.click();
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
