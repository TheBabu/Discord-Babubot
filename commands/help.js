const { prefix } = require("../config.json");

module.exports = {
	name: "help",
	description: "Shows help screen",
	usage: "[command]",
	aliases: ["h", "commands"],
	execute(msg, args) {
		//Avaliable commands bot has
		const { commands } = msg.client;
		
		//Default Case
		if(!args.length) {
			const commands_info = commands.map(function(command) {
				if(command.admin_only)
					return { name: `${command.name} (Admin only)`, value: command.description };
				
				return { name: `${command.name}`, value: command.description };
			});
			
			return msg.reply_bot_msg_suc(`I am a bot that autoreacts to messages! Here's a list all of my commands! Do \`${prefix}help <command>\` to learn about its usage and aliases`, commands_info)
		}
		
		//Argument Case
		const name    = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
		const title   = command.admin_only ? `**${command.name} (Admin only)**` : `**${command.name}**`;
		
		//If not a valid command, print error message
		if(!command)
			return msg.reply_bot_msg_err("command not found!")
		
		//Generate fields for all avaliable command descriptors
		const command_info = [];
		if(command.description)
			command_info.push({ name: "Description", value: command.description});
		if(command.usage)
			command_info.push({ name: "Usage", value: `\`${command.usage}\``, inline: true});
		if(command.aliases)
			command_info.push({ name: "Aliases", value: command.aliases.map(alias => alias).join(", "), inline: true});
		
		return msg.reply_bot_msg_suc(title, command_info);
	}
};

