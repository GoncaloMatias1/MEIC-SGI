import * as THREE from 'three';
import { MySpriteText } from './components/MySpriteText.js';
import { MyBalloon } from './objects/MyBalloon.js';

class MyOpponentMenu extends THREE.Object3D {
    constructor(app, onStart) {
        super();
        this.app = app;
        this.onStart = onStart;
        this.spriteText = new MySpriteText(app);
        
        // Menu state
        this.selectedBalloon = "DEFAULT";
        this.playerBalloon = null;

        this.createMenuElements();
        this.setupInteraction();
    }

    createMenuElements() {
        // Position menu in front of camera
        this.rotation.y = (3 * Math.PI / 4);
        this.position.set(70, 0, -200);

        this.playerBalloon = new MyBalloon(this.app, {
            model: this.selectedBalloon,
            isAutonomous: false,
            startPosition: new THREE.Vector3(0, 0, 0)
        });
        this.playerBalloon.position.set(-22, 17, 10)
        this.add(this.playerBalloon)

        // Start Button (with background for clicking)
        this.startButton = new THREE.Group();
        const startText = this.addMenuItem("SELECT OPPONENT", 0, 0, 2);
        this.startButton.add(startText);

        this.createBalloonSelectors(10)

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
        this.startButton.position.set(-11, 6, 0);
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
    }

    createBalloonSelectors(yPos) {
        const colors = ['RED', 'BLUE', 'YELLOW', 'GREEN', 'CYAN', 'MAGENTA', 'WHITE'];
        const group = new THREE.Group();

        colors.forEach((color, i) => {
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(2, 2, 0.5),
                new THREE.MeshBasicMaterial({ color: this.getColor(color) })
            );
            box.position.x = -((i - 1) * 4 + 14);
            box.userData = { type: 'balloon', color: color};
            group.add(box);
        });

        group.position.y = yPos;
        this.add(group);
    }

    getColor(colorName) {
        const colors = {
            'RED': 0xff0000,
            'BLUE': 0x0000ff,
            'YELLOW': 0xffff00,
            'GREEN': 0x00ff00,
            'CYAN': 0x00ffff,
            'MAGENTA': 0xff00ff,
            'WHITE': 0xffffff
        };
        return colors[colorName];
    }


    handleClick(object) {
        if (object.userData.type === 'balloon') {
            this.selectedBalloon = object.userData.color;
            this.playerBalloon.changeColor(this.getColor(object.userData.color));
        } 
        else if (object.userData.type == "startButton") {
            this.onStart({
                opponentBalloon: this.selectedBalloon,
            });
        }
    }
    
    
}

export { MyOpponentMenu };