import * as THREE from 'three';

class MyMeta extends THREE.Object3D {
    constructor(app, position) {
        super();
        this.app = app;

        const archGroup = new THREE.Group();

        // Create two vertical poles
        const poleGeometry = new THREE.CylinderGeometry(1, 1, 30, 16);
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });

        // Left pole
        const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
        leftPole.position.set(-45, 15, 0);

        // Right pole
        const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
        rightPole.position.set(45, 15, 0);

        // Top bar
        const topGeometry = new THREE.BoxGeometry(92, 2, 2);
        const topMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        const topBar = new THREE.Mesh(topGeometry, topMaterial);
        topBar.position.set(0, 29, 0);

        archGroup.add(leftPole);
        archGroup.add(rightPole);
        archGroup.add(topBar);

        archGroup.rotation.y = Math.PI / 2;

        if (position) {
            archGroup.position.copy(position);
        }

        this.add(archGroup);
    }
}

export { MyMeta };