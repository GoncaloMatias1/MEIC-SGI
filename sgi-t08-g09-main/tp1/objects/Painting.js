// objects/Painting.js
import * as THREE from 'three';

/**
    This class represents the Painting
*/ 
class Painting {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app, imagePath, position, rotation) {
        this.app = app;
        
        // Wood Frame
        this.frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x555555, 
            specular: 0x222222,
            shininess: 30
        });

        // Create photo material
        this.textureLoader = new THREE.TextureLoader();
        this.photoTexture = this.textureLoader.load(imagePath);
        this.photoMaterial = new THREE.MeshPhongMaterial({
            map: this.photoTexture,
            specular: 0x222222,
            shininess: 30
        });

        // Frame dimensions
        this.frameWidth = 3;
        this.frameHeight = 3.5;
        this.frameDepth = 0.1;
        this.frameBorderWidth = 0.1;
        this.position = position;
        this.rotation = rotation;
    }

    /**
       creates the painting mesh
    */ 
    create() {
        // Creates the painting group 
        const paintingGroup = new THREE.Group();

        // Create the main frame
        const frameGeometry = new THREE.BoxGeometry(
            this.frameWidth,
            this.frameHeight,
            this.frameDepth
        );
        const frame = new THREE.Mesh(frameGeometry, this.frameMaterial);

        // Creates the photo
        const photoGeometry = new THREE.PlaneGeometry(
            this.frameWidth - this.frameBorderWidth * 2,
            this.frameHeight - this.frameBorderWidth * 2
        );
        const photo = new THREE.Mesh(photoGeometry, this.photoMaterial);
        photo.position.z = this.frameDepth / 2 + 0.001; // Slightly in front of frame

        // Add elements to group
        paintingGroup.add(frame);
        paintingGroup.add(photo);

        // Group transformations
        paintingGroup.position.copy(this.position);
        paintingGroup.rotation.copy(this.rotation);

        return paintingGroup;
    }

    updatePhoto(newImagePath) {
        this.photoTexture = this.textureLoader.load(newImagePath);
        this.photoMaterial.map = this.photoTexture;
        this.photoMaterial.needsUpdate = true;
    }
}

export { Painting };