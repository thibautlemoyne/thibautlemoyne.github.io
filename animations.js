function swingArms(leftArm, rightArm, armLength, animationArmState, character) {
	if (!character.state.walkingArm || character.state.jumping) {
		character.leftArm.rotation.set(-0.55, 0, -0.3);
		character.leftArm.position.set(-0.6, 0.1, 0.1);
		character.rightArm.rotation.set(-0.55, 0, 0.3);
		character.rightArm.position.set(0.6, 0.1, 0.1);
		return; // Arrête l'animation si elle ne doit pas être exécutée
	}

	const armSwingAngle = Math.sin(animationArmState.time) * Math.PI / 6;

	if (leftArm && rightArm) {
		leftArm.rotation.x = armSwingAngle;
		rightArm.rotation.x = -armSwingAngle;
		leftArm.position.z = 0.1 - Math.sin(animationArmState.time) * armLength / 2;
		rightArm.position.z = 0.1 + Math.sin(animationArmState.time) * armLength / 2;
	} else {
		console.error('leftArm or rightArm is undefined');
		return; // Arrête l'animation si leftArm ou rightArm est undefined - problème que j'avais rencontré
	}

	animationArmState.time += 0.1; // Modifier l'incrément modifie la vitesse de l'animation

	// Appel récursif de la fonction swingArms avec les mêmes paramètres
	requestAnimationFrame(() => swingArms(leftArm, rightArm, armLength, animationArmState, character));
}


function walkLegsV(leftFoot, rightFoot, legLength, animationLegState, character) {
	if (!character.state.walkingFeet || character.state.jumping) {
		character.leftFoot.position.set(-0.3, -0.7, 0);
		character.leftFoot.rotation.set(0, 0, 0);
		character.rightFoot.position.set(0.3, -0.7, 0);
		character.rightFoot.rotation.set(0, 0, 0);
		return;
	}

	const legStepAngle = -Math.sin(animationLegState.time) * Math.PI / 4; // Angle de pas des jambes (PI/4)

	if (leftFoot && rightFoot) {
		leftFoot.rotation.x = legStepAngle;
		rightFoot.rotation.x = -legStepAngle;
		leftFoot.position.z = 0.1 + Math.sin(animationLegState.time) * legLength;
		rightFoot.position.z = 0.1 - Math.sin(animationLegState.time) * legLength;
	} else {
		console.error('leftFoot or rightFoot is undefined');
		return;
	}

	animationLegState.time += 0.1;

	requestAnimationFrame(() => walkLegsV(leftFoot, rightFoot, legLength, animationLegState, character));
}


