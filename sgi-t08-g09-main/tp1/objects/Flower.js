import * as THREE from 'three';

/**
    This class represents the Flower
*/ 
class Flower {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Create flower Group
        this.flowerGroup = new THREE.Group();

        // Flower Attributes
        this.flowerColor = 0xFF69B4;
        this.stemColor = 0x228B22;
    }

    /**
       creates the flower mesh
    */ 
    create() {
        // Create stem mesh
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.2, 0.4, 0.1),
            new THREE.Vector3(-0.1, 0.8, -0.1),
            new THREE.Vector3(0.1, 1.2, 0.2),
            new THREE.Vector3(0, 1.5, 0)
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        const stemGeometry = new THREE.TubeGeometry(curve, 50, 0.02, 8, false);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: this.stemColor,
            roughness: 0.7
        });
        const stemMesh = new THREE.Mesh(stemGeometry, stemMaterial);

        // Enable shadow
        stemMesh.castShadow = true;

        // Create petal shape
        const petalShape = new THREE.Shape();
        petalShape.moveTo(0, 0);
        petalShape.bezierCurveTo(
            0.2, 0.1,    // control point 1
            0.15, 0.3,   // control point 2
            0, 0.4       // end point
        );
        petalShape.bezierCurveTo(
            -0.15, 0.3,  // control point 1
            -0.2, 0.1,   // control point 2
            0, 0         // end point
        );
        const petalGeometry = new THREE.ShapeGeometry(petalShape);

        // Petal Material
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: this.flowerColor,
            roughness: 0.6,
            side: THREE.DoubleSide
        });

        // Add petals to group
        const petalLayers = [8, 6]; // Number of petals in each layer
        const layerOffsets = [0, Math.PI / 8]; 
        const layerScales = [1, 0.8]; 
        petalLayers.forEach((numPetals, layerIndex) => {
            for (let i = 0; i < numPetals; i++) {
                const petalMesh = new THREE.Mesh(petalGeometry, petalMaterial);
                petalMesh.position.set(0, 1.5, 0);
                petalMesh.rotation.z = (i * (2 * Math.PI) / numPetals) + layerOffsets[layerIndex];
                petalMesh.scale.set(layerScales[layerIndex], layerScales[layerIndex], layerScales[layerIndex]);
                petalMesh.castShadow = true;
                this.flowerGroup.add(petalMesh);
            }
        });

        // Create center mesh
        const centerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const centerMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            roughness: 0.2
        });
        const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);

        // Center transformations
        centerMesh.position.set(0, 1.5, 0);

        // enable shadow
        centerMesh.castShadow = true;

        // Add stem and center to group
        this.flowerGroup.add(stemMesh);
        this.flowerGroup.add(centerMesh);

        // Group transformations
        this.flowerGroup.rotation.set(0, Math.PI/2, 0);
        this.flowerGroup.position.set(4, 0.4, 14);
        this.flowerGroup.scale.set(2, 2, 2);

        return this.flowerGroup;
    }

}

export { Flower };