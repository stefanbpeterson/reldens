/**
 *
 * Reldens - UserInterface
 *
 * General UI for the game, basic dialog box.
 *
 */

const { EventsManager } = require('../events-manager');

class UserInterface
{

    constructor(gameManager, id, template = 'assets/html/npc-dialog.html')
    {
        EventsManager.emit('reldens.defineUserInterface', gameManager, id, template, this);
        this.initialTitle = '';
        this.initialContent = '';
        this.id = id;
        this.template = template;
        EventsManager.on('reldens.preloadUiScene', (preloadScene) => {
            preloadScene.load.html(this.id, this.template);
        });
        EventsManager.on('reldens.createUiScene', (preloadScene) => {
            let dialogBox = preloadScene.add.dom(20, 70).createFromCache(this.id);
            let messageTemplate = preloadScene.cache.html.get(this.id);
            dialogBox.innerHTML = preloadScene.gameManager.gameEngine.TemplateEngine.render(messageTemplate, {
                title: this.initialTitle,
                content: this.initialContent
            });
            let dialogContainer = dialogBox.getChildByProperty('className', 'ui-box ui-box-npc-dialog');
            dialogContainer.id = 'box-'+this.id;
            let boxClose = dialogBox.getChildByProperty('className', 'box-close');
            if(boxClose){
                boxClose.addEventListener('click', () => {
                    dialogContainer.style.display = 'none';
                });
            }
            preloadScene.userInterfaces[this.id] = dialogBox;
        });
        EventsManager.emit('reldens.createdUserInterface', gameManager, id, template, this);
    }

}

module.exports.UserInterface = UserInterface;
