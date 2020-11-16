//TODO: Create better variable names!
const emoji_map = require("./discord-emoji-map.json");

module.exports = {
	//Return Emoji if it is valid, else return null
	is_valid_emoji(emoji_input) {
		//Test if emoji_input is a unicode emoji
		for(const i in emoji_map) {
			if(emoji_map[i] == emoji_input) {
				return emoji_input;
			}
		}
		
		const emoji_raw_id_matches = emoji_input.match(/(\d+)/);
		
		if(emoji_raw_id_matches) {
			const emoji_raw_id = emoji_raw_id_matches[0];
			const emoji_id     = this.guild.emojis.cache.find(e => e.id == emoji_raw_id); 
			
			if(emoji_id)
				return emoji_input;
		}
		
		return null;
	},
	//Return Member ID if it is valid, else return null
	is_valid_member(member_input) {
		const member_username       = this.guild.members.cache.find(m => m.user.username.toLowerCase().startsWith(member_input.toLowerCase()));
		const member_nickname       = this.guild.members.cache.find(m => m.nickname ? m.nickname.toLowerCase().startsWith(member_input.toLowerCase()) : m.nickname);
		const member_raw_id_matches = member_input.match(/(\d+)/);
		
		if(member_username)
			return member_username.id;
		if(member_nickname)
			return member_nickname.id;
		if(member_raw_id_matches) {
			const member_raw_id = member_raw_id_matches[0];
			const member_id     = this.guild.members.cache.find(m => m.id == member_raw_id);
			
			if(member_id)
				return member_id.id
		}
		
		return null;
	},
	//Return Channel ID if it is valid, else return null
	is_valid_channel(channel_input) {
		//If input is a name, make sure channel is text and user has appropiate perms
		const channel_name           = this.guild.channels.cache.find(c => c.name.startsWith(channel_input) && c.type == "text" && this.member.permissionsIn(c).has(["VIEW_CHANNEL", "SEND_MESSAGES"]));
		const channel_raw_id_matches = channel_input.match(/(\d+)/);
		
		if(channel_name)
			return channel_name.id;
		if(channel_raw_id_matches) {
			const channel_raw_id = channel_raw_id_matches[0];
			const channel_id     = this.guild.channels.cache.find(c => c.id == channel_raw_id);
			
			if(channel_id)
				return channel_id.id;
		}
		
		return null;
	}
};