function swordSwingAnimation(rightArm, leftArm, sword, animationSwordState, character) {
	const swordSwingDuration = 1; // en secondes
	const t = animationSwordState.time / swordSwingDuration;

	leftArm.rotation.set(-0.55, 0, -0.3);
	leftArm.position.set(-0.6, 0.1, 0.1);

	if (t <= 0.33) {
		// Premier tiers de l'animation - bras vers le haut
		const startRotation = new THREE.Vector3(11, 0, 0.2);
		const endRotation = new THREE.Vector3(10.2, 0, 0.2);
		const startPosition = new THREE.Vector3(0.6, 0.2, 0.3);
		const endPosition = new THREE.Vector3(0.6, 0.3, 0.3);

		rightArm.rotation.x = THREE.MathUtils.lerp(startRotation.x, endRotation.x, t * 3);
		rightArm.rotation.y = THREE.MathUtils.lerp(startRotation.y, endRotation.y, t * 3);
		rightArm.rotation.z = THREE.MathUtils.lerp(startRotation.z, endRotation.z, t * 3);

		rightArm.position.x = THREE.MathUtils.lerp(startPosition.x, endPosition.x, t * 3);
		rightArm.position.y = THREE.MathUtils.lerp(startPosition.y, endPosition.y, t * 3);
		rightArm.position.z = THREE.MathUtils.lerp(startPosition.z, endPosition.z, t * 3);
	} else if (t <= 0.66) {
		// Deuxième tiers de l'animation - bras descend (anti-horaire)
		const startRotation = new THREE.Vector3(10.2, 0, 0.2);
		const endRotation = new THREE.Vector3(12.3, 0, 0.2);
		const startPosition = new THREE.Vector3(0.6, 0.3, 0.3);
		const endPosition = new THREE.Vector3(0.6, 0, 0);

		rightArm.rotation.x = THREE.MathUtils.lerp(startRotation.x, endRotation.x, (t - 0.33) * 3);
		rightArm.rotation.y = THREE.MathUtils.lerp(startRotation.y, endRotation.y, (t - 0.33) * 3);
		rightArm.rotation.z = THREE.MathUtils.lerp(startRotation.z, endRotation.z, (t - 0.33) * 3);

		rightArm.position.x = THREE.MathUtils.lerp(startPosition.x, endPosition.x, (t - 0.33) * 3);
		rightArm.position.y = THREE.MathUtils.lerp(startPosition.y, endPosition.y, (t - 0.33) * 3);
		rightArm.position.z = THREE.MathUtils.lerp(startPosition.z, endPosition.z, (t - 0.33) * 3);
	} else if (t <= 1) {
		// Dernier tiers de l'animation - bras remonte dans l'autre sens (anti-trigonométrique)
		const startRotation = new THREE.Vector3(12.5, 0, 0.2);
		const endRotation = new THREE.Vector3(12, 0, 0.3);
		const startPosition = new THREE.Vector3(0.6, 0, 0);
		const endPosition = new THREE.Vector3(0.6, 0.1, 0.1);

		rightArm.rotation.x = THREE.MathUtils.lerp(startRotation.x, endRotation.x, (t - 0.66) * 3);
		rightArm.rotation.y = THREE.MathUtils.lerp(startRotation.y, endRotation.y, (t - 0.66) * 3);
		rightArm.rotation.z = THREE.MathUtils.lerp(startRotation.z, endRotation.z, (t - 0.66) * 3);

		rightArm.position.x = THREE.MathUtils.lerp(startPosition.x, endPosition.x, (t - 0.66) * 3);
		rightArm.position.y = THREE.MathUtils.lerp(startPosition.y, endPosition.y, (t - 0.66) * 3);
		rightArm.position.z = THREE.MathUtils.lerp(startPosition.z, endPosition.z, (t - 0.66) * 3);
	}

	animationSwordState.time += 0.02;

	if (animationSwordState.time <= swordSwingDuration) {
		requestAnimationFrame(() => {
			swordSwingAnimation(rightArm, leftArm, sword, animationSwordState, character);
		});
	} else {
		character.updateState('attack1', false);
		animationSwordState.time = 0;

		rightArm.rotation.set(-0.55, 0, 0.3);
		rightArm.position.set(0.6, 0.1, 0.1);

		sword.rotation.x = Math.PI / 2;
	}
}

function jump(leftArm, rightArm, leftFoot, rightFoot, jumpState, character) {
	character.cube.position.y += 0.2;
	//console.log(jumpState.time);
	//bug mineur : si saut + attaque + mouvement car walkingArm et walkingFeet à true après l'animation (car sinon bug : non declenchanchement animation walking quand saut + mouvement au clavier)
	if (jumpState.time > 2) {
		jumpState.time = 0;
		character.leftArm.rotation.set(-0.55, 0, -0.3);
		character.leftArm.position.set(-0.6, 0.1, 0.1);
		character.rightArm.rotation.set(-0.55, 0, 0.3);
		character.rightArm.position.set(0.6, 0.1, 0.1);
		character.leftFoot.position.set(-0.3, -0.7, 0);
		character.rightFoot.position.set(0.3, -0.7, 0);
		character.updateState('jumping', false);
		character.updateState('walkingFeet', false);
		character.updateState('walkingArm', false);
		return;
	} //40 frames dont 21 de montée
	leftFoot.position.set(-0.2, -0.75, 0);
	rightFoot.position.set(0.2, -0.7, 0);
	if (leftArm && rightArm) {
		if (jumpState.time < 1.03) { // 21 frames de montée 
			rightArm.rotation.x -= 0.04380952380952381;
			rightArm.rotation.y -= 0.023809523809523808;
			rightArm.position.y += 0.006523809523809525;
			rightArm.position.z += 0.006523809523809525;
			leftArm.rotation.x -= 0.04380952380952381;
			leftArm.rotation.y -= 0.023809523809523808;
			leftArm.position.y += 0.006523809523809525;
			leftArm.position.z += 0.006523809523809525;
		}
	} else {
		console.error('leftArm or rightArm is undefined');
		return;
	}
	jumpState.time += 0.05;
	requestAnimationFrame(() => jump(leftArm, rightArm, leftFoot, rightFoot, jumpState, character));
}

function roll(cameraDirection, rollState, character) {
	character.cube.position.addScaledVector(cameraDirection, 0.15);
	//console.log(rollState.time);
	if (rollState.time > 2.2) {
		rollState.time = 0;
		character.updateState('rolling', false);
		return;
	}
	if (rollState.time < 2) { // 40 frames de roulade 
		character.cube.rotation.x += 2 * Math.PI / 40;
	}
	rollState.time += 0.05;
	requestAnimationFrame(() => roll(cameraDirection, rollState, character));
}

export {
	swingArms,
	swordSwingAnimation,
	walkLegsV,
	jump,
	roll
};