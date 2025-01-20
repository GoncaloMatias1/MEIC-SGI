import * as THREE from 'three';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

class GraphNode {
    constructor(app, data) {
        // Save the app instance for later use
        this.app = app;

        // A Map to keep track of all the nodes we create
        this.nodes = new Map();

        // Pull out the graph, materials, and textures from the input data
        // Default to an empty object if they're missing
        this.graphData = data['graph'] || {};
        this.materialData = data['materials'] || {};
        this.textureData = data['textures'] || {};

        // Initialize a helper to handle NURBS stuff (fancy curve stuff)
        this.nurbsBuilder = new MyNurbsBuilder(this.app);

        // Grab the name of the root node from the graph data
        const rootNodeName = this.graphData.rootid;
        // Get the actual root node data using the root name
        const rootNode = this.graphData[rootNodeName];

        // If we have a root node and its name, let’s create it
        if (rootNodeName && rootNode) {
            this.createNode(rootNodeName, rootNode);
        } else {
            // Otherwise, throw error about the missing root node info
            console.error("Root node or root ID is missing in graph data.");
        }
    }

    createNode(nodeName, nodeData, parentMaterialRef = null, parentCastShadow = false, parentReceiveShadow = false) {
        // Create a new Three.js group to represent this node
        const group = new THREE.Group();
        group.name = nodeName; // Give it a name for identification
    
        // Set the material reference, falling back to the parent's if not provided
        group.materialref = nodeData.materialref || parentMaterialRef;
    
        // Shadow settings, inherited from the parent if not specified
        group.castShadow = nodeData.castshadows || parentCastShadow;
        group.receiveShadow = nodeData.receiveshadows || parentReceiveShadow;
    
        // If the node has children, add them to this group
        if (nodeData.children) {            
            this.addChildren(group, nodeData.children);
        }
    
        // Apply any transformations to the group (like position, rotation, scale)
        if (nodeData.transforms) {
            this.applyTransforms(group, nodeData.transforms);
        }
    
        // Save this group in the node map so we can look it up later
        this.nodes.set(nodeName, group);
    
        // Return the newly created group for further use if needed
        return group;
    }
    

    createLOD(data, parentMaterialRef = null, parentCastShadow = false, parentReceiveShadow = false) {
        // First, check if LOD data is valid
        if (!data.lodNodes || !Array.isArray(data.lodNodes)) {
            console.error("LOD data is missing or invalid.", data);
            return null; // return out if there's no usable LOD data
        }
    
        // Create a new Level of Detail (LOD) object
        const lod = new THREE.LOD();
    
        // Sort the LOD nodes by their minimum distance, just to ensure they're in order
        const sortedLODNodes = [...data.lodNodes].sort((a, b) => a.mindist - b.mindist);
    
        // Loop through each LOD node and process it
        sortedLODNodes.forEach(lodData => {
            if (lodData.nodeId === "empty_lod") {
                // If no specific node is assigned, just add an empty object for this level
                lod.addLevel(new THREE.Object3D(), lodData.mindist);
                return;
            }
    
            if (!this.graphData[lodData.nodeId]) {
                // If the node ID doesn't exist in the graph data, log an error
                console.error(`Invalid LOD node reference: ${lodData.nodeId}`);
                return;
            }
    
            // Fetch the node data and create the node object
            const nodeData = this.graphData[lodData.nodeId];
            const object = this.createNode(
                lodData.nodeId,        // Node name/ID
                nodeData,             // Actual node data
                parentMaterialRef,    // Inherit material reference if needed
                parentCastShadow,     // Shadow casting inherited from the parent
                parentReceiveShadow   // Shadow receiving inherited from the parent
            );
    
            if (object) {
                // Set shadow properties for the LOD object
                object.castShadow = parentCastShadow;
                object.receiveShadow = parentReceiveShadow;
    
                // Add this object as a level in the LOD, tied to its minimum distance
                lod.addLevel(object, lodData.mindist);
            }
        });
    
        // Return the completed LOD object
        return lod;
    }
    

