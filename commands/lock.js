const { format_user_id } = require("../format-id.js");
const { lock_emote }     = require("../database.js");

module.exports = {
	name: "lock",
	description: "Lock a user's emote, cannot be changed by regular users",
	usage: ["<user> <emote>"],
	aliases: ["l", "curse"],
	admin_only: true,
	min_args: 2,
	execute(msg, args) {
		const emoji   = msg.is_valid_emoji(args[1]);
		const user_id = msg.is_valid_member(args[0]);
		const user    = format_user_id(user_id);
		
		//If not an admin, send error message
		if(!msg.member.hasPermission("ADMINISTRATOR"))
			return msg.reply_bot_msg_err("You cannot lock emotes because you are not an admin!");
		
		//Lock emote in the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err("Something went wrong when locking the emote!");
			}
			
			//If emote did not lock, send error message
			if(!res.nModified)
				return msg.reply_bot_msg_err("Either invalid emoji or already locked!");
			
			//If emote locked, send sucess message
			return msg.reply_bot_msg_suc(`Locked ${user}'s ${emoji} emote!`);
		}
		
		return lock_emote(emoji, user_id, msg.guild.id, callback);
	}
};

