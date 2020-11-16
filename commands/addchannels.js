const { add_channel_ids_to_db, find_lock }  = require("../database.js")
const { format_channel_id, format_user_id } = require("../format-id.js");

module.exports = {
	name: "addchannels",
	description: "Add channels to your emote",
	usage: "<emote> <all, channel1 channel2 channel3...> {ADMIN ONLY: user} ",
	aliases: ["ac"],
	min_args: 2,
	execute(msg, args) {
		let emoji            = null;
		let user_id          = msg.is_valid_member(args[0]);
		let channel_ids      = null;
		let emoji_args_index = 1; //Specifies which index in args array the emoji is located
		let is_author_admin  = msg.member.hasPermission("ADMINISTRATOR");
		const module_name    = this.name; //Cannot use "this" inside callback function definition, so small hack
		const module_usage   = this.usage;
		
		//Check if user_id is valid, if not assume emoji is the first argument
		if(!user_id) {
			user_id          = msg.author.id;
			emoji_args_index = 0;
		}
		
		emoji          = msg.is_valid_emoji(args[emoji_args_index]);
		channel_ids    = args[emoji_args_index + 1].toLowerCase() == "all" ? "all" : null ||
			args.map(channel_id => msg.is_valid_channel(channel_id)).slice(emoji_args_index + 1); //Channel IDs can be "all" or an array of valid IDs
		const user     = format_user_id(user_id);
		const channels = channel_ids.map(channel_id => format_channel_id(channel_id));
		
		//If the auhor is not admin and not modifying themselves, send error messsage
		if(!is_author_admin && msg.author.id != user_id) {
			return msg.reply_bot_msg_err("You cannot set other users channels because you are not an admin!");
		}
		
		//If emoji or channel is invalid, send error message
		if(!emoji || channel_ids.includes(null)) {
			let err_msg = !emoji ? "Invalid Emoji!" : "Invalid Channel(s)!";
			return msg.reply_bot_msg_err(err_msg, this.name, this.usage);
		}
		
		//Add channel IDs (or "all") to the database
		const callback_main = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err( "Something went wrong when adding the channel(s)!");
			}
			
			//If no channels were updated in the database
			if(!res.nModified)
				return msg.reply_bot_msg_err(`Either invalid emoji or already have channel(s) set!`, module_name, module_usage);
			
			//If database updated, send success message
			//Using all channels
			if(channel_ids == "all")
				return msg.reply_bot_msg_suc(is_author_admin && msg.author.id != user_id ? `Using all channels for ${user}'s ${emoji} !` : `Using all channels for ${emoji} !`);
			
			//Added specific channels
			return msg.reply_bot_msg_suc(is_author_admin && msg.author.id != user_id ? `Added ${channels} to ${user}'s ${emoji} channel list!` : `Added ${channels} to ${emoji} channel list!`);
		}; 
		
		//Find the lock status of the emote
		const callback_lock = function(err, res) {
			//If unhandled error, send error message
			if(err) {
				console.error(err);
				
				return msg.reply_bot_msg_err( "Something went wrong when checking the lock status!");
			}
			
			const emotes = res.users.find(u => u.user_id == user_id).emotes;
			const lock   = emotes.find(e => e.emote == emoji).lock;
			
			//If locked, send error message, else add channel IDs to database
			if(lock) {
				return msg.reply_bot_msg_err(`${emoji} has been locked!`)
			} else {
				return add_channel_ids_to_db(emoji, user_id, msg.guild.id, channel_ids, callback_main);
			}
		};
		
		//If not an admin check if the emote is locked
		if(!is_author_admin)
			return find_lock(emoji, user_id, msg.guild.id, callback_lock);
		
		return add_channel_ids_to_db(emoji, user_id, msg.guild.id, channel_ids, callback_main);
	}
};

