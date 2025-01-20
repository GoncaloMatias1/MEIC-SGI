import * as THREE from 'three';

/**
    This class represents the Floor Lamp
*/ 
class FloorLamp {
    
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;
    }

    /**
       creates the floor lamp mesh
    */ 
    create() {
        // Creates the shade mesh
        const shadeGeometry = new THREE.CylinderGeometry(0.7, 1, 1.2, 32, 32, true);
        const shadeMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide });
        const shadeMesh = new THREE.Mesh(shadeGeometry, shadeMaterial);

        // Shade transformations
        shadeMesh.rotation.x = Math.PI / 2;

        // Enable shadow
        shadeMesh.castShadow = true;

        // Creates the string mesh
        const stringGeometry = new THREE.CylinderGeometry(0.03, 0.03, 8, 32);
        const stringMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const stringMesh = new THREE.Mesh(stringGeometry, stringMaterial);

        // String Transformations
        stringMesh.position.set(0, 0, 4);
        stringMesh.rotation.x = Math.PI / 2;

        // Enable shadow
        stringMesh.castShadow = true;

        // Creates the bulb mesh
        const bulbGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const bulbMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color
        const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);

        // Bulb transformations
        bulbMesh.position.set(0, 0, -0.2);

        // enable shadow
        bulbMesh.castShadow = true;

        // Creates base mesh
        const baseGeometry = new THREE.CylinderGeometry(1, 0.75, 0.2, 64);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF});
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);

        // base transformations
        baseMesh.position.set(0, 0, 7.9)
        baseMesh.rotation.set(Math.PI/2, 0, 0);

        // enable shadow projection
        baseMesh.receiveShadow = true;

        // Creates group and adds elements
        const lampGroup = new THREE.Group();
        lampGroup.add(shadeMesh);
        lampGroup.add(stringMesh);
        lampGroup.add(bulbMesh);
        lampGroup.add(baseMesh);

        // Group transformations
        lampGroup.position.copy(new THREE.Vector3(8, 8, 13))
        lampGroup.rotation.copy(new THREE.Euler(Math.PI / 2, 0, 0))

        return lampGroup;
    }
}

export { FloorLamp };