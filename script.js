import {
	Character,
	Ground,
	Enemy
} from './models_oriente_objet.js';
import {
	swingArms,
	swordSwingAnimation,
	walkLegsV,
	jump,
	roll
} from './animations.js';
import {
	initializeHealthBar
} from "./health.js";
//import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// Initialisation de la scene, de la camera et du renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x9dbcd0); //87ceeb

const ground = new Ground(scene, 50, 50, 2);

const character = new Character(scene);
initializeHealthBar(character);

const enemy = new Enemy(scene, character);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.castShadow = true;
light.target = character.cube;
scene.add(light);

let heightCoef = 1;
let lockedCamera = false;

function updateCamera(distance, height) { // Distance entre camera et character
	if (!lockedCamera) {
		camera.position.x = character.cube.position.x - distance * Math.sin(character.cube.rotation.y);
		camera.position.z = character.cube.position.z - distance * Math.cos(character.cube.rotation.y);
		camera.position.y = character.cube.position.y + heightCoef * height;
		camera.lookAt(character.cube.position);
		light.position.set(camera.position.x, camera.position.y + 2 * heightCoef * height, camera.position.z);
	}
}

function updateHeightCoef(yAxisValue) {
	const increment = 0.1;
	heightCoef += yAxisValue * increment;
	if (heightCoef < 0.1) {
		heightCoef = 0.1;
	} else if (heightCoef > 3) {
		heightCoef = 3;
	}
}

function animate() {
	requestAnimationFrame(animate);
	character.updatePosition();
	enemy.moveTowardsPlayer();
	updateCamera(5, 3);
	renderer.render(scene, camera);
}
animate();

let animationArmState = {
	time: 0
};
let animationLegState = {
	time: 0
};
let animationSwordState = {
	time: 0
};
let jumpState = {
	time: 0
};
let rollState = {
	time: 0
};

function startAnimation(animationFunction, stateName, ...args) {
	if (!character.state[stateName]) {
		character.updateState(stateName, true);
		animationFunction(...args, character);
	}
}

// Redimensionnement du renderer si la fenêtre est redimensionnée
window.addEventListener('resize', () => {
	const width = window.innerWidth;
	const height = window.innerHeight;

	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
});

let gamepadIndex = null; // Index de la manette Xbox connectée

// Rechercher la manette Xbox connectée
function findXboxController() {
	const gamepads = navigator.getGamepads();
	for (let i = 0; i < gamepads.length; i++) {
		if (gamepads[i]?.mapping === 'standard' && gamepads[i]?.id.includes('Xbox')) {
			gamepadIndex = i;
			break;
		}
	}
}
// Vérifier les manettes connectées toutes les 500 ms et rechercher la manette Xbox
setInterval(findXboxController, 500);

