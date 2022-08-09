const availableExercisesNames = new Array();
const loadedExercises = [];
const lookUp = new Map();

const date = new Date();
var audio = new Audio();

var countdown = 10;
var totalScore = 0;
var totalAccuracy = new Array();

let exerciseNames = JSON.parse(localStorage.getItem("exercising"), reviver);
var currentExerciseName;
var currentExerciseObject;
const exercises = new Array();

let font;
let fontSize = 40;
const canvasHeight = 480;
const canvasWidth = 640;
let video;
let poseNet;
let pose;
let skeleton;

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

async function getExercise(name) {
	let response = await fetch("./../Exercises/" + name + ".json");
	if (response.ok) {
		let json = await response.json();
		return json;
	} else {
		alert("could'nt get Exercises/" + name + ".json");
	}
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

function preload() {
	font = loadFont("../assets/SourceSansPro-Regular.otf");
}

async function startUp() {
	startMusic();
	adjustBackground();
	await loadExercises();
	if (Array.isArray(exerciseNames)) {
		for (let i = 0; i < exerciseNames.length; i++) {
			exercises.push(loadedExercises[lookUp.get(exerciseNames[i])]);
		}
		exercises.reverse();
	}
	setButtonFunctions();
}

async function setup() {
	createCanvas(canvasWidth, canvasHeight);

	textFont(font);
	textSize(fontSize);
	textAlign(CENTER, BOTTOM);

	video = createCapture(VIDEO);
	video.hide();
	poseNet = ml5.poseNet(video, modelLoaded);
	poseNet.on("pose", gotPoses);

	await startUp();
}

function completeExercises() {
	let trainedDaysOfCurrentMonth = JSON.parse(
		localStorage.getItem("trainedDays"),
		reviver
	);
	let accuracy = 0;
	totalAccuracy.forEach((acc) => (accuracy += acc / totalAccuracy.length));
	if (
		trainedDaysOfCurrentMonth[trainedDaysOfCurrentMonth.length - 1] !=
		date.getDate()
	) {
		trainedDaysOfCurrentMonth.push(date.getDate());
		localStorage.setItem(
			"trainedDays",
			JSON.stringify(trainedDaysOfCurrentMonth, replacer)
		);

		alert(
			"all done, calendar has been updated\nYour score is " +
				totalScore +
				", with an accuracy of " +
				Math.round(accuracy) +
				"%"
		);
	} else {
		alert(
			"all done\nYour score is " +
				totalScore +
				", with an accuracy of " +
				Math.round(accuracy) +
				"%"
		);
	}
}

function updateErrorLog(correctionTexts) {
	correctionTexts = correctionTexts.filter((textline, index) => {
		return correctionTexts.indexOf(textline) === index;
	});
	let errorLog = document.querySelector(".errorLog");
	if (correctionTexts.length > 0) {
		errorLog.innerHTML = "";
		for (let i = 0; i < correctionTexts.length; i++) {
			errorLog.innerHTML += correctionTexts[i] + `<br>`;
		}
	} else {
		errorLog.innerHTML = "Exercise was executed perfectly";
	}
}

function updateScoreAndAccuracy(failed, perfect, notFound) {
	let scoreElement = document.querySelector(".score");
	let score = 0;
	console.log(failed);
	console.log(perfect);
	if (failed + perfect !== 0) {
		score = perfect / (failed + perfect);
	}
	totalScore += score;
	totalAccuracy.push(
		((perfect + failed) / (perfect + failed + notFound)) * 100
	);
	let accuracy = 0;
	totalAccuracy.forEach((acc) => (accuracy += acc / totalAccuracy.length));
	scoreElement.innerHTML =
		"Current Score: " +
		totalScore +
		`<br>` +
		"Total accuracy: " +
		Math.round(accuracy) +
		"%";
}

function gotPoses(poses) {
	if (poses.length == 1) {
		pose = poses[0].pose;
		skeleton = poses[0].skeleton;
	} else if (poses.length > 1) {
		let nearestIndex = 0;
		let shortestDistance = 12000;

		for (let i = 0; i < pose.length; i++) {
			if (
				Math.abs(canvasWidth / 2 - poses[i].pose.nose.position.x) <
				shortestDistance
			) {
				nearestIndex = i;
				shortestDistance = Math.abs(
					canvasWidth / 2 - poses[i].pose.nose.position.x
				);
			}
		}
		pose = poses[nearestIndex].pose;
		skeleton = poses[nearestIndex].skeleton;
	}
}

function modelLoaded() {
	console.log("ready");
}

/*----------------------------------------------------------------------------------------------------------------------------------------------\\
||															Music and Background																||
\\----------------------------------------------------------------------------------------------------------------------------------------------*/

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

/*----------------------------------------------------------------------------------------------------------------------------------------------\\
||																	Draw																		||
\\----------------------------------------------------------------------------------------------------------------------------------------------*/

function draw() {
	push();
	scale(-1, 1);
	translate(-canvasWidth, 0);
	image(video, 0, 0, canvasWidth, canvasHeight);
	pop()
	
	if (pose) {
		drawPose();
	}
	if (skeleton) {
		drawSkeleton();
	}
	writeWord(currentExerciseName, canvasHeight - 40);
}

function drawPose() {
	push();
	scale(-1, 1);
	translate(-canvasWidth, 0);
	for (let i = 0; i < pose.keypoints.length; i++) {
		let x = pose.keypoints[i].position.x;
		let y = pose.keypoints[i].position.y;
		fill(0, 255, 0);
		ellipse(x, y, 16, 16);
	}
	pop()
}

function drawSkeleton() {
	push();
	scale(-1, 1);
	translate(-canvasWidth, 0);
	for (let i = 0; i < skeleton.length; i++) {
		let a = skeleton[i][0].position;
		let b = skeleton[i][1].position;
		strokeWeight(4);
		stroke(0, 0, 0);
		line(a.x, a.y, b.x, b.y);
	}
	pop()
}

function writeWord(word, heigth) {
	text(word, canvasWidth / 2, heigth);
}

/*----------------------------------------------------------------------------------------------------------------------------------------------\\
||																	TBD															s				||
\\----------------------------------------------------------------------------------------------------------------------------------------------*/

function evaluateConstraint(constraints) {
	let notFound = 0;
	let failed = 0;
	let perfect = 0;
	let correctionTexts = new Array();
	for (let i = 0; i < constraints.length; i++) {							// Iterriere über alle Constraints
		let partA = translatePart(constraints[i][0]);
		let partB = translatePart(constraints[i][2]);
		if (!isConfident(partA) || !isConfident(partB)) {					// Überprüfe ob die beiden Parts gefunden werden
			notFound++;														// Ansonsten gebe eine Nachricht aus und verringere die Genauigkeit
			if (!isConfident(partA)) {
				correctionTexts.push("couldn't find " + constraints[i][0]);
			}
			if (!isConfident(partB)) {
				correctionTexts.push("couldn't find " + constraints[i][2]);
			}
		} else if (															// Wenn beide Parts gefunden wurden, der Constraint allerdings fehlschlägt
			isConfident(partA) &&											// gib eine Nachricht aus und verringere den Punktestand
			isConfident(partB) &&
			!translateFunction(constraints[i][1], partA, partB)
		) {
			failed++;
			correctionTexts.push(
				"Your " +
					constraints[i][0] +
					" we're not " +
					constraints[i][1] +
					" your " +
					constraints[i][2]
			);
		} else if (															// Wenn sowohl beide Parts gefunden werden, als auch der Constraint richtig
			isConfident(partA) &&											// evaluiert wird, erhöhe den Punktestand
			isConfident(partB) &&
			translateFunction(constraints[i][1], partA, partB)
		) {
			perfect++;
		}
	}
	updateErrorLog(correctionTexts);
	updateScoreAndAccuracy(failed, perfect, notFound);
}

/*----------------------------------------------------------------------------------------------------------------------------------------------\\
||																Translation																		||
\\----------------------------------------------------------------------------------------------------------------------------------------------*/

function translateFunction(functionName, partA, partB) {
	// if(partA === "everything" && partB === "everything"){

	// }
	// else if(partA === "everything" && partB != "everything"){

	// }
	// else if(partA != "everything" && partB === "everything"){

	// }
	// else{

	// }

	switch (functionName) {
		case "above":
			return above(partA, partB);
		case "below":
			return below(partA, partB);
		case "horizontalTo":
			return horizontalTo(partA, partB);
		case "verticalTo":
			return verticalTo(partA, partB);
	}
}

function translatePart(part) {
	if (Array.isArray(part)) {
		return translatePartArray(part);
	}
	switch (part) {
		case "leftAnkle":
			return pose.leftAnkle;
		case "leftEar":
			return pose.leftEar;
		case "leftElbow":
			return pose.leftElbow;
		case "leftEye":
			return pose.leftEye;
		case "leftHip":
			return pose.leftHip;
		case "leftKnee":
			return pose.leftKnee;
		case "leftShoulder":
			return pose.leftShoulder;
		case "leftWrist":
			return pose.leftWrist;
		case "nose":
			return pose.nose;
		case "rightAnkle":
			return pose.rightAnkle;
		case "rightEar":
			return pose.rightEar;
		case "rightElbow":
			return pose.rightElbow;
		case "rightEye":
			return pose.rightEye;
		case "rightHip":
			return pose.rightHip;
		case "rightKnee":
			return pose.rightKnee;
		case "rightShoulder":
			return pose.rightShoulder;
		case "rightWrist":
			return pose.rightWrist;
		case "ankles":
			return averagePose([pose.leftAnkle, pose.rightAnkle]);
		case "ears":
			return averagePose([pose.leftEar, pose.rightEar]);
		case "elbows":
			return averagePose([pose.leftElbow, pose.rightElbow]);
		case "eyes":
			return averagePose([pose.leftEye, pose.rightEye]);
		case "head":
			return averagePose([
				pose.leftEar,
				pose.rightEar,
				pose.leftEye,
				pose.rightEye,
				pose.nose,
			]);
		case "hips":
			return averagePose([pose.leftHip, pose.rightHip]);
		case "knees":
			return averagePose([pose.leftKnee, pose.rightKnee]);
		case "shoulders":
			return averagePose([pose.leftShoulder, pose.rightShoulder]);
		case "wrists":
			return averagePose([pose.leftWrist, pose.rightWrist]);
	}
}

function averagePose(array) {
	let averageX = 0;
	let averageY = 0;
	let averageConfidence = 0;

	for (let i = 0; i < array.length; i++) {
		averageX += array[i].x;
		averageY += array[i].y;
		averageConfidence += array[i].confidence;
	}

	return {
		x: averageX / array.length,
		y: averageY / array.length,
		confidence: averageConfidence / array.length,
	};
}

function translatePartArray(array) {
	let returnArray = new Array();
	for (let i = 0; i < array.length; i++) {
		returnArray.push(translatePart(array[i]));
	}
	return returnArray;
}

function everythingWithout(without) {
	const indeces = [
		"nose",
		"leftEye",
		"rightEye",
		"leftEar",
		"rightEar",
		"leftShoulder",
		"rightShoulder",
		"leftElbow",
		"rightElbow",
		"leftWrist",
		"rightWrist",
		"leftHip",
		"rightHip",
		"leftKnee",
		"rightKnee",
		"leftAnkle",
		"rightAnkle",
	];
	switch (without) {
		case "ankles":
			without = [indeces.indexOf("leftAnkle"), indeces.indexOf("rightAnkle")];
			break;
		case "ears":
			without = [indeces.indexOf("leftEar"), indeces.indexOf("rightEar")];
			break;
		case "elbows":
			without = [indeces.indexOf("leftElbow"), indeces.indexOf("rightElbow")];
			break;
		case "eyes":
			without = [indeces.indexOf("leftEye"), indeces.indexOf("rightEye")];
			break;
		case "head":
			without = [
				indeces.indexOf("leftEar"),
				indeces.indexOf("rightEar"),
				indeces.indexOf("leftEye"),
				indeces.indexOf("rightEye"),
				indeces.indexOf("nose"),
			];
			break;
		case "hip":
			without = [indeces.indexOf("leftHip"), indeces.indexOf("rightHip")];
			break;
		case "knees":
			without = [indeces.indexOf("leftKnee"), indeces.indexOf("rightKnee")];
			break;
		case "shoulder":
			without = [
				indeces.indexOf("leftShoulder"),
				indeces.indexOf("rightShoulder"),
			];
			break;
		case "wrists":
			without = [indeces.indexOf("leftWrist"), indeces.indexOf("rightWrist")];
			break;
	}
	let everythingWithoutArray = new Array();
	for (let i = 0; i < pose.keypoints.length; i++) {
		if (without.indexOf(i) == -1) {
			everythingWithoutArray.push({
				x: pose.keypoints[i].position.x,
				y: pose.keypoints[i].position.y,
				confidence: pose.keypoints[i].score,
			});
		}
	}
	return everythingWithoutArray;
}

function isConfident(part) {
	return part.confidence >= 0.5;
}

function horizontalTo(partA, partB) {
	yOffSet = Math.abs(partA.y - partB.y);
	return yOffSet <= video.height / 10;
}

function verticalTo(partA, partB) {
	xOffSet = Math.abs(partA.x - partB.x);
	return xOffSet <= video.width / 10;
}

function above(partA, partB) {
	return partA.y < partB.y;
}

function below(partA, partB) {
	return partA.y > partB.y;
}

function centerOf(part) {
	if (Array.isArray(part) && part[0].x != undefined) {
		let centerX = 0;
		let centerY = 0;
		for (let i = 0; i < part.length; i++) {
			centerX += part[i].x;
			centerY += part[i].y;
		}
		return { x: centerX / part.length, y: centerY / part.length };
	}
}

/*----------------------------------------------------------------------------------------------------------------------------------------------\\
||																	Buttons																		||
\\----------------------------------------------------------------------------------------------------------------------------------------------*/

function setButtonFunctions() {
	document.querySelector("#startButton").onclick = startButtonFunction;
	document.querySelector("#loadButton").onclick = loadButtonFunction;
	document.querySelector("#exitButton").onclick = exitButtonFunction;
}

function loadButtonFunction() {
	let instructions = document.querySelector(".nextExerciseInstructions");
	let startButton = document.querySelector("#startButton");
	let loadButton = document.querySelector("#loadButton");

	currentExerciseObject = exercises.pop();
	instructions.innerHTML = currentExerciseObject.instructions[0];
	startButton.hidden = false;
	loadButton.hidden = true;
}

function startButtonFunction() {
	let startButton = document.querySelector("#startButton");
	let instructions = document.querySelector(".nextExerciseInstructions");

	startButton.hidden = true;

	let durationStringArray = currentExerciseObject.duration.split(":");
	let duration = +durationStringArray[0] * 60 + +durationStringArray[1];
	let divider = currentExerciseObject.constraints.length;
	let instructionTexts = currentExerciseObject.instructions.reverse();
	let constraints = currentExerciseObject.constraints.reverse();
	instructionTexts.pop();

	timeLeft = countdown = duration / divider;

	localStorage.setItem("exercising", JSON.stringify(exercises, replacer));
	currentExerciseName = currentExerciseObject.name;
	instructions.innerHTML = instructionTexts.pop();

	let timerElement = document.querySelector(".base-timer");
	timerElement.hidden = false;
	timerInterval = setInterval(setTimer, 1000, constraints);
	let evaluationInteval = setInterval(
		function (constraints, instructionTexts) {
			let instructions = document.querySelector(".nextExerciseInstructions");

			evaluateConstraint(constraints.pop());

			if (instructionTexts.length >= 1) {
				instructions.innerHTML = instructionTexts.pop();
			}
			if (constraints.length <= 0) {
				instructions.innerHTML = "";
				if (exercises.length < 1) {
					completeExercises();
					document.querySelector("#exitButton").hidden = false;
				} else {
					document.querySelector("#loadButton").hidden = false;
				}
				window.clearInterval(evaluationInteval);
			}
		},
		countdown * 1000,
		constraints,
		instructionTexts
	);
}

function exitButtonFunction() {
	window.location.href =
		"http://loquacious-cat-52d8b6.netlify.app/HTML/" +
		localStorage.getItem("lastLocation") +
		".html";
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

/*----------------------------------------------------------------------------------------------------------------------------------------------\\
||																	Timer																		||
||															Credit: Mateusz Rybczonec															||
\\----------------------------------------------------------------------------------------------------------------------------------------------*/

const FULL_DASH_ARRAY = 283;

let timePassed = 0;
let timeLeft = countdown;
let timerInterval = null;

function setTimer(constraints) {
	timePassed = timePassed += 1;
	timeLeft = countdown - timePassed;
	document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
	setCircleDasharray();
	if (timeLeft === 0) {
		onTimesUp(constraints);
	}
}

function onTimesUp(constraints) {
	timePassed = 0;
	if (constraints.length <= 1) {
		clearInterval(timerInterval);
		document.querySelector(".base-timer").hidden = true;
	}
}

function formatTime(time) {
	const minutes = Math.floor(time / 60);
	let seconds = time % 60;

	if (seconds < 10) {
		seconds = `0${seconds}`;
	}

	return `${minutes}:${seconds}`;
}

function calculateTimeFraction() {
	const rawTimeFraction = timeLeft / countdown;
	return rawTimeFraction - (1 / countdown) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
	const circleDasharray = `${(
		calculateTimeFraction() * FULL_DASH_ARRAY
	).toFixed(0)} 283`;
	document
		.getElementById("base-timer-path-remaining")
		.setAttribute("stroke-dasharray", circleDasharray);
}
