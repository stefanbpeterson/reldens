/**
 *
 * Reldens - RoomGame
 *
 * This room is the game lobby and for now it will just start the game using the loginManager.
 * The client will automatically disconnect from this room once it received the data.
 * If the client was hacked then the user will be disconnected when it joins the next RoomScene.
 * See RoomScene.onJoin method.
 *
 */

const { RoomLogin } = require('./login');
const { EventsManager } = require('../../game/events-manager');
const { GameConst } = require('../../game/constants');

class RoomGame extends RoomLogin
{

    async onJoin(client, options, authResult)
    {
        EventsManager.emit('reldens.onJoinRoomGame', client, options, authResult, this);
        // update last login:
        await this.loginManager.updateLastLogin(authResult);
        // we need to send the engine and all the general and client configurations from the storage:
        let storedClientConfig = {client: this.config.client};
        let clientFullConfig = Object.assign({}, this.config.gameEngine, storedClientConfig);
        // client start:
        this.send(client, {
            act: GameConst.START_GAME,
            sessionId: client.sessionId,
            player: authResult.players[0], // @TODO: [0] is temporal since for now we only have one player by user.
            gameConfig: clientFullConfig,
            features: this.config.availableFeaturesList
        });
    }

}

module.exports.RoomGame = RoomGame;
