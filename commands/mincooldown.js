const { find_cooldown, set_min_cooldown } = require("../database.js");

module.exports = {
	name: "mincooldown",
	description: "View or adjust minimum cooldown value",
	usage: ["{ADMIN ONLY: time}"],
	aliases: ["mc"],
	execute(msg, args) {
		//Default Case
		if(!args.length) {
			//Find min cooldown of guild in the database
			const callback = function(err, res) {
				//If unhandled error, send error message
				if(err) {
					console.error(err);
					
					return msg.reply_bot_msg_err("Something when wrong when retrieving the minimum cooldown!");
				}
				
				//If could not find min cooldown, send error message
				if(!res)
					return msg.reply_bot_msg_err(`Minimum cooldown not found!`);
				
				//If min cooldown found, send success message
				return msg.reply_bot_msg_suc(`Minimum Cooldown: ${res.min_cooldown}`);
			}
			
			return find_cooldown(msg.guild.id, callback);
		}
		
		//Argument case
		const time = isNaN(args[0]) || args[0] < 0 ? null : args[0];
		
		//If not admin, send error message
		if(!msg.member.hasPermission("ADMINISTRATOR"))
			return msg.reply_bot_msg_err("You cannot change the minimum cooldown time because you are not an admin!");
		
		//Check time is valid
		if(!time)
			return msg.reply_bot_msg_err("Invalid time!", this.name, this.usage);
		
		//Set min cooldown of guild in the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err("Something when wrong when updating the minimum cooldown!");
			}
			
			//If min cooldown not updated, send error message
			if(!res)
				return msg.reply_bot_msg_err(`Minimum cooldown already set to ${time}!`);
			
			//If min cooldown updated, send sucess message
			return msg.reply_bot_msg_suc(`Updated Minimum Cooldown: ${time}`);
		};
		
		return set_min_cooldown(msg.guild.id, time, callback);
	}
};

