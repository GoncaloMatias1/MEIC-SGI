import * as THREE from 'three';

/**
    This class represents the jar
*/ 
class Jar {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Jar Material
        this.jarMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xE0E0E0,
            roughness: 0.1,
            metalness: 0.1,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        // Rim material
        this.rimMaterial = new THREE.MeshStandardMaterial({
            color: 0x999999,
            roughness: 0.3,
            metalness: 0.5
        });

    }
    /**
       creates the Jar mesh
    */ 
    create() {
        // Create Jar group
        const jarGroup = new THREE.Group();

        // Create two curved surfaces to represent the jar
        const bodyPoints = [];
        const bodyRadius = 0.3;
        const bodyHeight = 0.6;
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const radius = bodyRadius * (1 + 0.25 * Math.sin(Math.PI * t));
            bodyPoints.push(new THREE.Vector2(radius, t * bodyHeight));
        }
        const neckPoints = [];
        const neckStartRadius = bodyPoints[bodyPoints.length - 1].x;
        const neckEndRadius = bodyRadius * 0.6;
        const neckHeight = 0.4;
        for (let i = 0; i <= 15; i++) {
            const t = i / 15;
            const curveFactor = Math.sin(t * Math.PI / 2); // Gradual outward curve
            const radius = neckStartRadius + (neckEndRadius - neckStartRadius) * curveFactor;
            neckPoints.push(new THREE.Vector2(radius, bodyHeight + t * neckHeight));
        }
        const bodyGeometry = new THREE.LatheGeometry(bodyPoints, 32);
        const neckGeometry = new THREE.LatheGeometry(neckPoints, 32);
        const bodyMesh = new THREE.Mesh(bodyGeometry, this.jarMaterial);
        const neckMesh = new THREE.Mesh(neckGeometry, this.jarMaterial);

        // Create the rim mesh
        const rimGeometry = new THREE.TorusGeometry(neckEndRadius, 0.02, 16, 32);
        const rimMaterial = new THREE.MeshPhongMaterial({
            color: 0x999999,
            specular: 0x555555,
            shininess: 50
        });
        const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial);
        rimMesh.position.y = bodyHeight + neckHeight;
        rimMesh.rotation.x = Math.PI / 2;

        // Create the bottom mesh
        const bottomGeometry = new THREE.CircleGeometry(bodyRadius, 32);
        const bottomMesh = new THREE.Mesh(bottomGeometry, this.jarMaterial);
        bottomMesh.rotation.x = -Math.PI / 2;

        // Add elements to group
        jarGroup.add(bodyMesh);
        jarGroup.add(neckMesh);
        jarGroup.add(rimMesh);
        jarGroup.add(bottomMesh);

        // Group transformations
        jarGroup.position.set(4, 0.2, 14);
        jarGroup.scale.set(2, 2, 2);

        return jarGroup;
    }

}

export { Jar };