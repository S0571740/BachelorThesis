In order to create your own Exercise, you have to complete two steps:
- create a Exercise.Json file
- add the file name to the AvailableExercise.json file

Json files (JavaScript Object Notation files) are text based files that should be accessable by almost every text editor.
An Json file consists of key - value pairs, whereas the key and values are seperated by a colon (":"). The keys and values in these Exercise.json files
are all saved as strings, which means, they need either a pair of single quotes or a pair of double quotes ("''" or """").
Some values (they will be highlighted) should be saved as so called arrays. Arrays are container for multiple values of the same type. These arrays are
encapsulated by a pair of rectangular brackets ("[]") and each value inside of the array is seperated by a comma (",").
The folowing example shows, how a Exercise.json file needs to look, to be used by the Application (the comments, encapsuled by "/* */" are only for
more information and don't need to be included in your Exercise.json):

{ /* the pair of  {} brackets encapsules the Object itself. The brackets need to be present */
	"name": "ExampleName - must be filled in", /* as you can see, the first key of the Json is the name of the exercise. You can type everything you want inside the pair of quotes after the colon (":") */
	"trainedAreas": "ExampleAreas - can be empty", /* this value must be present, but may be empty. An empty value consist of only a pair of quotes*/
	"duration": "Example Time in MM:SS - must be filled in", /* the time must be of the format MM:SS, whereas you can input times of 0 seconds, up to 99 minutes and 59 seconds */
	"constraints": [
		[ /* the first batch of constraints that should be evaluated */
			["PartA", "Verb", "PartB"],
			["This one will be", "evaluated at the same time", "as the above statement"],
			["There is", "almost no limit", "on how many Constraints you are putting inside a array"],
			["notice how each", "value inside this doubled array", "is seperated by a comma"],
			["more information on how", "to fill one constraint", "can be found further down in this documentation"]
		],
        [ /* the second batch of constraints that should be evaluated at an later point of time */
			["PartA", "Verb", "PartB"],
			["This one will be evaluated at the same time", "as the above statement, but not at the same time", "as the array above"],
			["This array does not", "need to be the same size", "as the array above"],
		]
	],
	"instructions": [
		"Lie face down with your forearms on the floor and your elbows directly beneath your shoulders. Keep your feet flexed with the bottoms of your toes on the floor. Keep your forearms parallel to each other and don't clasp your hands in front of you. Doing so puts your shoulders in a potentially vulnerable position.",
		"Press into your forearms and rise up on your toes so that only your forearms and toes touch the floor. Your body should hover a few inches off the floor in a straight line from shoulders to feet. Draw your navel toward your spine and tighten your glutes. Look at the floor to keep your head in a neutral alignment, and breathe normally."
	], /* needs one more value than constraints, but the values may be empty */
	"credit": "https://www.livestrong.com/article/319724-step-by-step-directions-on-how-to-do-the-plank/ for the instructions" /* is neither needed nor used */
}

Constraints are saved as arrays of arrays of arrays, which might seem a little bit confusing, but is actualy quite simple. You start by create a array ("[]") and insert another array inside of it ("[[]]"). In the inner array you can now add an array of constraints that should be tested for ("[[["PartA", "verb", "PartB"]]]"). If your Exercise got more than one pose that should be evaluated, create another array after the second array and fill it with the second batch of constraints ("[[["PartA", "verb", "PartB"]],[["PartC", "verb", "PartB"]]]"). You might also want to add multiple constraints to a single pose. This is achieved by adding multiple values to the innermost array ("[[["PartA", "verb", "PartB"]],[["PartC", "verb", "PartB"],["PartF","verb","PartG"]]]").

Available Parts: nose, leftEye, rightEye, leftEar, rightEar, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle, ankles, ears, elbows, eyes, head, hip, knees, shoulder, wrists

Available Verbs: above, below, horizontalTo, verticalTo

Lastly you need to add your newly created file name to the list of Exercises located in Assets/AvailableExercises.json. If you want to add an image for your exercise, put it also inside the Assets folder, saved as ExerciseName.gif.