    createPolygon(data, materialref = null, castShadow = false, receiveShadow = false) {
        // Check if all required polygon data is provided
        if (!data.radius || !data.stacks || !data.slices || !data.color_c || !data.color_p) {
            console.error("Polygon data is missing required parameters.", data);
            return null; // return out if something is missing
        }
    
        // Create a new buffer geometry to store the polygon's vertices, colors, and indices
        const geometry = new THREE.BufferGeometry();
        
        const vertices = []; // Store all the points (x, y, z)
        const colors = [];   // Store colors for each vertex
        const indices = [];  // Store the triangle indices for the faces
    
        // Start by adding the center point of the polygon (at the origin)
        vertices.push(0, 0, 0);
        colors.push(data.color_c.r, data.color_c.g, data.color_c.b); // Color for the center (color_c)
    
        // Loop through the stacks (vertical divisions)
        for (let stack = 1; stack <= data.stacks; stack++) {
            // Calculate radius for this stack
            const radius = (stack / data.stacks) * data.radius;
            
            // Loop through the slices (angular divisions)
            for (let slice = 0; slice < data.slices; slice++) {
                // Calculate the angle for the current slice
                const theta = (slice / data.slices) * Math.PI * 2;
                const x = radius * Math.cos(theta); // X coordinate
                const y = radius * Math.sin(theta); // Y coordinate
    
                // Add this vertex
                vertices.push(x, y, 0);
    
                // Interpolate the color between color_c and color_p based on radius
                const t = radius / data.radius;
                colors.push(
                    data.color_c.r * (1 - t) + data.color_p.r * t,
                    data.color_c.g * (1 - t) + data.color_p.g * t,
                    data.color_c.b * (1 - t) + data.color_p.b * t
                );
    
                // Create triangles for the sides of the polygon (except for the first stack)
                if (stack > 1) {
                    const currentVertex = 1 + (stack - 1) * data.slices + slice;
                    const previousVertex = 1 + (stack - 2) * data.slices + slice;
                    const nextSlice = slice === data.slices - 1 ? 0 : slice + 1;
                    const currentNextVertex = 1 + (stack - 1) * data.slices + nextSlice;
                    const previousNextVertex = 1 + (stack - 2) * data.slices + nextSlice;
    
                    // Add the two triangles for the current face
                    indices.push(previousVertex, currentVertex, previousNextVertex);
                    indices.push(currentVertex, currentNextVertex, previousNextVertex);
                } else {
                    // For the first stack, make triangles with the center point
                    if (slice < data.slices - 1) {
                        indices.push(0, slice + 1, slice + 2);
                    } else {
                        indices.push(0, slice + 1, 1); // Wrap the last slice
                    }
                }
            }
        }
    
        // Set up the geometry attributes: positions (vertices), colors, and indices
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
    
        // Compute normals for the lighting
        geometry.computeVertexNormals();
    
        // Create a basic material that uses the vertex colors
        const material = new THREE.MeshBasicMaterial({
            vertexColors: true,
            wireframe: true // Enable wireframe mode for visualization
        });
    
        // Create the mesh using the geometry and material
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = castShadow;   // Set shadow casting for the mesh
        mesh.receiveShadow = receiveShadow; // Set shadow receiving for the mesh
    
        // Return the created mesh
        return mesh;
    }
    

