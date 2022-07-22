let font;
let fontSize = 40;

let exercise = "Yoga1";

const canvasHeight = 480;
const canvasWidth = 640;

let video;
let poseNet;
let pose;
let skeleton;

let correctionTexts = new Array();

function preload() {
	font = loadFont("assets/SourceSansPro-Regular.otf");
}

function setup() {
	createCanvas(canvasWidth, canvasHeight);

	textFont(font);
	textSize(fontSize);
	textAlign(CENTER, BOTTOM);

	video = createCapture(VIDEO);
	video.hide();
	poseNet = ml5.poseNet(video, modelLoaded);
	poseNet.on("pose", gotPoses);
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

function draw() {
	image(video, 0, 0, canvasWidth, canvasHeight);
	if (pose) {
		drawPose();
	}
	if (skeleton) {
		drawSkeleton();
	}
	writeWord(exercise, 0, 0, 0, canvasHeight - 40);
	if (correctionTexts.length > 0) {
		for (let i = 0; i < correctionTexts.length; i++) {
			writeWord(correctionTexts[i], 255, 0, 0, canvasHeight - 80 - i * 40);
		}
	}
}

function drawPose() {
	for (let i = 0; i < pose.keypoints.length; i++) {
		let x = pose.keypoints[i].position.x;
		let y = pose.keypoints[i].position.y;
		fill(0, 255, 0);
		ellipse(x, y, 16, 16);
	}
}

function drawSkeleton() {
	for (let i = 0; i < skeleton.length; i++) {
		let a = skeleton[i][0].position;
		let b = skeleton[i][1].position;
		strokeWeight(4);
		stroke(0, 0, 0);
		line(a.x, a.y, b.x, b.y);
	}
}

function writeWord(word, red, green, blue, heigth) {
	fill(red, green, blue);
	text(word, canvasWidth / 2, heigth);
}

function isConfident(part) {
	return part.confidence >= 0.5;
}

function horizontalTo(partA, partB) {
	// if(Array.isArray(partA) && Array.isArray(partB)){
	// 	for(let i = 0; i < partA.length; i++){

	// 	}
	// }
	// else if(Array.isArray(partA)){

	// }
	// else if(Array.isArray(partB)){

	// }
	yOffSet = Math.abs(partA.y - partB.y);
	return yOffSet <= video.height / 10;
}

function verticalTo(partA, partB) {
	xOffSet = Math.abs(partA.x - partB.x);
	return xOffSet <= video.width / 10;
}

function above(partA, partB) {
	return centerOf(partA)[1] > centerOf(partB)[1];
}

function below(partA, partB) {
	return partA.y < partB.y;
}

function centerOf(part) {
	if (Array.isArray(part) && part[0].x != undefined) {
		let centerX = 0;
		let centerY = 0;
		for (let i = 0; i < part.length; i++) {
			centerX += part[i].x;
			centerY += part[i].y;
		}
		return [{ x: centerX / part.length }, { y: centerY / part.length }];
	}
}

function readExercise(exercise) {
	let name = exercise.name;
	let trainedAreas = exercise.trainingAreas;
	let repetitions = exercise.repetitions;
	let duration = exercise.duration;
	let constraints = exercise.constraints;
	let array = new Array();
	for (let i = 0; i < constraints.length; i++) {
		let partA = translatePart(constraints[i][0]);
		let partB = translatePart(constraints[i][2]);
		if (
			isConfident(partA) &&
			isConfident(partB) &&
			!translateFunction(constraints[i][1], partA, partB)
		) {
			array.push(
				constraints[i][0] +
					" is not " +
					constraints[i][1] +
					" " +
					constraints[i][2]
			);
		}
		else if(!isConfident(partA) || !isConfident(partB)){
			if(!isConfident(partA)){
				array.push("can't find " + partA);
			}
			if(!isConfident(partB)){
				array.push("can't find " + partB);
			}
		}
	}
	correctionTexts = array;
}

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
			return [pose.leftAnkle, pose.rightAnkle];
		case "ears":
			return [pose.leftEar, pose.rightEar];
		case "elbows":
			return [pose.leftElbow, pose.rightElbow];
		case "eyes":
			return [pose.leftEye, pose.rightEye];
		case "head":
			return [
				pose.leftEar,
				pose.rightEar,
				pose.leftEye,
				pose.rightEye,
				pose.nose,
			];
		case "hips":
			return [pose.leftHip, pose.rightHip];
		case "knees":
			return [pose.leftKnee, pose.rightKnee];
		case "shoulders":
			return [pose.leftShoulder, pose.rightShoulder];
		case "wrists":
			return [pose.leftWrist, pose.rightWrist];
	}
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

async function getExercise(name) {
	let response = await fetch("./Exercises/" + name + ".json");
	if (response.ok) {
		let json = await response.json();
		return json;
	} else {
		alert("could'nt get Exercises/" + name + ".json");
	}
}

window.onkeyup = async function (keyPressed) {
	switch (keyPressed.keyCode) {
		case 32:
			if (pose != undefined) {
				let exerciseObject = getExercise(exercise);
				console.log(await exerciseObject);
				readExercise(await exerciseObject);
				// console.log("Pose: ");
				// readExercise(JSON.parse(Yoga1));
				// console.log(getExercises(exercise));
				// console.log(translatePart("everything"));
			} else {
				console.log("pose undefined");
			}
			break;
		case 49:
			exercise = "Yoga1";
			break;
		case 50:
			exercise = "Yoga2";
			break;
		case 51:
			exercise = "Yoga3";
			break;
		case 52:
			exercise = "Yoga4";
			break;
		case 53:
			exercise = "Yoga5";
			break;
		case 54:
			exercise = "Yoga6";
			break;
		case 55:
			exercise = "Yoga7";
			break;
		case 56:
			exercise = "Yoga8";
			break;
		case 57:
			exercise = "Yoga9";
			break;
	}
};
