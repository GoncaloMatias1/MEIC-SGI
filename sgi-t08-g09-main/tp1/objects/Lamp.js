import * as THREE from 'three';
/**
    This class represents the Lamp
*/ 
class Lamp {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;
    }

    /**
       creates the candle mesh
    */
    create() {
        // Creates the shade mesh
        const shadeGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1, 32);
        const shadeMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const shadeMesh = new THREE.Mesh(shadeGeometry, shadeMaterial);

        // Shade transformations
        shadeMesh.rotation.x = Math.PI / 2;

        // Enable shadow
        shadeMesh.castShadow = true;

        // Creates the string mesh
        const stringGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2, 32);
        const stringMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const stringMesh = new THREE.Mesh(stringGeometry, stringMaterial);

        // String Transformations
        stringMesh.position.set(0, 0, 1);
        stringMesh.rotation.x = Math.PI / 2;

        // Enable shadow
        stringMesh.castShadow = true;

        // Creates the bulb mesh
        const bulbGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const bulbMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color
        const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);

        // Bulb transformations
        bulbMesh.position.set(0, 0, -0.4);

        // enable shadow
        bulbMesh.castShadow = true;

        // Creates group and adds elements
        const lampGroup = new THREE.Group();
        lampGroup.add(shadeMesh);
        lampGroup.add(stringMesh);
        lampGroup.add(bulbMesh);

        // Group transformations
        lampGroup.position.copy(new THREE.Vector3(0, 8, -8))
        lampGroup.rotation.copy(new THREE.Euler(- Math.PI / 2, 0, 0))

        return lampGroup;
    }
}

export { Lamp };