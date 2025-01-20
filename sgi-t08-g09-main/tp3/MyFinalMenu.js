import * as THREE from 'three';
import { MySpriteText } from './components/MySpriteText.js';

class MyFinalMenu {
    constructor(app, results, onRestart, onReturnToMenu) {
        this.app = app;
        this.spriteText = new MySpriteText(app);
        this.results = results;
        this.onRestart = onRestart;
        this.onReturnToMenu = onReturnToMenu;

        // Create HUD scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

        this.createMenuElements();
        this.setupInteraction();
    }

    createMenuElements() {
        // Create menu group
        this.menuGroup = new THREE.Group();
        this.menuGroup.rotation.y = Math.PI;
        this.menuGroup.position.x = -0.3;

        // Title - adjusted x position of RACE COMPLETE! to 0.1 to move it right
        this.addMenuItem("RACE COMPLETE!", 0.2, 0.8, 0.1);
        this.addMenuItem("RACE RESULTS", 0, 0.6, 0.08);
        this.addMenuItem(`WINNER: ${this.results.winner}`, 0, 0.4, 0.06);
        this.addMenuItem(`TIME: ${this.formatTime(this.results.time)}`, 0, 0.2, 0.06);
        this.addMenuItem(`PLAYER: ${this.results.playerBalloon}`, 0, 0, 0.06);
        this.addMenuItem(`OPPONENT: ${this.results.opponentBalloon}`, 0, -0.2, 0.06);

        // Buttons - increased spacing between buttons
        this.restartButton = this.addMenuItem("RESTART RACE", -0.5, -0.6, 0.06);
        this.restartButton.userData = { type: "restart" };
        this.addButtonBackground(this.restartButton);

        this.menuButton = this.addMenuItem("RETURN TO MENU", 0.5, -0.6, 0.06);
        this.menuButton.userData = { type: "menu" };
        this.addButtonBackground(this.menuButton);

        this.scene.add(this.menuGroup);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    addMenuItem(text, x, y, size) {
        const textMesh = this.spriteText.createText(text, size);
        textMesh.position.set(x, y, 0);
        textMesh.rotation.y = Math.PI;
        
        textMesh.children.forEach(child => {
            if (child.material) {
                child.material.depthTest = false;
                child.material.depthWrite = false;
                child.renderOrder = 999;
                child.rotation.y = 0;
            }
        });
        this.menuGroup.add(textMesh);
        return textMesh;
    }

    setupInteraction() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener('click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.menuGroup.children, true);

            if (intersects.length > 0) {
                this.handleClick(intersects[0].object);
            }
        });
    }

    handleClick(object) {
        if (object.userData.type === "restart") {
            this.onRestart();
        } else if (object.userData.type === "menu") {
            this.onReturnToMenu();
        }
    }

    addButtonBackground(button) {
        const bgWidth = 0.75; // Adjust as needed for button size
        const bgHeight = 0.1; // Adjust as needed for button height
    
        const planeGeometry = new THREE.PlaneGeometry(bgWidth, bgHeight);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.0,
            transparent: true,
            depthWrite: false,
        });
    
        const background = new THREE.Mesh(planeGeometry, planeMaterial);
        background.position.set(0.25, 0, -0.01); // Slightly behind the text
        background.userData = { type: button.userData.type };
    
        // Add the plane as a child of the button
        button.add(background);
    }    

    update() {
        // Any update logic needed
    }

    render() {
        const autoClear = this.app.renderer.autoClear;
        this.app.renderer.autoClear = false;
        this.app.renderer.clearDepth();
        this.app.renderer.render(this.scene, this.camera);
        this.app.renderer.autoClear = autoClear;
    }
}

export { MyFinalMenu };