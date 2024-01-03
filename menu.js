const controlKeys = ['moveUpKey', 'moveDownKey', 'moveLeftKey', 'moveRightKey', 'moveUp2Key', 'moveDown2Key', 'lookLeftKey', 'lookRightKey', 'jump', 'atck1', 'roll'];
const controlBtns = ['jumpController', 'atck1Controller', 'rollController'];
const controlAxis = ['moveXController', 'moveYController', 'cameraXController', 'cameraYController'];

function openControlsMenu() {
	document.getElementById('controlsMenu').style.display = 'block';
	let controllerValue = localStorage.getItem('controller');
	const inputController = document.getElementById('inputController');
	const keyboardControls = document.getElementById('keyboardControls');
	const controllerControls = document.getElementById('controllerControls');

	if (controllerValue === 'Controller') {
		inputController.value = 'Controller';
		keyboardControls.style.display = 'none';
		controllerControls.style.display = 'block';
	} else {
		inputController.value = 'Keyboard';
		keyboardControls.style.display = 'block';
		controllerControls.style.display = 'none';
	}

	controlKeys.forEach(key => {
		const storedValue = localStorage.getItem(key) || getDefaultKey(key);
		document.getElementById(key).value = storedValue;
	});

	controlBtns.forEach(btn => {
		const storedValue = localStorage.getItem(btn) || buttonValues.indexOf(getDefaultBtn(btn));
		document.getElementById(btn).value = buttonValues[storedValue];
	});

	controlAxis.forEach(axis => {
		const storedValue = localStorage.getItem(axis) || axisValues.indexOf(getDefaultAxis(axis));
		document.getElementById(axis).value = axisValues[storedValue];
	});
}

function getDefaultKey(key) {
	const defaultKeys = {
		'moveUpKey': 'KeyW',
		'moveDownKey': 'KeyS',
		'moveLeftKey': 'KeyA',
		'moveRightKey': 'KeyD',
		'moveUp2Key': 'ArrowUp',
		'moveDown2Key': 'ArrowDown',
		'lookLeftKey': 'ArrowLeft',
		'lookRightKey': 'ArrowRight',
		'jump': 'Space',
		'atck1': 'KeyV',
		'roll': 'ShiftRight'
	};
	return defaultKeys[key];
}

function getDefaultBtn(btn) {
	const defaultBtns = {
		'jumpController': 'Y',
		'atck1Controller': 'RB',
		'rollController': 'B'
	};
	return defaultBtns[btn];
}

function getDefaultAxis(axis) {
	const defaultAxis = {
		'moveXController': 'LeftStick-X',
		'moveYController': 'LeftStick-Y',
		'cameraXController': 'RightStick-X',
		'cameraYController': 'RightStick-Y'
	};
	return defaultAxis[axis];
}

let currentKeyInputId = null;

function captureKey(inputId, event) {
	event.preventDefault();
	currentKeyInputId = inputId;
	document.getElementById(inputId).value = event.code;
}

document.addEventListener('keydown', function(event) {
	if (currentKeyInputId) {
		event.preventDefault();
		document.getElementById(currentKeyInputId).value = event.code;
		localStorage.setItem(currentKeyInputId, event.code);
		currentKeyInputId = null;
	}
});

function closeControlsMenu() {
	controlKeys.forEach(key => {
		localStorage.setItem(key, document.getElementById(key).value);
	});
	document.getElementById('controlsMenu').style.display = 'none';
}

function resetControls() {
	controlKeys.forEach(key => {
		localStorage.removeItem(key);
		document.getElementById(key).value = getDefaultKey(key);
	});
	controlBtns.forEach(btn => {
		localStorage.removeItem(btn);
		document.getElementById(btn).value = getDefaultBtn(btn);
	});
	controlAxis.forEach(axis => {
		localStorage.removeItem(axis);
		document.getElementById(axis).value = getDefaultAxis(axis);
	});
}

function toggleControllerType() {
	const inputController = document.getElementById('inputController');
	const keyboardControls = document.getElementById('keyboardControls');
	const controllerControls = document.getElementById('controllerControls');

	const displayKeyboard = keyboardControls.style.display !== 'none';

	inputController.value = displayKeyboard ? 'Controller' : 'Keyboard';
	localStorage.setItem('controller', displayKeyboard ? 'Controller' : 'Keyboard');
	keyboardControls.style.display = displayKeyboard ? 'none' : 'block';
	controllerControls.style.display = displayKeyboard ? 'block' : 'none';
}

const axisValues = ['LeftStick-X', 'LeftStick-Y', 'RightStick-X', 'RightStick-Y'];

function toggleStickValue(inputId) {
	const inputElement = document.getElementById(inputId);
	let currentValue = inputElement.value;
	const currentIndex = axisValues.indexOf(currentValue);
	const nextIndex = (currentIndex + 1) % axisValues.length;
	inputElement.value = axisValues[nextIndex];
	localStorage.setItem(inputId, nextIndex);
}

const buttonValues = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'Btn10', 'Btn11', 'D-Pad-Up', 'D-Pad-Down', 'D-Pad-Left', 'D-Pad-Right'];

function toggleBtnValue(inputId) {
	const inputElement = document.getElementById(inputId);
	let currentValue = inputElement.value;
	const currentIndex = buttonValues.indexOf(currentValue);
	const nextIndex = (currentIndex + 1) % buttonValues.length;
	inputElement.value = buttonValues[nextIndex];
	localStorage.setItem(inputId, nextIndex);
}