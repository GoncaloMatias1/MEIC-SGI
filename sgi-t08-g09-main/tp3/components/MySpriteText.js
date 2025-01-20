import * as THREE from 'three';

class MySpriteText {
    constructor(app) {
        this.app = app;
    
        // Load the sprite font texture
        const textureLoader = new THREE.TextureLoader();
        this.fontTexture = textureLoader.load('scene/textures/sprite.png', 
            // Success callback
            (texture) => {
                console.log('Sprite texture loaded successfully');
            },
            // Progress callback
            undefined,
            // Error callback
            (error) => {
                console.error('Error loading sprite texture:', error);
            }
        );
        this.fontTexture.magFilter = THREE.NearestFilter;
        this.fontTexture.minFilter = THREE.NearestFilter;
        
        
        this.charsPerRow = 16;
        this.charsPerCol = 16;
        this.charWidth = 1/16;  // Each character takes 1/16 of texture width
        this.charHeight = 1/16; // And 1/16 of texture height
    }

    // Get UV coordinates for a character
    getUVsForChar(char) {
        const charCode = char.charCodeAt(0);
        const col = charCode % this.charsPerCol;
        const row = Math.floor(charCode / this.charsPerRow);
        
        const u = col / this.charsPerCol;
        const v = 1 - (row / this.charsPerRow) - this.charHeight;
        
        return { u, v };
    }

    // Create a single character's mesh
    createCharacterMesh(char, size = 1) {
        const geometry = new THREE.PlaneGeometry(size, size);
        const uvs = this.getUVsForChar(char);
        
        // Set UV coordinates for the character
        const uvArray = geometry.attributes.uv.array;
        // Bottom left
        uvArray[0] = uvs.u;
        uvArray[1] = uvs.v;
        // Bottom right
        uvArray[2] = uvs.u + this.charWidth;
        uvArray[3] = uvs.v;
        // Top left
        uvArray[4] = uvs.u;
        uvArray[5] = uvs.v + this.charHeight;
        // Top right
        uvArray[6] = uvs.u + this.charWidth;
        uvArray[7] = uvs.v + this.charHeight;

        const material = new THREE.MeshBasicMaterial({
            map: this.fontTexture,
            transparent: true,
            side: THREE.DoubleSide
        });

        return new THREE.Mesh(geometry, material);
    }

    // Create a full text mesh
    createText(text, size = 1) {
        const group = new THREE.Group();
        const spacing = size * 0.75;

        for (let i = 0; i < text.length; i++) {
            const charMesh = this.createCharacterMesh(text[i], size);
            charMesh.position.x = i * spacing;
            charMesh.rotation.x = Math.PI;
            group.add(charMesh);
        }

        // Center the text
        const totalWidth = text.length * spacing;
        group.position.x = -totalWidth / 2;

        group.rotation.y = Math.PI;

        return group;
    }
}

export { MySpriteText };