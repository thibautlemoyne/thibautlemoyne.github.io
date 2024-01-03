import {
	characterDeath
} from "./characterActions.js";
import {
	decreaseHealth
} from "./health.js";

class Character {
	constructor(scene) {
		this.scene = scene;
		this.cube = this.createCube(0, 0.5, 0, 1, 1, 1, 0xff0000);
		this.rightArm = this.createArm(0.6, 0.1, 0.1, -0.55, 0, 0.3, 0.1, 0.1, 0.8, 32, 0x0000ff);
		this.leftArm = this.createArm(-0.6, 0.1, 0.1, -0.55, 0, -0.3, 0.1, 0.1, 0.8, 32, 0x0000ff);
		this.rightFoot = this.createFoot(0.3, -0.7, 0, 0.3, 0.2, 0.4, 0x0000ff);
		this.leftFoot = this.createFoot(-0.3, -0.7, 0, 0.3, 0.2, 0.4, 0x0000ff);
		this.sword = this.createSword(this.rightArm);

		this.state = {
			walkingArm: false,
			walkingFeet: false,
			attack1: false,
			jumping: false,
			falling: false,
			dead: false,
			rolling: false
		};

		this.gravity = 0.01;
		this.verticalVelocity = 0;
		this.isOnGround = false;

		this.health = 4000;
		this.healthMax = 4000;
	}

	createCube(x, y, z, h, w, d, color) {
		const cubeGeometry = new THREE.BoxGeometry(h, w, d);
		const cubeMaterial = new THREE.MeshStandardMaterial({
			color: color
		});
		const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		cube.castShadow = true;
		this.scene.add(cube);
		cube.position.set(x, y, z);
		return cube;
	}

	createArm(x, y, z, rotX, rotY, rotZ, radiusTop, radiusBottom, h, radialSegments, color) {
		const armGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, h, radialSegments);
		const armMaterial = new THREE.MeshStandardMaterial({
			color: color
		});
		const arm = new THREE.Mesh(armGeometry, armMaterial);
		arm.position.set(x, y, z);
		arm.rotation.set(rotX, rotY, rotZ);
		arm.castShadow = true;
		this.cube.add(arm);
		return arm;
	}

	createFoot(x, y, z, h, w, d, color) {
		const footGeometry = new THREE.BoxGeometry(h, w, d);
		const footMaterial = new THREE.MeshStandardMaterial({
			color: color
		});
		const foot = new THREE.Mesh(footGeometry, footMaterial);
		foot.position.set(x, y, z);
		foot.castShadow = true;
		this.cube.add(foot);
		return foot;
	}

	createSword(parent) {
		const swordBladeGeometry = new THREE.BoxGeometry(0.1, 1.35, 0.04);
		const swordHandleGeometry = new THREE.CylinderGeometry(-0.1, 0.1, 0.4, 8);
		const swordBladeMaterial = new THREE.MeshStandardMaterial({
			color: 0x888888
		});
		const swordHandleMaterial = new THREE.MeshStandardMaterial({
			color: 0x444444
		});

		const swordBlade = new THREE.Mesh(swordBladeGeometry, swordBladeMaterial);
		swordBlade.position.set(0, 0.5, 0);

		const swordHandle = new THREE.Mesh(swordHandleGeometry, swordHandleMaterial);
		swordHandle.position.set(0, 0, 0);

		const sword = new THREE.Group();
		sword.add(swordBlade);
		sword.add(swordHandle);

		swordBlade.castShadow = true;
		swordHandle.castShadow = true;

		parent.add(sword);
		sword.position.set(0, -0.4, 0);
		sword.rotation.x = Math.PI / 2;
		swordBlade.rotation.y = Math.PI / 2;

		return sword;
	}

	updateState(stateName, value) {
		if (this.state.hasOwnProperty(stateName)) {
			this.state[stateName] = value;
		} else {
			console.error(`State "${stateName}" does not exist`);
		}
	}

	updatePosition() {
		const groundCollision = this.cube.position.y <= 0 && Math.abs(this.cube.position.z) <= 25 && Math.abs(this.cube.position.x) <= 25; // Ajuster selon la hauteur de votre sol

		if (groundCollision) {
			this.isOnGround = true;
			this.verticalVelocity = 0;
			this.cube.position.y = 0; // hauteur du sol
			this.updateState('falling', false);
		} else {
			this.isOnGround = false;
			this.verticalVelocity -= this.gravity;
			this.cube.position.y += this.verticalVelocity;
			if (!this.state.jumping) {
				this.updateState('falling', true);
				if (this.cube.position.y <= -100) {
					if (this.state.dead) {
						return;
					}
					this.updateState('dead', true);
					characterDeath(this.cube);
				}
			}
		}
	}
}