    addChildren(group, childrenData) {
        // If there's no children data, just return out early
        if (!childrenData) return;
    
        // Handle the nodesList (list of nodes that are children)
        if (childrenData.nodesList) {
            for (let nodeName of childrenData.nodesList) {                
                // Create a node from the graph data and add it to the group
                const childObject = this.createNode(
                    nodeName,
                    this.graphData[nodeName],
                    group.materialref,
                    group.castShadow,
                    group.receiveShadow
                );
    
                // If the node was created successfully, add it to the group
                if (childObject) {
                    group.add(childObject);
                }
            }
        }
    
        // Handle the lodsList (list of LODs)
        if (childrenData.lodsList) {
            for (let lodId of childrenData.lodsList) {
                // Get LOD data from the graph
                const lodData = this.graphData[lodId];
                if (lodData && lodData.type === 'lod') {
                    // Create LOD object and add it to the group
                    const childObject = this.createLOD(
                        lodData, 
                        group.materialref,
                        group.castShadow,
                        group.receiveShadow
                    );
                    if (childObject) {
                        group.add(childObject);
                    }
                }
            }
        }
    
        // Handle other types of children (like primitives)
        for (let childName in childrenData) {
            // Skip over nodesList and lodsList since we already handled those
            if (childName !== 'nodesList' && childName !== 'lodsList') {
                const child = childrenData[childName];
                let childObject;
    
                // Based on the child type, create the right kind of object
                switch (child.type) {
                    case 'rectangle':
                        childObject = this.createRectangle(
                            child, 
                            group.materialref,
                            group.castShadow,
                            group.receiveShadow
                        );
                        break;
                    case 'polygon':
                        childObject = this.createPolygon(
                            child, 
                            group.materialref,
                            group.castShadow,
                            group.receiveShadow
                        );
                        break;
                    case 'triangle':
                        childObject = this.createTriangle(
                            child, 
                            group.materialref,
                            group.castShadow,
                            group.receiveShadow
                        );
                        break;
                    case 'box':
                        childObject = this.createBox(
                            child, 
                            group.materialref,
                            group.castShadow,
                            group.receiveShadow
                        );
                        break;
                    case 'cylinder':
                        childObject = this.createCylinder(
                            child, 
                            group.materialref,
                            group.castShadow,
                            group.receiveShadow
                        );
                        break;
                    case 'sphere':
                        childObject = this.createSphere(
                            child, 
                            group.materialref,
                            group.castShadow,
                            group.receiveShadow
                        );
                        break;
                    case 'nurbs':
                        childObject = this.createNurbs(
                            child,
                            group.materialref,
                            group.castShadow,
                            group.receiveShadow
                        );
                        break;
                    case 'pointlight':
                        childObject = this.createPointLight(child);
                        break;
                    case 'spotlight':
                        childObject = this.createSpotLight(child);
                        break;
                    case 'directionallight':
                        childObject = this.createDirectionalLight(child);
                        break;
                    default:
                        // Warn if an unknown type is encountered
                        console.warn(`Unknown child type: ${child.type}`);
                        break;
                }
    
                // If the child object was created, add it to the group
                if (childObject) {
                    group.add(childObject);
                }
            }
        }
    }
    

    createRectangle(data, materialref = null, castShadow, receiveShadow) {
        // Check if the rectangle data has the required coordinates
        if (!data.xy1 || !data.xy2) {
            console.error("Rectangle data is missing coordinates.", data);
            return null; // return out if the coordinates are missing
        }
    
        // Calculate width and height based on the given coordinates
        const width = data.xy2.x - data.xy1.x;
        const height = data.xy2.y - data.xy1.y;
    
        // Create a plane geometry with the calculated width and height
        const geometry = new THREE.PlaneGeometry(width, height);
    
        // Create the material for the rectangle (if provided, else use default)
        const material = this.createMaterial(materialref);
        
        // Create the mesh with the geometry and material
        const mesh = new THREE.Mesh(geometry, material)
    
        // Set whether the rectangle should cast or receive shadows
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
    
        // Return the created mesh
        return mesh;
    }
    

    createTriangle(data, materialref = null, castShadow, receiveShadow) {
        // Check if the triangle data has the required three coordinates
        if (!data.xyz1 || !data.xyz2 || !data.xyz3) {
            console.error("Triangle data is missing coordinates.", data);
            return null; // return out if any of the coordinates are missing
        }
    
        // Create a new buffer geometry for the triangle
        const geometry = new THREE.BufferGeometry();
    
        // Set up the vertices for the triangle using the given coordinates
        const vertices = new Float32Array([
            data.xyz1.x, data.xyz1.y, data.xyz1.z,  // First vertex
            data.xyz2.x, data.xyz2.y, data.xyz2.z,  // Second vertex
            data.xyz3.x, data.xyz3.y, data.xyz3.z   // Third vertex
        ]);
    
        // Set the position attribute for the geometry (the triangle's vertices)
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        // Calculate the vertex normals for proper lighting
        geometry.computeVertexNormals();
    
        // Create the material for the triangle (if provided, else use default)
        const material = this.createMaterial(materialref);
        
        // Create the mesh with the geometry and material
        const mesh = new THREE.Mesh(geometry, material)
    
        // Set whether the triangle should cast or receive shadows
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
    
        // Return the created mesh
        return mesh;
    }
    

