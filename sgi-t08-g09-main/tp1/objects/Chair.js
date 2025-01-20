import * as THREE from 'three';

/**
    This class represents the Chair
*/ 
class Chair {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Top material
        this.topTexture = this.textureLoader.load('textures/othertable_texture.jpg', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.2, 0.2); 
        });
        this.topColor = '#FFFFFF';
        this.topMaterial = new THREE.MeshPhongMaterial({
            map: this.topTexture,
            color: this.topColor,
            specular: 0x111111,
            shininess: 0
        });

        // Leg Material
        this.legColor = '#FFFFFF';
        this.legMaterial = new THREE.MeshPhongMaterial({
            color: this.legColor,
            specular: 0x555555,
            shininess: 100
        });
    }

    /**
       creates the chair mesh
    */ 
    create() {
        // Creates the chair group
        const chairGroup = new THREE.Group();

        // Creates Chair seat
        const topGeometry = new THREE.BoxGeometry(1.6, 0.1, 1.7);
        const topMesh = new THREE.Mesh(topGeometry, this.topMaterial);
        topMesh.position.set(0, 1.8, 0);
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        chairGroup.add(topMesh);

        // Creates Chair back
        const backGeometry = new THREE.BoxGeometry(1.6, 2.3, 0.15);
        const backMesh = new THREE.Mesh(backGeometry, this.topMaterial);
        backMesh.position.set(0, 3, -0.8);
        backMesh.castShadow = true;
        backMesh.receiveShadow = true;
        chairGroup.add(backMesh);

        // Creates Chair legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.06, 1.9);
        for (let i = 0; i < 4; i++) {
            const legMesh = new THREE.Mesh(legGeometry, this.legMaterial);
            legMesh.position.set(
                ((i % 2) * 2 - 1) * 0.6,
                0.8,
                (Math.floor(i / 2) * 2 - 1) * 0.6
            );
            legMesh.castShadow = true;
            chairGroup.add(legMesh);
        }

        return chairGroup;
    }

}

export { Chair };