class Ground extends THREE.Mesh {
	constructor(scene) {
		super()
		this.scene = scene;
		this.createGround(0, -1.8, 0, 50, 50, 2, 0x3eee3f);
		this.createGrid(0, -0.3, 0, 50, 10);
	}

	createGround(x, y, z, h, w, d, color) {
		const geometry = new THREE.BoxGeometry(h, w, d);
		const material = new THREE.MeshStandardMaterial({
			color: color,
			side: THREE.DoubleSide
		});
		this.ground = new THREE.Mesh(geometry, material);
		this.ground.rotation.x = -Math.PI / 2;
		this.ground.position.set(x, y, z);
		this.ground.receiveShadow = true;
		this.scene.add(this.ground);
	}

	createGrid(x, y, z, gridSize, divisions) {
		this.grid = new THREE.GridHelper(gridSize, divisions, 0xffffff, 0xffffff);
		this.grid.material.opacity = 0.5;
		this.grid.material.transparent = true;
		this.grid.position.set(x, y, z);
		this.scene.add(this.grid);
	}
}

class Enemy {
	constructor(scene, player) {
		this.scene = scene;
		this.player = player;
		this.enemyCube = this.createCube(5, 0.5, 0, 1, 1, 1, 0x000000);
		this.speed = 0.08;
		this.health = 100;
		this.canAttack = true;
		this.dead = false;
	}

	createCube(x, y, z, h, w, d, color) {
		const cubeGeometry = new THREE.BoxGeometry(h, w, d);
		const cubeMaterial = new THREE.MeshStandardMaterial({
			color: color,
			transparent: true,
			opacity: 0.95
		});
		const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		cube.castShadow = true;
		this.scene.add(cube);
		cube.position.set(x, y, z);
		return cube;
	}

	moveTowardsPlayer() {
		if (!this.canAttack) {
			return;
		}
		const distanceThreshold = 1;

		const playerPosition = this.player.cube.position;
		const enemyPosition = this.enemyCube.position;

		const distanceToPlayer = playerPosition.distanceTo(enemyPosition);

		if (distanceToPlayer < distanceThreshold) {
			decreaseHealth(this.player, 100);
			this.canAttack = false;
			setTimeout(() => {
				const direction = new THREE.Vector3();
				direction.subVectors(enemyPosition, playerPosition).normalize();
				direction.multiplyScalar(this.speed * 5);
				this.enemyCube.position.add(direction);
				setTimeout(() => {
					if (!this.dead) {
						this.canAttack = true;
					}
				}, 1500); // Cooldown de 2 secondes
			}, 100); // Temps de recul après l'attaque
		} else {
			const direction = new THREE.Vector3();
			direction.subVectors(playerPosition, enemyPosition).normalize();
			direction.multiplyScalar(this.speed);
			this.enemyCube.position.add(direction);
			this.enemyCube.lookAt(playerPosition);
		}
	}

	takeDamage(damageAmount) {
		this.health -= damageAmount;
		if (this.health <= 0) {
			this.die();
		} else {
			this.canAttack = false;
			const originalColor = this.enemyCube.material.color.getHex();
			this.enemyCube.material.color.setHex(0xff0000);
			setTimeout(() => {
				this.enemyCube.material.color.setHex(originalColor);
				this.canAttack = true;
			}, 500);
		}
	}

	die() {
		this.canAttack = false;
		this.dead = true;
		this.scene.remove(this.enemyCube);
	}

	detectCollision(sword) {
		const enemyBoundingSphere = new THREE.Sphere(this.enemyCube.position, 0.5);
		const swordBoundingSphere = new THREE.Sphere(sword.getWorldPosition(new THREE.Vector3()), 0.675);
		if (enemyBoundingSphere.intersectsSphere(swordBoundingSphere)) {
			return true;
		}
		return false;
	}
}

export {
	Character,
	Ground,
	Enemy
};