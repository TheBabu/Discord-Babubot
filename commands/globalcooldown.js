const { find_cooldown, set_global_cooldown } = require("../database.js");

module.exports = {
	name: "globalcooldown",
	description: "View or adjust global cooldown value",
	usage: ["{ADMIN ONLY: time}"],
	aliases: ["gc"],
	execute(msg, args) {
		//Default Case
		if(!args.length) {
			//Find global cooldown in a guild in the database
			const callback = function(err, res) {
				//If unhandled error, send error message
				if(err) {
					console.error(err);
					
					return msg.reply_bot_msg_err("Something when wrong when retrieving the global cooldown!");
				}
				
				//If could not find global cooldown, send error message
				if(!res)
					return msg.reply_bot_msg_err(`Global cooldown not found!`);
				
				//If global cooldown found, send success message
				return msg.reply_bot_msg_suc(`Global Cooldown: ${res.global_cooldown}`);
			}
			
			return find_cooldown(msg.guild.id, callback);
		}
		
		//Argument Case
		const time = isNaN(args[0]) || args[0] < 0 ? null : args[0];
		
		//If not an admin, send error message
		if(!msg.member.hasPermission("ADMINISTRATOR"))
			return msg.reply_bot_msg_err("You cannot change the global cooldown time because you are not an admin!");
		
		//If invalid time, send error message
		if(!time)
			return msg.reply_bot_msg_err("Invalid time!", this.name, this.usage);
		
		//Set global cooldown to guild in the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err("Something when wrong when updating the global cooldown!");
			}
			
			//If global cooldown not updated, send error message
			if(!res)
				return msg.reply_bot_msg_err(`Global cooldown already set to ${time}!`);
			
			//If global cooldown update, send success message
			return msg.reply_bot_msg_suc(`Updated Global Cooldown: ${time}`);
		};
		
		return set_global_cooldown(msg.guild.id, time, callback);
	}
};

