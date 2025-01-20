import * as THREE from 'three';

/**
    This class represents the Door
*/ 
class Door {
    constructor(app, width = 3, height = 7) {
        this.app = app;

        // Door attributes
        this.width = width;
        this.height = height;
        this.doorColor = 0xD2B48C;  
        this.handleColor = 0xB87333;  
        
        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Door Material
        this.doorTexture = this.textureLoader.load('textures/door_texture.jpg');
        this.doorTexture.wrapS = THREE.RepeatWrapping;
        this.doorTexture.wrapT = THREE.RepeatWrapping;
        this.doorTexture.repeat.set(1, 1);
        this.doorMaterial = new THREE.MeshPhongMaterial({
            color: this.doorColor,
            map: this.doorTexture
        });

        // Handle Material
        this.handleMaterial = new THREE.MeshPhongMaterial({
            color: this.handleColor,
            specular: 0xFFFFFF,
            shininess: 100
        });
    }

    /**
       creates the door mesh
    */
    create() {
        // Creates the Door Group
        const doorGroup = new THREE.Group();

        // Creates the door mesh
        const doorGeometry = new THREE.BoxGeometry(this.width, this.height, 0.2);
        const doorMesh = new THREE.Mesh(doorGeometry, this.doorMaterial);

        // Door transformations
        doorMesh.position.y = this.height / 2;
        
        // Creates the handle meshes
        const handleDistanceFromEdge = 0.5;  
        const handleHeight = this.height / 2;  
        const handleXPosition = this.width/2 - handleDistanceFromEdge;  
        const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16);
        const outsideHandleMesh = new THREE.Mesh(handleGeometry, this.handleMaterial);
        outsideHandleMesh.rotation.z = Math.PI / 2;
        outsideHandleMesh.position.set(handleXPosition, handleHeight, 0.1); 
        const insideHandleMesh = new THREE.Mesh(handleGeometry, this.handleMaterial);
        insideHandleMesh.rotation.z = Math.PI / 2;
        insideHandleMesh.position.set(handleXPosition, handleHeight, -0.1); 

        // Creates the door frame
        const frameThickness = 0.2;
        const frameWidth = 0.3;
        const topFrameGeometry = new THREE.BoxGeometry(this.width + frameWidth * 2, frameWidth, frameThickness);
        const topFrame = new THREE.Mesh(topFrameGeometry, this.doorMaterial);
        topFrame.position.y = this.height + frameWidth/2;
        const sideFrameGeometry = new THREE.BoxGeometry(frameWidth, this.height + frameWidth * 2, frameThickness);
        const leftFrame = new THREE.Mesh(sideFrameGeometry, this.doorMaterial);
        leftFrame.position.set(-(this.width/2 + frameWidth/2), this.height/2, 0);
        const rightFrame = new THREE.Mesh(sideFrameGeometry, this.doorMaterial);
        rightFrame.position.set(this.width/2 + frameWidth/2, this.height/2, 0);
        const panelGeometry = new THREE.BoxGeometry(this.width - 0.4, this.height/3 - 0.2, 0.05);
        const panelMaterial = this.doorMaterial.clone();
        panelMaterial.color.setHex(this.doorColor);
        const positions = [
            this.height/6,
            this.height/2,
            5 * this.height/6
        ];
        positions.forEach(yPos => {
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.set(0, yPos, 0.05);  
            doorGroup.add(panel);
        });

        // Add every element to group
        doorGroup.add(doorMesh);
        doorGroup.add(outsideHandleMesh);
        doorGroup.add(insideHandleMesh);
        doorGroup.add(topFrame);
        doorGroup.add(leftFrame);
        doorGroup.add(rightFrame);

        return doorGroup;
    }

}

export { Door };