import * as THREE from 'three';

/**
    This class represents the Table
*/ 
class Table {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Top material
        this.topColor = '#8B4513';
        this.topTexture = this.textureLoader.load('textures/wood_texture.jpg');
        this.topMaterial = new THREE.MeshPhongMaterial({
            map: this.topTexture,
            color: this.topColor,
            specular: 0x111111,
            shininess: 30
        });

        // Leg Material
        this.legColor = '#FFFFFF';
        this.legMaterial = new THREE.MeshStandardMaterial({
            color: this.legColor,
            metalness: 1.0,
            roughness: 0.1
          });
    }

    /**
       creates the table mesh
    */ 
    create() {
        // Creates the table group
        const tableGroup = new THREE.Group();

        // Creates Table top
        const topGeometry = new THREE.BoxGeometry(8, 0.2, 4);
        const topMesh = new THREE.Mesh(topGeometry, this.topMaterial);
        topMesh.position.set(0, 3, 0);
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        tableGroup.add(topMesh);

        // Creates Table legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
        for (let i = 0; i < 4; i++) {
            const legMesh = new THREE.Mesh(legGeometry, this.legMaterial);
            legMesh.position.set(
                ((i % 2) * 2 - 1) * 3.5,
                1.5,
                (Math.floor(i / 2) * 2 - 1) * 1.5
            );
            legMesh.castShadow = true;
            tableGroup.add(legMesh);
        }

        return tableGroup;
    }

}

export { Table };