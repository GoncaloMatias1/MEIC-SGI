import * as THREE from 'three';
import { MyFileReader } from './parser/MyFileReader.js';
import { GlobalsNode } from './objects/GlobalsNode.js';
import { MyTrack } from './objects/MyTrack.js';
import { MyBalloon } from './objects/MyBalloon.js';
import { MyPowerUp } from './objects/MyPowerUp.js';
import { MyReader } from './MyReader.js';
import { MyRoute } from './objects/MyRoute.js';
import { MyObstacle } from './objects/MyObstacle.js';
import { MyMeta } from './objects/MyMeta.js';
import { MyOutdoorDisplay } from './objects/MyOutdoorDisplay.js';
import { MyParkingArea } from './objects/MyParkingArea.js';
import { MySpriteText } from './components/MySpriteText.js';
import { MyMenu } from './MyMenu.js';
import { MyBallonMenu } from './MyBalloonMenu.js';
import { MyHUD } from './MyHUD.js';
import { MyOpponentMenu } from './MyOpponentMenu.js';
import { MyWindDisplay } from './MyWindDisplay.js';
import { MyFinalMenu } from './MyFinalMenu.js';
import { MyFireworks } from './MyFireworks.js';

/**
 * This class manages all the game content
 */
class MyContents {
    /**
     * @param {MyApp} app The main application object
     */
    constructor(app) {
        this.app = app;
        
        // Create a clock for timing
        this.clock = new THREE.Clock();

        // Game state
        this.gameState = 'menu';
        this.elapsedTime = 0;
        this.lapCount = 0;

        this.spriteText = new MySpriteText(this.app);

        this.menu = null;
        this.ballonMenu = null;

        // Track
        this.track = null;

        this.hud = null;

        this.windDisplay = null;

        // Balloons
        this.playerBalloon = null;
        this.opponentBalloon = null;
        this.balloons = [];
        this.selectedBalloonModel = null;
        this.selectedOpponentModel = null;

        this.startingPoint = null;

        this.fireworks = null;

        this.penaltyDuration = 5; // N seconds configurable
        this.penaltyTimer = 0;   // Track penalty time

        // Game objects
        this.powerUps = [];
        this.obstacles = [];
        
        // Wind layers configuration
        this.windLayers = {
            layer4: { 
                height: 13, 
                direction: new THREE.Vector3(0, 0, 1),  // North
                speed: 0.8 
            },
            layer3: { 
                height: 12, 
                direction: new THREE.Vector3(0, 0, -1),   // South
                speed: 0.8 
            },
            layer2: { 
                height: 11, 
                direction: new THREE.Vector3(1, 0, 0),   // West
                speed: 0.8 
            },
            layer1: { 
                height: 10, 
                direction: new THREE.Vector3(-1, 0, 0),  // East
                speed: 0.8 
            },
            layer0: { 
                height: 0, 
                direction: new THREE.Vector3(0, 0, 0),   // No wind
                speed: 0 
            }
        };
    }

    determineWinner() {
        if (this.playerBalloon && this.opponentBalloon) {
            if (this.playerBalloon.userData.laps > this.opponentBalloon.userData.laps) {
                return "PLAYER";
            } else if (this.playerBalloon.userData.laps < this.opponentBalloon.userData.laps) {
                return "OPPONENT";
            } else {
                return "TIE";
            }
        }
        return "UNKNOWN";
    }

    showFinalMenu() {
        if (this.finalMenu) {
            this.finalMenu = null;
        }
    
        // Hide HUD and wind display
        if (this.hud) {
            this.hud = null;
        }
        if (this.windDisplay) {
            this.windDisplay = null;
        }
    
        // Create fireworks
        if (!this.fireworks) {
            this.fireworks = new MyFireworks(this.app);
        }
    
        const results = {
            winner: this.determineWinner(),
            time: this.elapsedTime,
            playerBalloon: this.selectedBalloonModel,
            opponentBalloon: this.selectedOpponentModel
        };
    
        this.finalMenu = new MyFinalMenu(
            this.app,
            results,
            () => this.restartGame(),
            () => this.returnToMainMenu()
        );
    }

