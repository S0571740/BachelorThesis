const baseUrl = "https://bachelorthesisserver.herokuapp.com";
const loginForm = document.getElementById("login-form");

function login() {
	const username = loginForm.username.value;
	const password = loginForm.password.value;
	verifyLogin(username, password);
}

async function verifyLogin(username, password) {
	let loginData = JSON.parse(localStorage.getItem("login"), reviver);

	// const data = { username, password };
	// const options = {
	// 	method: "POST",
	// 	mode: "cors",
	// 	body: JSON.stringify(data),
	// };
	// console.log(options);
	// console.log(data);
	// await fetch(`${baseUrl}/login`, options).then((response) => {
	// // 	if (response.status == 200) {
	// // 		window.location.href = "MainMenu.html";
	// // 	} else {
	// // 		alert(" wrong username or password !");
	// // 	}
	// console.log(response);
	// });

	if (
		loginData.get(username) !== undefined &&
		loginData.get(username) === password
	) {
		window.location.href =
			"http://loquacious-cat-52d8b6.netlify.app/HTML/MainMenu.html";
	} else {
		alert("Wrong combination of username and password");
	}
}

function register() {
	const username = loginForm.username.value;
	const password = loginForm.password.value;

	let loginData = JSON.parse(localStorage.getItem("login"), reviver);
	if (loginData.get(username) !== undefined) {
		alert("User already registered");
	} else {
		loginData.set(username, password);
		localStorage.setItem("login", JSON.stringify(loginData, replacer));
		alert("User is now available");
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