// Gérer les entrées de la manette Xbox
function handleGamepadInput() {
	if (gamepadIndex !== null) {
		const gamepad = navigator.getGamepads()[gamepadIndex];
		const speed = 0.1;
		const backButtonPressed = gamepad?.buttons[8].pressed;

		const jumpBtn = gamepad?.buttons[localStorage.getItem('jumpController') || 3].pressed;
		const rollBtn = gamepad?.buttons[localStorage.getItem('rollController') || 1].pressed;
		const atck1Btn = gamepad?.buttons[localStorage.getItem('attck1Controller') || 5].pressed;
		const xAxis = gamepad?.axes[localStorage.getItem('moveXController') || 0];
		const yAxis = gamepad?.axes[localStorage.getItem('moveYController') || 1];
		const rotateX = gamepad?.axes[localStorage.getItem('cameraXController') || 2];
		const rotateY = gamepad?.axes[localStorage.getItem('cameraYController') || 3];

		if (xAxis || yAxis) {
			const moveDirection = new THREE.Vector3(xAxis, 0, yAxis);
			moveDirection.applyQuaternion(character.cube.quaternion);
			if (!character.state.falling) {
				character.cube.position.x -= moveDirection.x * speed;
				character.cube.position.z -= moveDirection.z * speed;
				if (character.state.walkingArm === false && (Math.abs(moveDirection.z) > 0.1 || Math.abs(moveDirection.x) > 0.1)) {
					startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
					startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
				}
			}
		}

		if (rotateX) {
			character.cube.rotation.y -= rotateX * speed; // Rotation horizontale du cube
		}
		if (rotateY) {
			updateHeightCoef(rotateY); // Rotation verticale du cube
		}

		if (backButtonPressed) {
			lockedCamera = !lockedCamera;
			console.log('LockedCamera : %s', lockedCamera);
			alert('LockedCamera : ' + lockedCamera);
		}

		if (atck1Btn) {
			if (!character.state.attack1) { //Redondant mais c'est pour eviter enemy.takeDamage lancé plusieurs fois en même temps
				startAnimation(swordSwingAnimation, 'attack1', character.rightArm, character.leftArm, character.sword, animationSwordState);
				if (enemy.detectCollision(character.sword)) {
					enemy.takeDamage(10);
				}
			}
		}

		if (rollBtn && !character.state.rolling) {
			const cameraDirection = new THREE.Vector3();
			camera.getWorldDirection(cameraDirection);
			const cameraDirectionXZ = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
			character.updateState('rolling', true);
			roll(cameraDirectionXZ, rollState, character);
		}

		if (jumpBtn && !character.state.falling) {
			startAnimation(jump, 'jumping', character.leftArm, character.rightArm, character.leftFoot, character.rightFoot, jumpState);
		}
	}
}

class KeyboardControls {
	constructor() {
		this.keys = {};
		this.initListeners();
	}
	initListeners() {
		document.addEventListener('keydown', (event) => {
			this.keys[event.code] = true;
		});
		document.addEventListener('keyup', (event) => {
			this.keys[event.code] = false;
		});
	}
	isKeyPressed(keyCode) {
		return this.keys[keyCode] || false;
	}
	areKeysPressed(keyCodes) {
		return keyCodes.every(keyCode => this.keys[keyCode]); // Vérifie si toutes les touches sont enfoncées
	}
}

const keyboard = new KeyboardControls();

const defaultMoveUKey = 'KeyW';
const defaultMoveDKey = 'KeyS';
const defaultMoveLKey = 'KeyA';
const defaultMoveRKey = 'KeyD';
const defaultMoveU2Key = 'ArrowUp';
const defaultMoveD2Key = 'ArrowDown';
const defaultLookLKey = 'ArrowLeft';
const defaultLookRKey = 'ArrowRight';
const defaultJumpKey = 'Space';
const defaultAtck1Key = 'KeyV';
const defaultRollKey = 'ShiftRight';

const moveUpKey = localStorage.getItem('moveUpKey') || defaultMoveUKey;
const moveDownKey = localStorage.getItem('moveDownKey') || defaultMoveDKey;
const moveLeftKey = localStorage.getItem('moveLeftKey') || defaultMoveLKey;
const moveRightKey = localStorage.getItem('moveRightKey') || defaultMoveRKey;
const moveUp2Key = localStorage.getItem('moveUp2Key') || defaultMoveU2Key;
const moveDown2Key = localStorage.getItem('moveDown2Key') || defaultMoveD2Key;
const lookLeftKey = localStorage.getItem('lookLeftKey') || defaultLookLKey;
const lookRightKey = localStorage.getItem('lookRightKey') || defaultLookRKey;
const jumpKey = localStorage.getItem('jump') || defaultJumpKey;
const atck1Key = localStorage.getItem('atck1') || defaultAtck1Key;
const rollKey = localStorage.getItem('roll') || defaultRollKey;