    restartGame() {
        // Remove final menu
        if (this.finalMenu) {
            this.app.scene.remove(this.finalMenu);
            this.finalMenu = null;
        }

        // Clean up fireworks
        if (this.fireworks) {
            this.fireworks.clear();
            this.fireworks = null;
        }

        // Reset game state
        this.elapsedTime = 0;
        this.lapCount = 0;
        
        // Reset balloon positions
        const playerStartPos = this.getStartingPosition(this.startingPoint);
        const opponentStartPos = this.getStartingPosition(this.startingPoint === "A" ? "B" : "A");
        
        if (this.playerBalloon) {
            this.playerBalloon.position.set(playerStartPos.x, playerStartPos.y, playerStartPos.z);
            this.playerBalloon.userData.laps = 0;
            this.playerBalloon.userData.hasCrossedPlane = true;
        }
        
        if (this.opponentBalloon) {
            this.opponentBalloon.position.set(opponentStartPos.x, opponentStartPos.y, opponentStartPos.z);
            this.opponentBalloon.userData.laps = 0;
            this.opponentBalloon.userData.hasCrossedPlane = true;
        }

        // Activate HUD
        this.hud = new MyHUD(this.app);

        // Restart game
        this.gameState = 'playing';
        this.clock.start();
    }

    returnToMainMenu() {
        // Remove final menu and clean up game objects
        if (this.finalMenu) {
            this.app.scene.remove(this.finalMenu);
            this.finalMenu = null;
        }

        if (this.fireworks) {
            this.fireworks.clear();
            this.fireworks = null;
        }

        // Remove player balloon
        if (this.playerBalloon) {
            this.app.scene.remove(this.playerBalloon);
            this.playerBalloon = null;
        }

        // Remove opponent balloon
        if (this.opponentBalloon) {
            this.app.scene.remove(this.opponentBalloon);
            this.opponentBalloon = null;
        }

        // Clear balloons array
        if (this.balloons && this.balloons.length > 0) {
            this.balloons.forEach((balloon) => {
                this.app.scene.remove(balloon);
            });
            this.balloons = [];
        }

        // Reset game state
        this.elapsedTime = 0;
        this.lapCount = 0;
        this.gameState = 'menu';

        this.app.stopFollowing()

        // Show main menu
        this.createMenu();
    }

    /**
     * Initialize game components
     */
    init() {
        // Create file reader and load game scene
        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.reader.open("scene/scene.json");

        // Wait for app to be fully loaded 
        requestAnimationFrame(() => {
            // Create Menu
            this.createMenu();
        });
    }

    createMenu() {
        this.menu = new MyMenu(this.app, (menuData) => {
            // Handle start game
            this.playerName = menuData.playerName;
            this.startingPoint = menuData.startingPoint;         
            // Remove menu
            this.app.scene.remove(this.menu);
            // Move to Ballon Selection Menu
            this.createBallonSelectionMenu();
        });
        // Remove user control from camera
        this.app.controls.enabled = false;
        // Adjust camera positioning
        this.app.activeCamera.position.set(-20, 18, -70);
        // Adjust camera target
        this.app.controls.target.set(-20, 18, -50);
        // Move the menu
        this.menu.position.z = -50;
        // Add menu to scene
        this.app.scene.add(this.menu);
    }

    createBallonSelectionMenu() {

        if (this.ballonMenu) {
            this.app.scene.remove(this.ballonMenu);
            this.ballonMenu = null;
        }

        this.ballonMenu = new MyBallonMenu(this.app, (menuData) => {
            // Handle selection 
            this.selectedBalloonModel = menuData.playerBalloon;
            // Remove menu
            this.app.scene.remove(this.ballonMenu);
            this.ballonMenu = null;
            // Move to Opponnent Selection Menu
            this.createOpponentBalloonMenu()
        })
        // Adjust camera positioning
        this.app.activeCamera.position.set(-70, 18, -170);
        // Adjust camera target
        this.app.controls.target.set(-200, 18, -300);
        // Add menu to scene
        this.app.scene.add(this.ballonMenu)
    }

