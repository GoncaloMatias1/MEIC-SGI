import * as THREE from 'three';

class MyParkingArea extends THREE.Object3D {
    constructor(app, options = {}) {
        super();
        this.app = app;

        // Default options
        this.options = {
            position: options.position || new THREE.Vector3(0, 0, 0),
            rotation: options.rotation || 0,
            size: options.size || { width: 60, length: 100 },
            type: options.type || 'competitor'  
        };

        this.createParking();
    }

    createParking() {
        const group = new THREE.Group();

        // Create main platform with asphalt texture
        const platformGeometry = new THREE.BoxGeometry(
            this.options.size.width,
            1,
            this.options.size.length
        );
        
        // Create asphalt-like texture
        const textureCanvas = document.createElement('canvas');
        const ctx = textureCanvas.getContext('2d');
        textureCanvas.width = 256;
        textureCanvas.height = 256;
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add some noise for asphalt texture
        for (let i = 0; i < 5000; i++) {
            ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.3})`;
            ctx.fillRect(
                Math.random() * 256,
                Math.random() * 256,
                2,
                2
            );
        }

        const asphaltTexture = new THREE.CanvasTexture(textureCanvas);
        asphaltTexture.wrapS = THREE.RepeatWrapping;
        asphaltTexture.wrapT = THREE.RepeatWrapping;
        asphaltTexture.repeat.set(4, 8);

        const platformMaterial = new THREE.MeshStandardMaterial({ 
            map: asphaltTexture,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = 0.5;
        platform.receiveShadow = true;
        group.add(platform);

        // Add parking spot markings
        this.addParkingSpots(group);

        // Add light posts
        this.addLightPosts(group);

        // Add parking sign
        //this.addParkingSign(group);

        // Border curbs
        this.addCurbs(group);

        // Position and rotate entire group
        group.position.copy(this.options.position);
        group.rotation.y = this.options.rotation;

        this.add(group);
    }

    addParkingSpots(group) {
        const markingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: 0x333333
        });

        // Create parking spots with white lines
        const spotWidth = this.options.size.width * 0.8;
        const lineGeometry = new THREE.BoxGeometry(spotWidth, 0.1, 2);
        const spotSpacing = this.options.size.length / 4;

        for (let i = -1; i <= 1; i++) {
            const line = new THREE.Mesh(lineGeometry, markingMaterial);
            line.position.set(0, 0.51, i * spotSpacing);
            group.add(line);
        }
    }

    addLightPosts(group) {
        const postPositions = [
            [-this.options.size.width/2 + 5, this.options.size.length/2 - 5],
            [this.options.size.width/2 - 5, this.options.size.length/2 - 5],
            [-this.options.size.width/2 + 5, -this.options.size.length/2 + 5],
            [this.options.size.width/2 - 5, -this.options.size.length/2 + 5]
        ];

        postPositions.forEach(pos => {
            // Post
            const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 15, 8);
            const postMaterial = new THREE.MeshStandardMaterial({ color: 0x404040 });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(pos[0], 7.5, pos[1]);
            
            // Light fixture
            const fixtureGeometry = new THREE.BoxGeometry(2, 1, 2);
            const fixtureMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffffcc,
                emissive: 0xffffcc,
                emissiveIntensity: 0.5
            });
            const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
            fixture.position.set(pos[0], 14, pos[1]);

            group.add(post);
            group.add(fixture);

            // Add light
            const light = new THREE.PointLight(0xffffcc, 1, 30);
            light.position.set(pos[0], 14, pos[1]);
            group.add(light);
        });
    }

    addParkingSign(group) {
        // Sign post
        const postGeometry = new THREE.CylinderGeometry(0.5, 0.5, 20, 8);
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(
            -this.options.size.width/2 + 10,
            10,
            -this.options.size.length/2 + 10
        );
        group.add(post);

        // Sign board
        const signGeometry = new THREE.BoxGeometry(12, 8, 0.5);
        const signMaterial = new THREE.MeshStandardMaterial({ 
            color: this.options.type === 'competitor' ? 0x4169E1 : 0xDC143C
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(
            -this.options.size.width/2 + 10,
            16,
            -this.options.size.length/2 + 10
        );
        group.add(sign);

        // Add text
        const text = this.createText();
        text.position.set(
            -this.options.size.width/2 + 10,
            16,
            -this.options.size.length/2 + 9.8
        );
        text.scale.set(6, 6, 1);
        group.add(text);
    }

    addCurbs(group) {
        const curbGeometry = new THREE.BoxGeometry(
            this.options.size.width + 2,
            1,
            2
        );
        const curbMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

        // Front and back curbs
        const frontCurb = new THREE.Mesh(curbGeometry, curbMaterial);
        frontCurb.position.set(0, 0.5, this.options.size.length/2);
        group.add(frontCurb);

        const backCurb = new THREE.Mesh(curbGeometry, curbMaterial);
        backCurb.position.set(0, 0.5, -this.options.size.length/2);
        group.add(backCurb);

        // Side curbs
        const sideCurbGeometry = new THREE.BoxGeometry(
            2,
            1,
            this.options.size.length + 2
        );

        const leftCurb = new THREE.Mesh(sideCurbGeometry, curbMaterial);
        leftCurb.position.set(-this.options.size.width/2, 0.5, 0);
        group.add(leftCurb);

        const rightCurb = new THREE.Mesh(sideCurbGeometry, curbMaterial);
        rightCurb.position.set(this.options.size.width/2, 0.5, 0);
        group.add(rightCurb);
    }

    createText() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        context.fillStyle = '#ffffff';
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.fillText('P', 128, 50);
        context.font = 'bold 24px Arial';
        context.fillText(
            this.options.type.toUpperCase(),
            128,
            80
        );

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });

        return new THREE.Sprite(spriteMaterial);
    }
}

export { MyParkingArea };