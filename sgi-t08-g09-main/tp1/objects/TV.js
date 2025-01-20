import * as THREE from 'three';
class TV {
    constructor(app) {
        this.app = app;
        this.textureLoader = new THREE.TextureLoader();
        // Load TV screen texture
        this.screenTexture = this.textureLoader.load('textures/tv_screen.jpg');
        this.screenTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.screenTexture.wrapT = THREE.ClampToEdgeWrapping;
        // TV frame material
        this.frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x202020,
            specular: 0x404040,
            shininess: 30
        });
        this.screenMaterial = new THREE.MeshBasicMaterial({
            map: this.screenTexture
        });
        this.standMaterial = new THREE.MeshPhongMaterial({
            color: 0x202020,
            specular: 0x404040,
            shininess: 30
        });
    }
    create() {
        const group = new THREE.Group();
        const frameGeometry = new THREE.BoxGeometry(6, 3.375, 0.225);
        const frame = new THREE.Mesh(frameGeometry, this.frameMaterial);
        frame.castShadow = true;
        frame.receiveShadow = true;
        const screenGeometry = new THREE.PlaneGeometry(5.7, 3.15);
        const screen = new THREE.Mesh(screenGeometry, this.screenMaterial);
        screen.position.z = 0.114;
        const baseGeometry = new THREE.BoxGeometry(2.25, 0.15, 1.2);
        const base = new THREE.Mesh(baseGeometry, this.standMaterial);
        base.position.set(0, -1.95, 0.6);
        base.castShadow = true;
        base.receiveShadow = true;
        const neckGeometry = new THREE.BoxGeometry(0.3, 0.45, 0.15);
        const neck = new THREE.Mesh(neckGeometry, this.standMaterial);
        neck.position.set(0, -1.725, 0);
        neck.castShadow = true;
        neck.receiveShadow = true;
        group.add(frame);
        group.add(screen);
        group.add(base);
        group.add(neck);
        group.position.set(-9.6, 2, 6);
        group.rotation.y = Math.PI/2;
        return group;
    }
    updateFrameColor(color) {
        this.frameMaterial.color.set(color);
    }
    updateStandColor(color) {
        this.standMaterial.color.set(color);
    }
    updateScreenTexture(texturePath) {
        const newTexture = this.textureLoader.load(texturePath);
        newTexture.wrapS = THREE.ClampToEdgeWrapping;
        newTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.screenMaterial.map = newTexture;
        this.screenMaterial.needsUpdate = true;
    }
}
export { TV };