    createOpponentBalloonMenu() {

        if (this.opponentMenu) {
            this.app.scene.remove(this.opponentMenu);
            this.opponentMenu = null;
        }

        this.opponentMenu = new MyOpponentMenu(this.app, (menuData) => {
            // Handle selection
            this.selectedOpponentModel = menuData.opponentBalloon
            // Remove menu
            this.app.scene.remove(this.opponentMenu);
            this.opponentMenu = null;
            // Start Race
            this.startGame();
        })
        // Adjust camera positioning
        this.app.activeCamera.position.set(70, 18, -170);
        // Adjust camera target
        this.app.controls.target.set(200, 18, -300);
        // Add menu to scene
        this.app.scene.add(this.opponentMenu);
    }

    getStartingPosition(startingPoint) {
        if (startingPoint == "A") return { x: 0, y: 10, z: -10 }
        else return { x: 0, y: 10, z: 10 }
    }

    startGame() {
        // Ensure previous balloons are removed
        if (this.playerBalloon) {
            this.app.scene.remove(this.playerBalloon);
            this.playerBalloon = null;
        }

        if (this.opponentBalloon) {
            this.app.scene.remove(this.opponentBalloon);
            this.opponentBalloon = null;
        }

        if (this.balloons && this.balloons.length > 0) {
            this.balloons.forEach((balloon) => {
                this.app.scene.remove(balloon);
            });
            this.balloons = [];
        }

        // Create Ballons
        const playerPosition = this.getStartingPosition(this.startingPoint);
        const opponentPosition = this.getStartingPosition(this.startingPoint === "A" ? "B" : "A");
        
        const balloonConfig = {
            player: {
                model: this.selectedBalloonModel,
                position: playerPosition,
                isAutonomous: false
            },
            opponent: {
                model: this.selectedOpponentModel,
                position: opponentPosition,
                isAutonomous: true,
                route: {
                    points: this.route ? this.route.get_points() : []
                }
            }
        };

        this.windDisplay = new MyWindDisplay(this.app);
    
        const reader = new MyReader(this.app);  
        const { playerBalloon, opponentBalloon } = reader.createBalloons(balloonConfig);
        this.playerBalloon = playerBalloon;
        this.opponentBalloon = opponentBalloon;
    
        this.playerBalloon.rotation.y = -Math.PI / 2;
        this.opponentBalloon.rotation.y = -Math.PI / 2;
    
        this.playerBalloon.changeColor(this.getColor(this.selectedBalloonModel));
        this.opponentBalloon.changeColor(this.getColor(this.selectedOpponentModel));
        this.balloons.push(this.playerBalloon);
        this.balloons.push(this.opponentBalloon);
        this.app.scene.add(this.playerBalloon);
        this.app.scene.add(this.opponentBalloon);

        this.balloons.forEach((balloon) => {
            balloon.userData.hasCrossedPlane = true;
            balloon.userData.laps = 0;
        })

        window.addEventListener('keydown', (event) => {
            if (event.key === 'c') {
                this.app.toggleCameraMode();
            }
        });

        this.app.setFollowTarget(this.playerBalloon);

        // Activate HUD
        this.hud = new MyHUD(this.app);

        // Activate user controls
        this.initControls();

        this.gameState = 'playing';
        this.elapsedTime = 0;
        this.lapCount = 0;

        // Reset balloon positions using the configured positions
        if (this.playerBalloon) {
            this.playerBalloon.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
            this.playerBalloon.velocity.set(0, 0, 0);
        }
        
        if (this.opponentBalloon) {
            this.opponentBalloon.position.set(opponentPosition.x, opponentPosition.y, opponentPosition.z);
        }

        // Reset and start clock
        this.clock.start();
    }

    initPlane() {
        const planeGeometry = new THREE.BoxGeometry(0.5, 40, 50); // Simple plane shape
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        // Start position for the plane
        this.plane.position.set(0, 15, 0);
        this.plane.visible = false; 

        this.app.scene.add(this.plane);
    }

