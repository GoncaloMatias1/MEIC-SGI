import * as THREE from 'three';
import { MyBalloon } from './objects/MyBalloon.js';
import { MyPowerUp } from './objects/MyPowerUp.js';

class MyReader {
    constructor(app) {
        this.app = app;
    }

    /**
     * Reads powerup positions from data and creates powerup objects
     * @param {Array} powerUpData Array of powerup positions
     * @returns {Array} Array of MyPowerUp objects
     */
    createPowerUps(powerUpData) {
        const powerUps = [];
        
        powerUpData.forEach(data => {
            const position = new THREE.Vector3(data.x, data.y || 20, data.z);  // Default height of 20 if not specified
            const powerUp = new MyPowerUp(this.app, {
                position: position,
                type: "voucher",
                value: 1
            });
            powerUps.push(powerUp);
        });
    
        return powerUps;
    }

    /**
     * Creates balloons based on configuration
     * @param {Object} balloonData Balloon configuration data
     * @returns {Object} Object containing player and opponent balloons
     */
    createBalloons(balloonData) {
        const playerBalloon = new MyBalloon(this.app, {
            model: balloonData.player.model,
            isAutonomous: false,
            startPosition: new THREE.Vector3(
                balloonData.player.position.x,
                balloonData.player.position.y,
                balloonData.player.position.z
            )
        });

        const opponentBalloon = new MyBalloon(this.app, {
            model: balloonData.opponent.model,
            isAutonomous: true,
            startPosition: new THREE.Vector3(
                balloonData.opponent.position.x,
                balloonData.opponent.position.y,
                balloonData.opponent.position.z
            ),
            route: balloonData.opponent.route
        });

        return { playerBalloon, opponentBalloon };
    }

    /**
     * Load game configuration from JSON
     * @param {String} filepath Path to JSON file
     */
    async loadConfiguration(filepath) {
        try {
            const response = await fetch(filepath);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error loading game configuration:", error);
            return null;
        }
    }
}

export { MyReader };