    createBox(data, materialref = null, castShadow, receiveShadow) {
        // Check if the box data has the required two coordinates (for opposite corners)
        if (!data.xyz1 || !data.xyz2) {
            console.error("Box data is missing coordinates.", data);
            return null; // return out if any of the coordinates are missing
        }
    
        // Calculate the width, height, and depth of the box based on the coordinates
        const width = data.xyz2.x - data.xyz1.x;
        const height = data.xyz2.y - data.xyz1.y;
        const depth = data.xyz2.z - data.xyz1.z;
    
        // Ensure the box has valid dimensions (all dimensions must be positive)
        if (width <= 0 || height <= 0 || depth <= 0) {
            console.error("Invalid box dimensions. Ensure xyz1 and xyz2 are correct.", data);
            return null; // Bail out if the dimensions are invalid
        }
    
        // Create a box geometry with the calculated dimensions and specified number of subdivisions (parts)
        const geometry = new THREE.BoxGeometry(
            width, 
            height, 
            depth, 
            data.parts_x, 
            data.parts_y, 
            data.parts_z
        );
    
        // Create the material for the box (if provided, else use default)
        const material = this.createMaterial(materialref);
        
        // Create the mesh with the geometry and material
        const mesh = new THREE.Mesh(geometry, material)
    
        // Set whether the box should cast or receive shadows
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
    
        // Return the created mesh (the box)
        return mesh;
    }
    

    createCylinder(data, materialref = null, castShadow, receiveShadow) {
        // Check if the cylinder data has all the required parameters (base, top, height, slices, stacks)
        if (!data.base || !data.top || !data.height || !data.slices || !data.stacks) {
            console.error("Cylinder data is missing required parameters.", data);
            return null; // return out if any required parameters are missing
        }
    
        // Create a cylinder geometry with the provided parameters
        const geometry = new THREE.CylinderGeometry(
            data.base,        // Radius of the base
            data.top,         // Radius of the top
            data.height,      // Height of the cylinder
            data.slices,      // Number of radial segments (slices)
            data.stacks,      // Number of height segments (stacks)
            data.capsclose,   // Whether the top and bottom caps are closed
            data.thetastart,  // Starting angle for the geometry
            data.thetalength  // Angle length (sweep of the cylinder)
        );
    
        // Create the material for the cylinder (if provided, else use default)
        const material = this.createMaterial(materialref);
        
        // Create the mesh with the geometry and material
        const mesh = new THREE.Mesh(geometry, material)
    
        // Set whether the cylinder should cast or receive shadows
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
    
        // Return the created mesh (the cylinder)
        return mesh;
    }
    

    createSphere(data, materialref = null, castShadow, receiveShadow) {
        // Check if the sphere data has all the required parameters (radius, slices, stacks)
        if (!data.radius || !data.slices || !data.stacks) {
            console.error("Sphere data is missing required parameters.", data);
            return null; // return out if any required parameters are missing
        }
    
        // Create a sphere geometry with the provided parameters
        const geometry = new THREE.SphereGeometry(
            data.radius,        // Radius of the sphere
            data.slices,        // Number of slices (longitude segments)
            data.stacks,        // Number of stacks (latitude segments)
            data.thetastart,    // Starting angle for theta (longitude)
            data.thetalength,   // Sweep angle for theta
            data.phistart,      // Starting angle for phi (latitude)
            data.philength      // Sweep angle for phi
        );
    
        // Create the material for the sphere (if provided, else use default)
        const material = this.createMaterial(materialref);
        
        // Create the mesh with the geometry and material
        const mesh = new THREE.Mesh(geometry, material)
    
        // Set whether the sphere should cast or receive shadows
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
    
        // Return the created mesh (the sphere)
        return mesh;
    }
    