    checkLap() {
        if (!this.plane || this.balloons.length === 0) return;
    
        this.balloons.forEach((balloon) => {            
            // Check if the balloon has crossed the plane's z-position
            if (balloon.position.x < this.plane.position.x && !balloon.userData.hasCrossedPlane) {
                this.lapCount++;
                balloon.userData.laps++;
                balloon.userData.hasCrossedPlane = true; // Mark as crossed
            }
    
            let checkpoint = 90
            // Reset flag when balloon goes far enough back (prevents double counting)
            if (balloon.position.x < checkpoint + 10 && balloon.position.x > checkpoint && balloon.userData.hasCrossedPlane) {
                balloon.userData.hasCrossedPlane = false;
            }
        });
    }
    
    /**
     * Set up keyboard controls
     */
    initControls() {
        // Key press handler
        document.addEventListener('keydown', (event) => {
            if (this.gameState == 'playing' || this.gameState == 'paused') 
                switch(event.code) {
                    case 'KeyW':
                        if (this.playerBalloon && this.gameState == 'playing') this.playerBalloon.increaseAltitude();
                        break;
                    case 'KeyS':
                        if (this.playerBalloon && this.gameState == 'playing') this.playerBalloon.decreaseAltitude();
                        break;
                    case 'Space':
                        this.togglePause();
                        break;
                }
        });

        // Key release handler
        document.addEventListener('keyup', (event) => {
            if (this.gameState == 'playing' && this.playerBalloon) {
                if (event.code === 'KeyW' || event.code === 'KeyS') {
                    this.playerBalloon.stopVerticalMovement();
                }
            }
        });
    }

    /**
     * Handle scene data loading
     * @param {Object} data Scene data from JSON
     */
    onSceneLoaded(data) {
        console.info("Game scene loaded.");
        if ('yasf' in data) {
            data = data['yasf'];
        } else {
            console.error('Error parsing the game scene file');
            return;
        }

        this.setupScene(data);
    }

    /**
     * Set up the game scene with loaded data
     * @param {Object} data Parsed scene data
     */
    setupScene(data) {
        // Set up globals (lighting, etc)
        if (data.globals) {
            this.globalsNode = new GlobalsNode(this.app, data.globals);
        }
    
        // Create track
        if (data.track) {
            this.track = new MyTrack(this.app);
            this.track.create(data);
        }

        // Create obstacles
        if (data.obstacles) {
            this.obstacles = new MyObstacle(this.app);
            this.obstacles.create(data.obstacles);
        }

        // Create route
        if (data.route) {
            this.route = new MyRoute(this.app, data.route);            
        }
    
        const reader = new MyReader(this.app);  
    
        // Create power-ups
        if (data.powerUps) {
            this.powerUps = reader.createPowerUps(data.powerUps);
            this.powerUps.forEach(powerUp => this.app.scene.add(powerUp));
        }
    
        // Create meta
        const metaPosition = new THREE.Vector3(0, 0, 0);
        this.meta = new MyMeta(this.app, metaPosition);
        this.app.scene.add(this.meta);

        // Create display
        if (data.display) {
            this.outdoorDisplay = new MyOutdoorDisplay(this.app, data.display);
            this.app.scene.add(this.outdoorDisplay);
        }

        // Create parking areas
        if (data.parkingAreas) {
            // Competitor parking
            const competitorParking = new MyParkingArea(this.app, {
                position: new THREE.Vector3(
                    data.parkingAreas.competitor.position.x,
                    0,
                    data.parkingAreas.competitor.position.z
                ),
                rotation: data.parkingAreas.competitor.rotation,
                size: data.parkingAreas.competitor.size,
                type: 'competitor'
            });
            this.app.scene.add(competitorParking);

            // Opponent parking
            const opponentParking = new MyParkingArea(this.app, {
                position: new THREE.Vector3(
                    data.parkingAreas.opponent.position.x,
                    0,
                    data.parkingAreas.opponent.position.z
                ),
                rotation: data.parkingAreas.opponent.rotation,
                size: data.parkingAreas.opponent.size,
                type: 'opponent'
            });
            this.app.scene.add(opponentParking);
        }

        // Initialize plane for lap counting
        this.initPlane();
    }

