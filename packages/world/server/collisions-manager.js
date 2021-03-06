/**
 *
 * Reldens - CollisionsManager
 *
 * This module handle the collisions and the related actions.
 *
 */

const { ErrorManager } = require('../../game/error-manager');
const { Logger } = require('../../game/logger');

class CollisionsManager
{

    constructor(room = false)
    {
        if(room){
            this.activateCollisions(room);
        }
    }

    activateCollisions(room)
    {
        this.room = room;
        if(!{}.hasOwnProperty.call(this.room, 'roomWorld')){
            ErrorManager.error('Room world not found.');
        }
        // @TODO: make dynamic, for now we will use fixed collisions types for each event.
        this.room.roomWorld.on('beginContact', this.assignBeginCollisions.bind(this));
        this.room.roomWorld.on('endContact', this.assignEndCollisions.bind(this));
        // @NOTE: postBroadphase will be used to check pairs and test overlap instead of collision, for example, a spell
        // will overlap the player but not collide with it, if the spell collides with the player it will push it in
        // the opposite direction because the physics engine.
        // this.room.roomWorld.on('postBroadphase', this.assignPostBroadPhase.bind(this));
    }

    /*
    assignPostBroadPhase(evt)
    {
        let { pairs } = evt;
        if(pairs.length > 1){
            for(let body of pairs){
                // Logger.log('pairs!', body.playerId);
            }
        }
    }
    */

    assignBeginCollisions(evt)
    {
        let bodyA = evt.bodyA,
            bodyB = evt.bodyB,
            currentPlayerBody = false,
            otherBody = false;
        // cases:
        // - player hit a player
        // - player hit an object (any type, animations, NPC, etc.)
        // - player hit an enemy
        if(bodyA.playerId && bodyB.playerId){
            this.playerHitPlayer(bodyA, bodyB);
        } else {
            currentPlayerBody = bodyA.playerId ? bodyA : bodyB;
            otherBody = bodyA.playerId ? bodyB : bodyA;
            if(otherBody.isRoomObject){
                this.playerHitObject(currentPlayerBody, otherBody);
            }
            if(otherBody.changeScenePoint){
                this.playerHitChangePoint(currentPlayerBody, otherBody);
            }
        }
    }

    assignEndCollisions(evt)
    {
        let bodyA = evt.bodyA,
            bodyB = evt.bodyB,
            playerBody = false,
            otherBody = false;
        // cases:
        // - player hit a wall
        if(!bodyA.playerId || !bodyB.playerId){
            playerBody = bodyA.playerId ? bodyA : bodyB;
            otherBody = bodyA.playerId ? bodyB : bodyA;
            if(otherBody.isWall){
                this.playerHitWall(playerBody, otherBody);
            }
        }
        // - player stops pushing a player:
        if(bodyA.playerId && bodyB.playerId){
            bodyA.velocity = [0, 0];
            bodyB.velocity = [0, 0];
        }
    }

    // eslint-disable-next-line no-unused-vars
    playerHitPlayer(bodyA, bodyB)
    {
        // @NOTE: we could run specific events when a player collides with another player.
        // Logger.info(['Hit player!', bodyA.playerId, bodyB.playerId]);
    }

    playerHitObject(playerBody, otherBody)
    {
        // now the collisions manager only run the object hit action:
        if(otherBody.roomObject){
            otherBody.roomObject.onHit({playerBody: playerBody, objectBody: otherBody, room: this.room});
        }
    }

    // eslint-disable-next-line no-unused-vars
    playerHitWall(playerBody, wall)
    {
        // @NOTE: we can use wall.material to trigger an action over the player, like:
        // wall.material = lava > reduce player.hp in every step
        playerBody.velocity = [0, 0];
    }

    playerHitChangePoint(playerBody, changePoint)
    {
        let playerSchema = this.room.getPlayerFromState(playerBody.playerId);
        if({}.hasOwnProperty.call(playerBody, 'isChangingScene') && playerBody.isChangingScene){
            // @NOTE: if the player is already changing scene do nothing.
            Logger.error('Player is busy for a change point: ' + playerBody.playerId);
            return false;
        } else {
            let playerPosition = {x: playerBody.position[0], y: playerBody.position[1]};
            this.room.state.positionPlayer(playerBody.playerId, playerPosition);
        }
        // scene change data:
        let changeScene = changePoint.changeScenePoint;
        let previousScene = playerSchema.state.scene;
        let changeData = {prev: previousScene, next: changeScene};
        // check if the player is not changing scenes already:
        if(playerBody.isChangingScene === false){
            playerBody.isChangingScene = true;
            let contactClient = this.room.getClientById(playerBody.playerId);
            // @NOTE: we do not need to change back the isChangingScene property back to false since in the new
            // scene a new body will be created with the value set to false by default.
            this.room.nextSceneInitialPosition(contactClient, changeData).catch((err) => {
                Logger.error('nextSceneInitialPosition error: ' + err);
            });
        }
    }

}

module.exports.CollisionsManager = CollisionsManager;
