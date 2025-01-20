// objects/Beetle.js
import * as THREE from 'three';

/**
    This class represents the beetle 
*/ 
class Beetle {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;
        
        //  Wood frame
        this.frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x555555, 
            specular: 0x222222,
            shininess: 30
        });

        // Create background material
        this.photoMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0x222222,
            shininess: 30
        });

        // Beetle line material
        this.lineMaterial = new THREE.LineBasicMaterial({color: 0x000000})

        // Frame dimensions
        this.frameWidth = 6;
        this.frameHeight = 4;
        this.frameDepth = 0.1;
        this.frameBorderWidth = 0.1;

        // Number of samples for beetle line
        this.numberofSamples = 20;
    }

    /**
       creates and returns the beetle mesh
    */ 
    create() {
        // Create beetle Group
        const beetleGroup = new THREE.Group();

        // Create the main frame
        const frameGeometry = new THREE.BoxGeometry(
            this.frameWidth,
            this.frameHeight,
            this.frameDepth
        );
        const frame = new THREE.Mesh(frameGeometry, this.frameMaterial);

        // Create the background frame
        const backgroundGeometry = new THREE.PlaneGeometry(
            this.frameWidth - this.frameBorderWidth * 2,
            this.frameHeight - this.frameBorderWidth * 2
        );
        const background = new THREE.Mesh(backgroundGeometry, this.photoMaterial);
        background.position.z = this.frameDepth / 2 + 0.01;
        background.receiveShadow = true;

        // Create the beetle line group
        const beetleLinesGroup = new THREE.Group();
        beetleLinesGroup.add(this.createCurve(0.5, 0.5, Math.PI).translateX(-1).translateY(-1))
        beetleLinesGroup.add(this.createCurve(0.5, 0.5, Math.PI).translateX(1).translateY(-1))
        beetleLinesGroup.add(this.createCurve(1.5, 1.5, Math.PI / 2).rotateZ(Math.PI/2).translateX(-1).translateY(0))
        beetleLinesGroup.add(this.createCurve(0.75, 0.75, Math.PI / 2).translateY(-0.25))
        beetleLinesGroup.add(this.createCurve(0.75, 0.75, Math.PI / 2).translateX(0.75).translateY(-1))
        beetleLinesGroup.translateY(0.45)
        beetleLinesGroup.scale.set(1.4, 1.4, 1.4)

        // Add every mesh to initial group
        beetleGroup.add(frame)
        beetleGroup.add(background)
        beetleGroup.add(beetleLinesGroup)

        // Transformations
        beetleGroup.position.copy(new THREE.Vector3(3, 6.5, 14.9))
        beetleGroup.rotation.copy(new THREE.Euler(0, -Math.PI, 0))

        return beetleGroup;
    }

    /**
       auxiliary function to create beetle lines
    */ 
    createCurve(xRadius, yRadius, angle) {
        // Create a curve 
        const curve = new THREE.EllipseCurve(
            0,0,
            xRadius, yRadius,
            0, angle,
            false
        )

        // Get points based on number of samples
        let sampledPoints = curve.getPoints(this.numberofSamples)

        // Create geometry and object of the line
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(sampledPoints)
        const lineObj = new THREE.Line( curveGeometry, this.lineMaterial )

        // Makes it be in front of the frame
        lineObj.position.z = this.frameDepth / 2 + 0.1

        return lineObj
    }

}

export { Beetle };