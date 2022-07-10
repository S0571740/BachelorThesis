let video;
let poseNet;
let pose;
let skeleton;

function setup() {
	createCanvas(640, 480);
	video = createCapture(VIDEO);
	video.hide();
	poseNet = ml5.poseNet(video, modelLoaded);
	poseNet.on("pose", gotPoses);
	console.log(video.width, video.height);
}

function gotPoses(poses) {
	if (poses.length > 0) {
		pose = poses[0].pose;
		skeleton = poses[0].skeleton;
	}
}

function modelLoaded() {
	console.log("ready");
}

function draw() {
	image(video, 0, 0, 640, 480);
	if (pose) {
		drawPose();
	}
	if (skeleton) {
		drawSkeleton();
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
