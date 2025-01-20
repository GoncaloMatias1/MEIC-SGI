import * as THREE from 'three';

/**
    This class represents the spring object
*/ 
class Spring {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app;

        // Spring Material 
        this.springMaterial = new THREE.MeshPhongMaterial({
            color: 0x909090,
            specular: 0x111111,
            shininess: 200,
            side: THREE.DoubleSide
        });
    }

    /**
       creates the spring mesh
    */ 
    create() {
        // Create the spiral curve
        const curve = new THREE.Curve();
        curve.getPoint = function(t) {
            const turns = 5; 
            const height = 1; 
            const radius = 0.3; 
            const angle = turns * 2 * Math.PI * t;
            
            return new THREE.Vector3(
                radius * Math.cos(angle),
                height * t,
                radius * Math.sin(angle)
            );
        };

        // Create the spring mesh
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            100,    
            0.03,   
            8,      
            false   
        );
        this.springMesh = new THREE.Mesh(tubeGeometry, this.springMaterial);
        this.springMesh.castShadow = true;

        // Create spring group
        const springGroup = new THREE.Group();
        springGroup.add(this.springMesh);

        // Group transformations 
        springGroup.position.set(-3, 3.145, 1);

        return springGroup;
    }

}

export { Spring };