    createNurbs(data, materialref = null, castShadow, receiveShadow) {
        // Check if the NURBS data contains all the required parameters (degree_u, degree_v, parts_u, parts_v, controlpoints)
        if (!data.degree_u || !data.degree_v || !data.parts_u || !data.parts_v || !data.controlpoints) {
            console.error("NURBS data is missing required parameters.", data);
            return null; // return out if any required parameters are missing
        }
    
        // Calculate the expected number of control points based on the degree of the U and V directions
        const expectedControlPoints = (data.degree_u + 1) * (data.degree_v + 1);
    
        // Ensure the number of control points matches the expected count
        if (data.controlpoints.length !== expectedControlPoints) {
            console.error(`Expected ${expectedControlPoints} control points, but got ${data.controlpoints.length}.`, data);
            return null; // Bail out if the number of control points is incorrect
        }
    
        // Prepare the control points array, transforming each control point into a 4D format (x, y, z, 1)
        const controlPointsArray = [];
        for (let i = 0; i <= data.degree_v; i++) {
            controlPointsArray.push(
                data.controlpoints
                    .slice(i * (data.degree_u + 1), (i + 1) * (data.degree_u + 1))
                    .map(cp => [cp.x, cp.y, cp.z, 1]) // Convert to 4D control points
            );
        }
    
        // Build the NURBS geometry using the NURBS builder with the control points and degrees
        const geometry = this.nurbsBuilder.build(
            controlPointsArray,
            data.degree_v,
            data.degree_u,
            data.parts_u, 
            data.parts_v
        );
        
        // Create the material for the NURBS surface (if provided, else use default)
        const material = this.createMaterial(materialref);
        
        // Create the mesh with the geometry and material
        const mesh = new THREE.Mesh(geometry, material)
    
        // Set whether the NURBS surface should cast or receive shadows
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
    
        // Return the created mesh (the NURBS surface)
        return mesh;
    }
    

    createPointLight(data) {
        // Check if the PointLight data contains required parameters (color, position)
        if (!data.color || !data.position) {
            console.error("PointLight data is missing required parameters.", data);
            return null; // Bail out if essential parameters are missing
        }
    
        // Create a color object for the point light using the RGB values from the data
        const color = new THREE.Color(
            data.color.r, 
            data.color.g, 
            data.color.b
        );
    
        // Set default values for intensity, distance, and decay if not provided
        const intensity = data.intensity || 1;  // Default intensity is 1
        const distance = data.distance || 1000; // Default distance is 1000
        const decay = data.decay || 2;         // Default decay is 2
    
        // Create the PointLight with the provided or default values
        const light = new THREE.PointLight(color, intensity, distance, decay);
    
        // Set the position of the light using the provided position data
        light.position.set(data.position.x, data.position.y, data.position.z);
    
        // Set whether the light should cast shadows (default is false if not provided)
        light.castShadow = data.castshadow || false;
    
        // Configure the shadow camera's "far" clipping plane and shadow map size
        light.shadow.camera.far = data.shadowfar || 500.0;  // Default far distance is 500
        light.shadow.mapSize.set(data.shadowmapsize || 512, data.shadowmapsize || 512);  // Default map size is 512x512
    
        // Return the created point light object
        return light;
    }
    
    
    createSpotLight(data) {
        // Check if the SpotLight data contains required parameters (color, position, target, angle)
        if (!data.color || !data.position || !data.target || typeof data.angle === 'undefined') {
            console.error("SpotLight data is missing required parameters.", data);
            return null; // return out if any of the essential parameters are missing
        }
    
        // Create a color object for the spot light using the RGB values from the data
        const color = new THREE.Color(
            data.color.r, 
            data.color.g, 
            data.color.b
        );
    
        // Set default values for intensity, distance, decay, and penumbra if not provided
        const intensity = data.intensity || 1;  // Default intensity is 1
        const distance = data.distance || 1000; // Default distance is 1000
        const decay = data.decay || 2;         // Default decay is 2
        const penumbra = data.penumbra || 1;   // Default penumbra is 1 (softness of the spotlight)
    
        // Create the SpotLight with the provided or default values
        const light = new THREE.SpotLight(color, intensity, distance, data.angle, penumbra, decay);
    
        // Set the position of the light using the provided position data
        light.position.set(data.position.x, data.position.y, data.position.z);
    
        // Set whether the light should cast shadows (default is false if not provided)
        light.castShadow = data.castshadow || false;
    
        // Configure the shadow camera's "far" clipping plane and shadow map size
        light.shadow.camera.far = data.shadowfar || 500.0;  // Default far distance is 500
        light.shadow.mapSize.set(data.shadowmapsize || 512, data.shadowmapsize || 512);  // Default map size is 512x512
    
        // Create a target object for the spotlight to aim at, using the provided target position
        const target = new THREE.Object3D();
        target.position.set(data.target.x, data.target.y, data.target.z);
        light.target = target; // Set the spotlight's target to this object
    
        // Return the created spotlight object
        return light;
    }
    

