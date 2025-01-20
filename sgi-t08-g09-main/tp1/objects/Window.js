import * as THREE from 'three';

/**
    This class represents the Window
*/ 
class Window {
    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app, width = 4, height = 3) {
        this.app = app;

        // Init texture loader
        this.textureLoader = new THREE.TextureLoader();

        // window Attributes
        this.width = width;
        this.height = height;

        // Window Material
        this.windowTexture = null;
        this.windowMaterial = null;
        this.frameMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            specular: 0x444444,
            shininess: 30
        });
        this.loadTexture('textures/bigsur.jpg');
    }

    /**
       loads texture on window
    */ 
    loadTexture(imagePath) {
        this.textureLoader.load(
            imagePath,
            (texture) => {
                this.windowTexture = texture;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                
                this.windowMaterial = new THREE.MeshBasicMaterial({
                    map: this.windowTexture,
                    side: THREE.DoubleSide
                });
                
                if (this.mainWindowPane) {
                    this.mainWindowPane.material = this.windowMaterial;
                }
            },
            undefined,
            (err) => {
                console.error('An error occurred while loading the texture:', err);
            }
        );
    }

    /**
       creates window frame
    */ 
    createFrame(width, height, depth, material) {
        const frame = new THREE.BoxGeometry(width, height, depth);
        return new THREE.Mesh(frame, material);
    }

    /**
       creates the window mesh
    */ 
    create() {
        // Creates window group
        const windowGroup = new THREE.Group();
        
        // frame dimensions
        const frameDepth = 0.2;
        const frameBorderWidth = 0.3;
        const dividerWidth = 0.1;

        // Creates outer frame
        const outerFrame = this.createFrame(
            this.width + frameBorderWidth * 2, 
            this.height + frameBorderWidth * 2, 
            frameDepth,
            this.frameMaterial
        );
        outerFrame.position.z = -frameDepth / 2;
        windowGroup.add(outerFrame);

        // Creates Main pane
        const mainPaneGeometry = new THREE.PlaneGeometry(this.width, this.height);
        this.mainWindowPane = new THREE.Mesh(
            mainPaneGeometry,
            this.windowMaterial || new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        this.mainWindowPane.position.z = 0.01;
        windowGroup.add(this.mainWindowPane);

        // Creates vertical divider
        const verticalDivider = this.createFrame(
            dividerWidth,
            this.height,
            frameDepth,
            this.frameMaterial
        );
        verticalDivider.position.z = frameDepth / 2;
        windowGroup.add(verticalDivider);

        // Creates inner frame
        const innerFrame = this.createFrame(
            this.width,
            this.height,
            frameDepth * 0.7,
            this.frameMaterial
        );
        innerFrame.position.z = -frameDepth * 0.6;
        windowGroup.add(innerFrame);

        // Creates window sill
        const sillDepth = 0.5;
        const sillHeight = 0.15;
        const sill = this.createFrame(
            this.width + frameBorderWidth * 2,
            sillHeight,
            sillDepth,
            this.frameMaterial
        );
        sill.position.y = -(this.height + frameBorderWidth * 2) / 2;
        sill.position.z = sillDepth / 2 - frameDepth;
        windowGroup.add(sill);

        return windowGroup;
    }

}

export { Window };