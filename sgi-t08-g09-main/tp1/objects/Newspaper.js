import * as THREE from 'three';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

/**
    This class represents the Newspaper
*/ 
class Newspaper {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app;

        // Init nurbs builder
        this.builder = new MyNurbsBuilder(this.app)

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // Newspaper Material
        this.newspaperTexture = this.textureLoader.load('textures/newspaper.jpg');
        this.newspaperTexture.rotation = Math.PI;
        this.newspaperTexture.center.set(0.5, 0.5);
        this.newspaperMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide,
            map: this.newspaperTexture
        });
    }

    /**
       creates the newspaper mesh
    */ 
    create() {
        // Create newspaper group
        const newspaperGroup = new THREE.Group();

        // Create newspaper base mesh
        const plane = new THREE.PlaneGeometry(1.25,2);
        const planeMesh = new THREE.Mesh(plane, this.newspaperMaterial);
        planeMesh.receiveShadow = true;
        newspaperGroup.add(planeMesh);

        // Create multiple newspaper sheets using nurbs builder
        const controlPoints1 = [
            [
                [-0.625, 0, 0.0, 1],  // Top left
                [0.625, 0, 0.0, 1]    // Top right
            ],
            [
                [-0.625, 0.25, 0.22, 0.8],  // Upper-middle left
                [0.625, 0.25, 0.22, 0.8]    // Upper-middle right
            ],
            [
                [-0.625, 0.8, 0.25, 0.8],  // Lower-middle left
                [0.625, 0.8, 0.25, 0.8]    // Lower-middle right
            ],
            [
                [-0.625, 0.9, 0.2, 0.8],  // Bottom left
                [0.625, 0.9, 0.2, 0.8]    // Bottom right
            ]
        ];
		const sheet1 = this.builder.build(controlPoints1, 3, 1, 32, 32);
		const sheet1Mesh = new THREE.Mesh(sheet1, this.newspaperMaterial);
        sheet1Mesh.receiveShadow = true;
        newspaperGroup.add(sheet1Mesh)
        const controlPoints2 = [
            [
                [-0.625, 0, 0.0, 1],  // Top left
                [0.625, 0, 0.0, 1]    // Top right
            ],
            [
                [-0.625, 0.25, 0.10, 0.8],  // Upper-middle left
                [0.625, 0.25, 0.10, 0.8]    // Upper-middle right
            ],
            [
                [-0.625, 0.8, 0.15, 0.8],  // Lower-middle left
                [0.625, 0.8, 0.15, 0.8]    // Lower-middle right
            ],
            [
                [-0.625, 0.95, 0.12, 0.8],  // Bottom left
                [0.625, 0.95, 0.12, 0.8]    // Bottom right
            ]
        ];
		const sheet2 = this.builder.build(controlPoints2, 3, 1, 32, 32);
		const sheet2Mesh = new THREE.Mesh(sheet2, this.newspaperMaterial);
        sheet2Mesh.receiveShadow = true;
        newspaperGroup.add(sheet2Mesh)
        const controlPoints3 = [
            [
                [-0.625, 0, 0.0, 1],  // Top left
                [0.625, 0, 0.0, 1]    // Top right
            ],
            [
                [-0.625, 0.25, 0.06, 0.8],  // Upper-middle left
                [0.625, 0.25, 0.06, 0.8]    // Upper-middle right
            ],
            [
                [-0.625, 0.8, 0.08, 0.8],  // Lower-middle left
                [0.625, 0.8, 0.08, 0.8]    // Lower-middle right
            ],
            [
                [-0.625, 0.98, 0.02, 0.8],  // Bottom left
                [0.625, 0.98, 0.02, 0.8]    // Bottom right
            ]
        ];
		const sheet3 = this.builder.build(controlPoints3, 3, 1, 32, 32);
		const sheet3Mesh = new THREE.Mesh(sheet3, this.newspaperMaterial);
        sheet3Mesh.receiveShadow = true;
        newspaperGroup.add(sheet3Mesh)
        const controlPoints4 = [
            [
                [-0.625, 0, 0.0, 1],  // Top left
                [0.625, 0, 0.0, 1]    // Top right
            ],
            [
                [-0.625, 0.25, 0.4, 0.8],  // Upper-middle left
                [0.625, 0.25, 0.4, 0.8]    // Upper-middle right
            ],
            [
                [-0.625, 0.6, 0.5, 0.8],  // Lower-middle left
                [0.625, 0.6, 0.5, 0.8]    // Lower-middle right
            ],
            [
                [-0.625, 0.85, 0.45, 0.8],  // Bottom left
                [0.625, 0.85, 0.45, 0.8]    // Bottom right
            ]
        ];
		const sheet4 = this.builder.build(controlPoints4, 3, 1, 32, 32);
		const sheet4Mesh = new THREE.Mesh(sheet4, this.newspaperMaterial);
        sheet4Mesh.receiveShadow = true;
        newspaperGroup.add(sheet4Mesh)
        const controlPoints5 = [
            [
                [-0.625, 0, 0.0, 1],  // Top left
                [0.625, 0, 0.0, 1]    // Top right
            ],
            [
                [-0.625, -0.25, 0.06, 0.8],  // Upper-middle left
                [0.625, -0.25, 0.06, 0.8]    // Upper-middle right
            ],
            [
                [-0.625, -0.8, 0.08, 0.8],  // Lower-middle left
                [0.625, -0.8, 0.08, 0.8]    // Lower-middle right
            ],
            [
                [-0.625, -0.98, 0.02, 0.8],  // Bottom left
                [0.625, -0.98, 0.02, 0.8]    // Bottom right
            ]
        ];
		const sheet5 = this.builder.build(controlPoints5, 3, 1, 32, 32);
		const sheet5Mesh = new THREE.Mesh(sheet5, this.newspaperMaterial);
        sheet5Mesh.receiveShadow = true;
        newspaperGroup.add(sheet5Mesh)

        // Newspaper group transformations
        newspaperGroup.rotation.copy(new THREE.Euler(-Math.PI / 2, 0, 0))
        newspaperGroup.translateZ(1);
        newspaperGroup.scale.set(1.4,1.4,1.4);

        return newspaperGroup;
    }

}

export { Newspaper };
