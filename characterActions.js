function characterDeath(cube) {
    cube.visible = false;
    console.log('Died');
    var dialog = document.createElement('dialog');
    dialog.className = 'ds-popup';
    dialog.id = 'ds1';
    dialog.innerHTML = "<h1>YOU DIED</h1>";
    document.body.appendChild(dialog);
    dialog.setAttribute('open', true);
}

  export { characterDeath };