function handleKeyboardInput() {
	const speed = 0.1;
	const cameraDirection = new THREE.Vector3();
	camera.getWorldDirection(cameraDirection);
	const cameraDirectionXZ = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
	const cameraRightVector = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();
	const diagonalRVector = new THREE.Vector3().addVectors(cameraDirectionXZ, cameraRightVector).normalize();
	const diagonalLVector = new THREE.Vector3().addVectors(cameraDirectionXZ, cameraRightVector.negate()).normalize();

	if (keyboard.areKeysPressed([moveUpKey, moveRightKey]) && !character.state.falling) {
		character.cube.position.addScaledVector(diagonalRVector, speed);
		if (character.state.walkingArm === false) {
			startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
			startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
		}
	} else if (keyboard.areKeysPressed([moveDownKey, moveLeftKey]) && !character.state.falling) {
		character.cube.position.addScaledVector(diagonalRVector.negate(), speed);
		if (character.state.walkingArm === false) {
			startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
			startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
		}
	} else if (keyboard.areKeysPressed([moveUpKey, moveLeftKey]) && !character.state.falling) {
		character.cube.position.addScaledVector(diagonalLVector, speed);
		if (character.state.walkingArm === false) {
			startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
			startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
		}
	} else if (keyboard.areKeysPressed([moveDownKey, moveRightKey]) && !character.state.falling) {
		character.cube.position.addScaledVector(diagonalLVector.negate(), speed);
		if (character.state.walkingArm === false) {
			startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
			startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
		}
	} else if ((keyboard.isKeyPressed(moveUp2Key) || keyboard.isKeyPressed(moveUpKey)) && !character.state.falling) {
		character.cube.position.addScaledVector(cameraDirectionXZ, speed);
		if (character.state.walkingArm === false) {
			startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
			startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
		}
	} else if ((keyboard.isKeyPressed(moveDown2Key) || keyboard.isKeyPressed(moveDownKey)) && !character.state.falling) {
		character.cube.position.addScaledVector(cameraDirectionXZ.negate(), speed);
		if (character.state.walkingArm === false) {
			startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
			startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
		}
	} else if (keyboard.isKeyPressed(moveRightKey) && !character.state.falling) {
		character.cube.position.addScaledVector(cameraRightVector.negate(), speed);
		if (character.state.walkingArm === false) {
			startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
			startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
		}
	} else if (keyboard.isKeyPressed(moveLeftKey) && !character.state.falling) {
		character.cube.position.addScaledVector(cameraRightVector, speed);
		if (character.state.walkingArm === false) {
			startAnimation(swingArms, 'walkingArm', character.leftArm, character.rightArm, 0.3, animationArmState);
			startAnimation(walkLegsV, 'walkingFeet', character.leftFoot, character.rightFoot, 0.3, animationLegState);
		}
	} else if (!character.state.attack1 && !character.state.jumping) {
		character.updateState('walkingArm', false);
		character.updateState('walkingFeet', false);
	}
	if (keyboard.isKeyPressed(lookLeftKey)) {
		character.cube.rotation.y += speed;
	}
	if (keyboard.isKeyPressed(lookRightKey)) {
		character.cube.rotation.y -= speed;
	}
	if (keyboard.isKeyPressed(jumpKey) && !character.state.falling) {
		startAnimation(jump, 'jumping', character.leftArm, character.rightArm, character.leftFoot, character.rightFoot, jumpState);
	}
	if (keyboard.isKeyPressed(atck1Key) && !character.state.attack1) {
		startAnimation(swordSwingAnimation, 'attack1', character.rightArm, character.leftArm, character.sword, animationSwordState);
		if (enemy.detectCollision(character.sword)) {
			enemy.takeDamage(10);
		}
	}
	if (keyboard.isKeyPressed(rollKey) && !character.state.rolling) {
		const cameraDirection = new THREE.Vector3();
		camera.getWorldDirection(cameraDirection);
		const cameraDirectionXZ = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
		character.updateState('rolling', true);
		roll(cameraDirectionXZ, rollState, character);
	}
}

// Vérifier les entrées du clavier et de la manette toutes les frames
function gameLoop() {
	handleGamepadInput();
	handleKeyboardInput();
	requestAnimationFrame(gameLoop);
}
gameLoop();