    createDirectionalLight(data) {
        // Check if the DirectionalLight data contains the required parameters (color, position)
        if (!data.color || !data.position) {
            console.error("DirectionalLight data is missing required parameters.", data);
            return null; // Return null if essential parameters are missing
        }
    
        // Create a color object for the light using the RGB values from the data
        const color = new THREE.Color(
            data.color.r, 
            data.color.g, 
            data.color.b
        );
    
        // Set the default intensity if not provided
        const intensity = data.intensity || 1;  // Default intensity is 1
    
        // Create the DirectionalLight with the provided color and intensity
        const light = new THREE.DirectionalLight(color, intensity);
    
        // Set the position of the light based on the provided position data
        light.position.set(data.position.x, data.position.y, data.position.z);
    
        // Set whether the light should cast shadows (default is false if not provided)
        light.castShadow = data.castshadow || false;
    
        // Configure the shadow camera's clipping planes and map size
        const shadowLeft = data.shadowleft || -5;     // Default left is -5
        const shadowRight = data.shadowright || 5;    // Default right is 5
        const shadowBottom = data.shadowbottom || -5; // Default bottom is -5
        const shadowTop = data.shadowtop || 5;        // Default top is 5
    
        // Set the shadow camera's left, right, bottom, and top boundaries
        light.shadow.camera.left = shadowLeft;
        light.shadow.camera.right = shadowRight;
        light.shadow.camera.bottom = shadowBottom;
        light.shadow.camera.top = shadowTop;
    
        // Set the shadow camera's far clipping plane distance and map size
        light.shadow.camera.far = data.shadowfar || 500.0;  // Default far distance is 500
        light.shadow.mapSize.set(data.shadowmapsize || 512, data.shadowmapsize || 512); // Default map size is 512x512
    
        // Return the created directional light object
        return light;
    }
    
    
    applyTransforms(group, transforms) {
        // Loop through each transform in the transforms array
        transforms.forEach(transform => {
            // Apply the transform based on its type
            switch (transform.type) {
                case 'translate':
                    // Translate (move) the group by the specified amount in the x, y, and z directions
                    group.position.x += transform.amount.x;
                    group.position.y += transform.amount.y;
                    group.position.z += transform.amount.z;
                    break;
                case 'rotate':
                    // Rotate the group by the specified angles in degrees, converting to radians
                    group.rotation.x += THREE.MathUtils.degToRad(transform.amount.x);
                    group.rotation.y += THREE.MathUtils.degToRad(transform.amount.y);
                    group.rotation.z += THREE.MathUtils.degToRad(transform.amount.z);
                    break;
                case 'scale':
                    // Scale the group by the specified factors in the x, y, and z directions
                    group.scale.x *= transform.amount.x;
                    group.scale.y *= transform.amount.y;
                    group.scale.z *= transform.amount.z;
                    break;
                default:
                    // Warn if the transform type is unknown
                    console.warn(`Unknown transform type: ${transform.type}`);
                    break;
            }
        });
    }
    
    
    createMaterial(materialref) {
        // If no material reference is provided, return a default material
        if (!materialref) {
            return new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
        }
    
        // Retrieve the material data using the materialId from the reference
        const materialData = this.materialData[materialref.materialId];
        if (!materialData) {
            // If no material data is found, log an error and return null
            console.error(`Material reference not found.`, materialref);
            return null;
        }
        
        // Set up material options with properties from the material data
        const options = {
            color: new THREE.Color(
                materialData.color?.r,
                materialData.color?.g,
                materialData.color?.b
            ),
            emissive: new THREE.Color(
                materialData.emissive?.r,
                materialData.emissive?.g,
                materialData.emissive?.b
            ),
            specular: new THREE.Color(
                materialData.specular?.r,
                materialData.specular?.g,
                materialData.specular?.b
            ),
            shininess: materialData.shininess,
            transparent: materialData.transparent,
            opacity: materialData.opacity,
            side: materialData.twosided == "true" ? THREE.DoubleSide : THREE.FrontSide,
            wireframe: materialData.wireframe || false
        };
    
        // If a specular reference is provided, add it to the options
        if (materialData.specularref) {
            options.specularref = materialData.specularref;
        }
    
        // If a texture reference is provided, create and apply the texture
        if (materialData.textureref) {
            const texture = this.createTexture(materialData.textureref);
            if (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(materialData.texlength_s || 1, materialData.texlength_t || 1);
                options.map = texture;  // Apply the texture map to the material
            }
        }
    
        // If a bump map reference is provided, create and apply the bump texture
        if (materialData.bumpref) {
            const bumpTexture = this.createTexture(materialData.bumpref);
            if (bumpTexture) {
                options.bumpMap = bumpTexture;  // Apply the bump map to the material
                options.bumpScale = 1;  // Set the bump scale
            }
        }
    
        // Return the created material using the specified options
        return new THREE.MeshPhongMaterial(options);
    }
    

