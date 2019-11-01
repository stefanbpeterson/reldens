/**
 *
 * Reldens - AnimationObject
 *
 * This is a base object class, AnimationsObject class will only send the run animation action to the client.
 *
 */

const BaseObject = require('./base-object');
const share = require('../utils/constants');

class AnimationObject extends BaseObject
{

    constructor(props)
    {
        super(props);
        // this is a hardcoded property for this specific object type:
        this.isAnimation = true;
        // the actions will be false as default:
        this.runOnHit = false;
        this.runOnAction = false;
    }

    getAnimationData()
    {
        return {
            act: share.OBJECT_ANIMATION,
            key: this.key,
            publicParams: this.publicParamsObj,
            x: this.x,
            y: this.y
        };
    }

    onHit(props)
    {
        if(this.runOnHit && props.room){
            let client = props.room.getClientById(props.playerBody.playerId);
            if(!client){
                console.log('ERROR - Object hit, client not found by playerId:', props.playerBody.playerId);
            } else {
                props.room.send(client, this.getAnimationData());
            }
        }
    }

    onAction(props)
    {
        if(this.runOnAction && props.room) {
            let client = props.room.getClientById(props.playerBody.playerId);
            if(!client){
                console.log('ERROR - Object action, client not found by playerId:', props.playerBody.playerId);
            } else {
                props.room.send(client, this.getAnimationData());
            }
        }
    }

}

module.exports = AnimationObject;
