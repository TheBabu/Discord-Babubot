const Discord    = require("discord.js");
const { prefix } = require("./config.json");

const success_color = "#388a31";
const error_color   = "#ff0000";
const author        = "Babubot";
const bot_prof      = "https://i.ibb.co/TRZ53hJ/babubot1.png";

module.exports = {
	//Send a success bot message
	reply_bot_msg_suc(description, fields) {
		const bot_msg = new Discord.MessageEmbed()
			.setAuthor(author, bot_prof)
			.setTimestamp(); 
		
		const footer_text = `Requested by ${this.author.username}`;
		const footer_url  = this.author.avatarURL();
		
		bot_msg.setColor(success_color);
		bot_msg.setFooter(footer_text, footer_url);
		
		if(description)
			bot_msg.setDescription(description);
		
		if(fields)
			bot_msg.addFields(fields);
		
		return this.channel.send(bot_msg);
	},
	//Send a error bot message
	reply_bot_msg_err(description, command_name, command_usage, fields) {
		const bot_msg = new Discord.MessageEmbed()
			.setAuthor(author, bot_prof)
			.setTimestamp();
		
		const footer_text = `Requested by ${this.author.username}`;
		const footer_url  = this.author.avatarURL();
		
		bot_msg.setColor(error_color);
		bot_msg.setFooter(footer_text, footer_url);
		
		if(description)
			bot_msg.setDescription(description);
		
		if(command_name && command_usage)
			bot_msg.addField("Proper usage", `\`${prefix}${command_name} ${command_usage}\``);
		
		if(fields)
			bot_msg.addFields(fields);
		
		return this.channel.send(bot_msg);
	}
}

