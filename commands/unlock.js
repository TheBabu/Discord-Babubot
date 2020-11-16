const { format_user_id } = require("../format-id.js");
const { unlock_emote }   = require("../database.js");

module.exports = {
	name: "unlock",
	description: "Unlock an emote, so regular users can edit the emote",
	usage: "<user> <emote>",
	aliases: ["u"],
	admin_only: true,
	min_args: 1,
	execute(msg, args) {
		const emoji   = msg.is_valid_emoji(args[1]);
		const user_id = msg.is_valid_member(args[0]);
		const user    = format_user_id(user_id);
		
		//If not admin, send error message
		if(!msg.member.hasPermission("ADMINISTRATOR"))
			return msg.reply_bot_msg_err("You cannot unlock emotes because you are not an admin!");
		
		//Unlock emote in the database
		const callback = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err("Something went wrong when unlocking the emote!");
			}
			
			//If emote not unlocked, send error message
			if(!res.nModified)
				return msg.reply_bot_msg_err("Either invalid emoji or already unlocked!");
			
			//If emote unlocked, send success message
			return msg.reply_bot_msg_suc(`Unlocked ${user}'s ${emoji} emote!`);
		}
		
		return unlock_emote(emoji, user_id, msg.guild.id, callback);
	}
};