    /**
     * Get current wind based on balloon height
     * @param {number} height Balloon's current height
     * @returns {Object} Wind layer data
     */
    getWindAtHeight(height) {
        // Check layers from highest to lowest
        if (height >= this.windLayers.layer4.height) return this.windLayers.layer4;
        if (height >= this.windLayers.layer3.height) return this.windLayers.layer3;
        if (height >= this.windLayers.layer2.height) return this.windLayers.layer2;
        if (height >= this.windLayers.layer1.height) return this.windLayers.layer1;
        return this.windLayers.layer0;
    }

    /**
     * Get current air layer based on balloon height
     * @returns {string} Layer identifier
     */
    getCurrentLayer() {
        if (!this.playerBalloon) return 'layer0';
        
        const height = this.playerBalloon.position.y;
        if (height >= this.windLayers.layer4.height) return 'layer4';
        if (height >= this.windLayers.layer3.height) return 'layer3';
        if (height >= this.windLayers.layer2.height) return 'layer2';
        if (height >= this.windLayers.layer1.height) return 'layer1';
        return 'layer0';
    }

    /**
     * Toggle game pause state
     */
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.clock.stop();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.clock.start();
        }
    }

    /**
     * Check for collisions between balloons and game objects
     */
    checkCollisions() {
        if (!this.playerBalloon || this.gameState !== 'playing') return;
        
        // Initialize penalty cooldown if not already set
        if (this.penaltyTimer === undefined) {
            this.penaltyTimer = 0;
        }
        
        if (this.penaltyTimer > 0) {
            return;
        }
        
        // Check power-ups
        this.powerUps.forEach((powerUp, index) => {
            if (!powerUp.collected && this.playerBalloon.collidesWith(powerUp)) {
                if (!this.powerUpCooldown) {
                    this.playerBalloon.addVoucher();
                    this.powerUpCooldown = 3;
                }
            }
        });
    
        // Check obstacles
        if (this.obstacles && this.obstacles.checkCollision) {
            if (this.obstacles.checkCollision(this.playerBalloon.position, 4 * this.playerBalloon.modelConfig.scale)) {
                if (!this.playerBalloon.useVoucher()) {
                    this.elapsedTime += 5; // 5-second penalty
                    this.penaltyTimer = 3; // Start cooldown timer
                }
            }
        }
    
        // Check opponent collision
        if (this.opponentBalloon && this.playerBalloon.collidesWith(this.opponentBalloon)) {
            if (!this.playerBalloon.useVoucher()) {
                this.elapsedTime += 5; // 5-second penalty
                this.penaltyTimer = 3; // Start cooldown timer
            }
        }
    
        // Check track boundaries
        if (this.track && this.playerBalloon.shadow) {
            if (!this.track.isOnTrack(this.playerBalloon.shadow.position)) {
                if (!this.playerBalloon.useVoucher()) {
                    const centerPoint = this.track.getNearestCenterPoint(this.playerBalloon.shadow.position);
                    if (centerPoint) {
                        this.playerBalloon.position.x = centerPoint.x;
                        this.playerBalloon.position.z = centerPoint.z;
                    }
                    this.elapsedTime += 5; // 5-second penalty
                    this.penaltyTimer = 3; // Start cooldown timer
                }
            }
        }
    }
    
    
    /**
     * Update game state each frame
     */
    update() {
        // Only update time during active gameplay
        if (this.gameState === 'playing') {
            const deltaTime = this.clock.getDelta();
            this.elapsedTime += deltaTime;

            if (this.penaltyTimer > 0) {
                this.penaltyTimer -= deltaTime;
                if (this.penaltyTimer < 0) this.penaltyTimer = 0;
            }

            if (this.powerUpCooldown > 0) {
                this.powerUpCooldown -= deltaTime;
                if (this.powerUpCooldown < 0) this.powerUpCooldown = 0;
            }
        }

        if (this.obstacles && this.obstacles instanceof MyObstacle) {
            this.obstacles.update();
        }
    
        // Update power-ups
        if (this.powerUps) {
            this.powerUps.forEach(powerUp => powerUp.update());
        }
    
        if (this.gameState === 'playing') {
            // Check for game end condition based on individual balloon laps
            if (this.playerBalloon?.userData.laps >= 1 || this.opponentBalloon?.userData.laps >= 1) {
                this.gameState = 'finished';
                this.showFinalMenu();
            }
    
            // Update player balloon
            if (this.playerBalloon) {
                const wind = this.getWindAtHeight(this.playerBalloon.position.y);
                this.playerBalloon.update(wind, this.clock);
            }
    
            // Update opponent balloon
            if (this.opponentBalloon) {
                this.opponentBalloon.update(null, this.clock);
            }
    
            // Check for collisions
            this.checkCollisions();
    
            this.checkLap();
        }
    
        if (this.gameState === 'finished') {
            const deltaTime = this.clock.getDelta();
            if (this.finalMenu) {
                this.finalMenu.update();
            }
            if (this.fireworks) {
                this.fireworks.update(deltaTime);
            }
        }

        if (this.finalMenu) {
            this.finalMenu.render();
        }
    
        // Always update displays regardless of game state
        if (this.outdoorDisplay) {
            this.outdoorDisplay.update({
                elapsedTime: this.elapsedTime,
                lapCount: this.lapCount,
                currentLayer: this.getCurrentLayer(),
                vouchers: this.playerBalloon ? this.playerBalloon.vouchers : 0,
                status: this.gameState === 'playing' ? 'RUNNING' : 
                       this.gameState === 'paused' ? 'PAUSED' :
                       this.gameState === 'finished' ? 'FINISHED' : 'WAITING'
            });
        }
    
        // Always update HUD regardless of game state
        if (this.hud) {
            this.hud.update({
                elapsedTime: this.elapsedTime,
                lapCount: this.lapCount,
                currentLayer: this.getCurrentLayer(),
                vouchers: this.playerBalloon ? this.playerBalloon.vouchers : 0,
                status: this.gameState === 'playing' ? 'RUNNING' : 
                       this.gameState === 'paused' ? 'PAUSED' :
                       this.gameState === 'finished' ? 'FINISHED' : 'WAITING'
            });
        }
    
        // Update wind visualization
        if (this.windDisplay && this.playerBalloon) {
            const wind = this.getWindAtHeight(this.playerBalloon.position.y);
            this.windDisplay.update(this.playerBalloon, wind);
        }
    }

    /**
     * Create player balloon
     * @param {string} model Balloon model identifier
     * @param {THREE.Vector3} startPosition Starting position
     */
    createPlayerBalloon(model, startPosition) {
        this.playerBalloon = new MyBalloon(this.app, {
            model: model,
            isAutonomous: false,
            startPosition: startPosition
        });
        this.app.scene.add(this.playerBalloon);
    }

    /**
     * Create opponent balloon
     * @param {string} model Balloon model identifier
     * @param {Object} route Route data
     * @param {THREE.Vector3} startPosition Starting position
     */
    createOpponentBalloon(model, route, startPosition) {
        this.opponentBalloon = new MyBalloon(this.app, {
            model: model,
            isAutonomous: true,
            startPosition: startPosition,
            route: route
        });
        this.app.scene.add(this.opponentBalloon);
    }

    /**
     * Select balloon model for player
     * @param {string} model Balloon model identifier
     */
    selectBalloon(model) {
        this.selectedBalloonModel = model;
    }

    /**
     * Select balloon model for opponent
     * @param {string} model Balloon model identifier
     */
    selectOpponent(model) {
        this.selectedOpponentModel = model;
    }

    getColor(colorName) {
        const colors = {
            'RED': 0xff0000,
            'BLUE': 0x0000ff,
            'YELLOW': 0xffff00,
            'GREEN': 0x00ff00,
            'CYAN': 0x00ffff,
            'MAGENTA': 0xff00ff,
            'WHITE': 0xffffff
        };
        return colors[colorName];
    }

}

export { MyContents };