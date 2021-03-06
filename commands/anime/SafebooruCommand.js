const commando = require('discord.js-commando');
const safebooru = require('../../metodosInternos/safebooruImage2Channel');

class SafebooruCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'safebooru',
            group: 'anime',
            memberName: 'safebooru',
            aliases: ['sb'],
            description: 'Buscaré una imagen en por ti.',
            examples: [
                "~safebooru touhou",
                "~safebooru touhou alice_margatroid",
                "~safebooru banned_tags"
            ],
            args: [
                {
                    key: 'tags',
                    prompt: 'Coloque los tags que desea buscar.',
                    type: 'string',
                    default: ""
                }
            ]
        });
    }

    async run(message, args) {
        if (args) {
            if (args.tags.toLowerCase() === "banned_tags"){
                try {
                    const data = fs.readFileSync('./dataFiles/BannedTagsData/banned_tags.txt', 'utf8');
                    let BANNED_TAGS = data.split("\n");
                    message.channel.send("Estos son los tags que me han prohibido buscar" +
                        "```" +
                        BANNED_TAGS.join("\n") +
                        "```")
                } catch (err) {
                    console.error(err);
                }
            }
            let tags = args.tags.replace(" ", "+");
            safebooru.safebooruImageToChannel(message, tags);
        } else {
            message.channel.send("El texto de entrada tiene muy pocos parametros.");
        }
    }
}

module.exports = SafebooruCommand;
