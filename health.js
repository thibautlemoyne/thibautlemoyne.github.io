import {
	characterDeath
} from "./characterActions.js";

export function initializeHealthBar(character) {
	document.querySelector('.right.hbar').textContent = `${character.health.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}/${character.healthMax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function decreaseHealth(character, amount) {
	let currentHealth = document.querySelector('.right.hbar');
	character.health -= amount;
	if (character.health < 0) {
		character.health = 0;
		characterDeath(character.cube);
	}
	currentHealth.textContent = character.health.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '/' + character.healthMax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	let healthBar = document.querySelector('.bghealth');
	healthBar.style.width = (character.health / character.healthMax) * 100 + '%';
}