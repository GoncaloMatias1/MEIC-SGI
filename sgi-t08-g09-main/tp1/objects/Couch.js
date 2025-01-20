import * as THREE from 'three';

/**
    This class represents the Couch
*/ 
class Couch {
    constructor(app) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Couch Material
        this.couchTexture = this.textureLoader.load('textures/couch.jpg');
        this.couchTexture.wrapS = THREE.RepeatWrapping;
        this.couchTexture.wrapT = THREE.RepeatWrapping;
        this.couchMaterial = new THREE.MeshLambertMaterial({
            color: 0x888888,
            map: this.couchTexture,
        });
    }

    /**
       creates the couch mesh
    */ 
    create() {
        //Creates the couch group
        const group = new THREE.Group();

        // Creates the Seat shape
        const seatShape = new THREE.Shape();
        seatShape.moveTo(-1, -0.5);
        seatShape.lineTo(1, -0.5);
        seatShape.lineTo(1, 0.5);
        seatShape.lineTo(-1, 0.5);
        seatShape.closePath();

        // Creates the Seat mesh
        const seatGeometry = new THREE.ExtrudeGeometry(seatShape, {
            depth: 0.4,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });
        const seat = new THREE.Mesh(seatGeometry, this.couchMaterial);

        // Seat transformations
        seat.rotation.set(-Math.PI / 2, 0, 0)
        seat.position.set(0, 0, 0.5);

        // Enable shadow
        seat.castShadow = true;

        // Add Seat to group
        group.add(seat);

        // Creates the Backrest shape
        const backrestShape = new THREE.Shape();
        backrestShape.moveTo(-1, -0.25);
        backrestShape.lineTo(1, -0.25);
        backrestShape.lineTo(1, 0.25);
        backrestShape.lineTo(-1, 0.25);
        backrestShape.closePath();

        // Creates the Backrest mesh
        const backrestGeometry = new THREE.ExtrudeGeometry(backrestShape, {
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });
        const backrest = new THREE.Mesh(backrestGeometry, this.couchMaterial);

        // Backrest transformations
        backrest.position.set(0, 0.75, 0); // Position behind the seat
        backrest.scale.set(1,1.5,1)

        // Enable shadow
        backrest.castShadow = true;

        // Add Backrest to group
        group.add(backrest);

        // Create Armrests shape
        const armrestShape = new THREE.Shape();
        armrestShape.moveTo(-0.08, -0.4);
        armrestShape.lineTo(0.08, -0.4);
        armrestShape.lineTo(0.08, 0.4);
        armrestShape.lineTo(-0.08, 0.4);
        armrestShape.closePath();

        // Create Armrest Meshes
        const armrestGeometry = new THREE.ExtrudeGeometry(armrestShape, {
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });
        const leftArmrest = new THREE.Mesh(armrestGeometry, this.couchMaterial);
        const rightArmrest = new THREE.Mesh(armrestGeometry, this.couchMaterial);

        // Armrest Transformations
        leftArmrest.position.set(-1.15, 0.4, 0);
        rightArmrest.position.set(1.15, 0.4, 0);

        // Enable shadow
        leftArmrest.castShadow = true;
        leftArmrest.receiveShadow = true;
        rightArmrest.castShadow = true;
        rightArmrest.receiveShadow = true;

        // Add Armrests to group
        group.add(leftArmrest);
        group.add(rightArmrest);

        // Group transformations
        group.rotation.set(0, -Math.PI / 2, 0)
        group.scale.set(3.5, 3, 3);
        group.position.set(9, 0.15, 6)
        
        return group;
    }
}

export { Couch };
