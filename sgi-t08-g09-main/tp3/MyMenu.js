import * as THREE from 'three';
import { MySpriteText } from './components/MySpriteText.js';

class MyMenu extends THREE.Object3D {
    constructor(app, onStart) {
        super();
        this.app = app;
        this.onStart = onStart;
        this.spriteText = new MySpriteText(app);
        
        // Menu state
        this.playerName = '';
        this.startingPoint = "";

        this.createMenuElements();
        this.setupInteraction();
    }

    createMenuElements() {
        // Position menu in front of camera
        this.position.set(0, 0, -20);

        // Add background to the menu
        const menuBg = new THREE.Mesh(
            new THREE.PlaneGeometry(45, 20),
            new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            })
        );
        // Change position to be on the back
        menuBg.position.set(-20, 18, 0.2);
        this.add(menuBg);

        // Title and Info
        this.addMenuItem("HOT AIR BALLOON RACE", 0, 26, 2);
        this.addMenuItem("FEUP - INTERACTIVE GRAPHICS", 0, 24, 1);
        this.addMenuItem("BY: Gonçalo and Pedro", 0, 22.5, 1);

        // Player Name Section
        this.addMenuItem("PLEASE ENTER YOUR NAME", 0, 20, 1);
        this.nameDisplay = this.addMenuItem("PLAYER NAME: _", 0, 18.5, 1);

        this.startingPointText = this.addMenuItem("SELECT YOUR STARTING POINT: NONE", 0, 16, 1);

        // Starting point A Button (with background for clicking)
        this.startingPointAButton = new THREE.Group();
        const startingPointAText = this.addMenuItem("A", 0, 14, 2);
        this.startingPointAButton.add(startingPointAText);

        // Add clickable background for Starting point A button
        const startingPointABg = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 3),
            new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            })
        );
        startingPointABg.position.set(-0.2, 14, -0.2)
        startingPointABg.userData = { type: "startingPointA" }
        this.startingPointAButton.add(startingPointABg);
        this.startingPointAButton.position.set(-5, 0, 0);
        this.add(this.startingPointAButton);

        // Starting point B Button (with background for clicking)
        this.startingPointBButton = new THREE.Group();
        const startingPointBText = this.addMenuItem("B", 0, 14, 2);
        this.startingPointBButton.add(startingPointBText);

        // Add clickable background for Starting point B button
        const startingPointBBg = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 3),
            new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            })
        );
        startingPointBBg.position.set(-0.1, 14, -0.2)
        startingPointBBg.userData = { type: "startingPointB" }
        this.startingPointBButton.add(startingPointBBg);
        this.startingPointBButton.position.set(-15, 0, 0);
        this.add(this.startingPointBButton);


        // Start Button (with background for clicking)
        this.startButton = new THREE.Group();
        const startText = this.addMenuItem("START GAME", 0, 0, 2);
        this.startButton.add(startText);

        // Add clickable background for start button
        const buttonBg = new THREE.Mesh(
            new THREE.PlaneGeometry(16, 3),
            new THREE.MeshBasicMaterial({ 
                color: 0x000000,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            })
        );
        buttonBg.position.set(-6.5, 0, -0.2)
        buttonBg.userData = { type: "startButton" }
        this.startButton.add(buttonBg);
        this.startButton.position.set(-13, 11, 0);
        this.add(this.startButton);
    }
    
    addMenuItem(text, x, y, size) {
        const textMesh = this.spriteText.createText(text, size);
        textMesh.position.set(x, y, 0);
        this.add(textMesh);
        return textMesh;
    }

    setupInteraction() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Handle mouse clicks
        window.addEventListener('click', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.app.activeCamera);
            const intersects = this.raycaster.intersectObjects(this.children, true);

            if (intersects.length > 0) {
                this.handleClick(intersects[0].object);
            }
        });

        // Handle keyboard input for name
        window.addEventListener('keydown', (event) => {            
            if (event.key === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
            } else if (event.key.length === 1 && this.playerName.length <= 10) {
                this.playerName += event.key.toUpperCase();
            }
            this.updateNameDisplay();
        });
    }

    updateStartingPointText() {
        // Remove the old starting point
        this.remove(this.startingPointText)
        // Create a new text display with the updated starting point
        this.startingPointText = this.addMenuItem(`SELECT YOUR STARTING POINT: ${this.startingPoint}`, 0, 16, 1);
    }

    handleClick(object) {
        if (object.userData.type == "startingPointA") {
            this.startingPoint = "A";
            this.updateStartingPointText();
        }
        else if (object.userData.type == "startingPointB") {
            this.startingPoint = "B";
            this.updateStartingPointText();
        } else if (object.userData.type == "startButton" && this.playerName != "" && this.startingPoint != "") {
            this.onStart({
                playerName: this.playerName,
                startingPoint: this.startingPoint
            });
        }
    }
    
    updateNameDisplay() {
        // Remove the old name display
        this.remove(this.nameDisplay);
        // Create a new text display with the updated name
        this.nameDisplay = this.addMenuItem(`PLAYER NAME: ${this.playerName}_`, 0, 18.5, 1);
    }
    
}

export { MyMenu };