    createTexture(textureref) {
        // Retrieve the texture data based on the texture reference
        const textureData = this.textureData[textureref];
        if (!textureData) {
            // If no texture data is found for the reference, log an error and return null
            console.error(`Texture reference '${textureref}' not found.`);
            return null;
        }
    
        // Check if the texture data is for a video
        if (textureData.isVideo) {
            // Create a hidden video element for video textures
            const video = document.createElement('video');
            video.style.display = 'none';
            video.id = textureref;
            video.autoplay = true;
            video.muted = true;
            video.preload = 'auto';
            video.loop = true;
            video.width = 640;
            video.height = 264;
    
            // Create the video source element and set its attributes
            const source = document.createElement('source');
            source.src = textureData.filepath;  // Set the video file path
            source.type = 'video/mp4';  // Set video format to mp4
    
            // Append the source to the video element and the video to the body
            video.appendChild(source);
            document.body.appendChild(video);
    
            // Create a THREE.VideoTexture from the video and return it
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.colorSpace = THREE.SRGBColorSpace;  // Set color space for the video texture
            return videoTexture;
        }
    
        // Load a regular texture from the file path
        let texture = new THREE.TextureLoader().load(textureData.filepath);
    
        // Handle custom mipmap data if provided
        if ("mipmap0" in textureData) {            
            texture.generateMipmaps = false;  // Disable automatic mipmap generation
    
            let n = 0;
            let mipmap = textureData.mipmap0;
            while (mipmap) {
                // Load the custom mipmap texture
                this.loadMipmap(texture, n, mipmap);
    
                // Check for additional mipmap levels
                if (textureData['mipmap' + (n+1)]) {
                    n++;
                    mipmap = textureData['mipmap' + n];
                } else break;
            }
        } else {
            // Use default mipmap settings
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipMapLinearFilter;  // Set minification filter for mipmaps
            texture.magFilter = THREE.NearestFilter;  // Set magnification filter for the texture
        }
    
        // Return the loaded texture
        return texture;
    }
    

    loadMipmap(parentTexture, level, path)
    {
        // load texture. On loaded call the function to create the mipmap for the specified level 
        new THREE.TextureLoader().load(path, 
            function(mipmapTexture)  // onLoad callback
            {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                ctx.scale(1, 1);
                
                // const fontSize = 48
                const img = mipmapTexture.image         
                canvas.width = img.width;
                canvas.height = img.height

                // first draw the image
                ctx.drawImage(img, 0, 0 )
                             
                // set the mipmap image in the parent texture in the appropriate level
                parentTexture.mipmaps[level] = canvas
            },
            undefined, // onProgress callback currently not supported
            function(err) {
                console.error('Unable to load the image ' + path + ' as mipmap level ' + level + ".", err)
            }
        )
    }

    getNode(nodeName) {
        // Retrieve the node from the 'nodes' collection using the node name as the key
        const node = this.nodes.get(nodeName);
    
        // Check if the node exists in the collection
        if (!node) {
            // If the node does not exist, log a warning to inform the user
            console.warn(`Node '${nodeName}' not found.`);
        }
    
        // Return the node (can be null/undefined if the node was not found)
        return node;
    }
    
}

export { GraphNode };
