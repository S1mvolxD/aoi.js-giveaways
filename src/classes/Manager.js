const { GiveawaysManager } = require('discord-giveaways');
const path = require("path");
//const ms = require('ms');

class Giveaways {
  constructor(args) {
    let bot = args.client;//discord client
    
    
    let storage = path.join(process.cwd(),args.storage);//storage file [string]
    
    let bcw= args.botsCanWin;// bots can win [bool]
    
    let emc=args.embedColor; //giveaway embed color [hex code]
    
    let emce=args.embedColorEnd;//giveaway end embed color [hex code] 
    
    let r =args.reaction;//reaction emoji

    let dmm = args.dmMessage || "Congratulations, {member.username}!! You won {prize}. Link:{link}";
    let djm= args.dmJoinMessage || "Hey {member.username}!! You seemed to have joined the giveaway for {prize}. All the best! Link:{link}";
    let dlm= args.dmLeaveMessage || "Hey {member.username}!! You seemed to have left the giveaway for {prize}. Link:{link}. If this wasn't you, please re-add your reaction!";
    let threshold = ms(args.lastChance.threshold);
    let emcl = args.lastChance.embedColor;

    

    //
    const manager = new GiveawaysManager(bot, {
      storage: storage,
      default: {
          botsCanWin: bcw || false,
          embedColor: emc || "#FF0000",
          embedColorEnd: emce || "#000000",
          reaction: r || "🎉",
          lastChance:{
            enabled:args.lastChance.enabled||false,
            content:args.lastChance.content||"⚠️ **LAST CHANCE TO ENTER !** ⚠️",
            threshold:threshold||ms("1m"),
            embedColor:emcl||"#FFFF00"
            
          }
        }
    });

    if (!manager) {
      console.log("")
    }
    manager.on('giveawayEnded', (giveaway, winners) => {
      winners.forEach((member) => {
        let a = dmm.replace(/{member.username}/g, member.user.username);
        let b = a.replace(/{member.id}/g,member.user.id);
        let c = b.replace(/{prize}/g,giveaway.prize);
        let d = c.replace(/{link}/g,`https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`)
        member.send(d);
      });
    });
    
    manager.on('endedGiveawayReactionAdded', (giveaway, member, reaction) => {
      return reaction.users.remove(member.user);
    });

    manager.on('giveawayReactionAdded', (giveaway, member, reaction) => {
      let a = djm.replace(/{member.username}/g, member.user.username);
      let b = a.replace(/{member.id}/g,member.user.id);
      let c = b.replace(/{prize}/g,giveaway.prize);
      let d = c.replace(/{link}/g,`https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`)
      member.send(d);
      
    });

    manager.on('giveawayRerolled', (giveaway, winners) => {
      winners.forEach((member) => {
        let a = dmm.replace(/{member.username}/g, member.user.username);
        let b = a.replace(/{member.id}/g,member.user.id);
        let c = b.replace(/{prize}/g,giveaway.prize);
        let d = c.replace(/{link}/g,`https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`)
        member.send(d);
      });
    });

    manager.on('giveawayReactionRemoved', (giveaway, member, reaction) => {
      let a = dlm.replace(/{member.username}/g, member.user.username);
      let b = a.replace(/{member.id}/g,member.user.id);
      let c = b.replace(/{prize}/g,giveaway.prize);
      let d = c.replace(/{link}/g,`https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`)
      member.send(d);
      
    });
    this.giveawayManager=manager;
    this.client=bot;

    this.giveaway=args.startMessages.giveaway||"🎉🎉 **GIVEAWAY** 🎉🎉";
    this.giveawayEnded=args.startMessages.giveawayEnded || "🎉🎉 **GIVEAWAY ENDED** 🎉🎉";
    this.inviteToParticipate=args.startMessages.inviteToParticipate||'React with 🎉 to participate!';
    this.winMessage=args.startMessages.winMessage||"Congratulations, {winners}! You won **{this.prize}**!\n{this.messageURL}";
    this.drawing=args.startMessages.drawing||"Drawing: {timestamp}";
    this.embedFooter=args.startMessages.embedFooter||"Powered by aoi.js plugins";
    this.noWinner=args.startMessages.noWinner||"Giveaway cancelled, no valid participations.";
    this.winners=args.startMessages.winners||"Winner(s):";
    this.endedAt=args.startMessages.endedAt||"Ended at";
    this.hostedBy=args.startMessages.hostedBy||"Hosted by: {this.hostedBy}";
    
  }
  loadFuncs(){
    let client = this.client;//getting the client
    let GiveawayManager = this.giveawayManager; //getting the giveaway manager
    
    

    
    //giveaway start function
    client.functionManager.createCustomFunction({
      name: "$Gstart",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [duration,winners,prize,channelid,host] = data.inside.splits;
        const channel = await d.util.getChannel(d, channelid);
        const user = await d.util.getUser(d, host);
        if (!channel) return d.aoiError.fnError(d, "channel", {inside});
        if (!user) return d.aoiError.fnError(d, "user", {inside});


        
        /*const guild = await d.util.getGuild(d, d.guild.id);
        const role = await guild.roles.fetch("934679166484377680").catch(e => undefined);
        if (!role) return d.aoiError.fnError(d, 'role', {inside: data.inside});
        console.log(role)*/
        
        GiveawayManager.start(channel, {
          duration: ms(duration),
          winnerCount:parseInt(winners),
          prize:prize,
          hostedBy:user,
          messages:{
            giveaway:this.giveaway,
            giveawayEnded:this.giveawayEnded,
            inviteToParticipate:this.inviteToParticipate,
            winMessage:this.winMessage,
            drawing:this.drawing,
            dropMessage:this.dropMessage,
            embedFooter:this.embedFooter,
            noWinner:this.noWinner,
            winners:this.winners,
            endedAt:this.endedAt,
            hostedBy:this.hostedBy
          }//,
          /*extraData: {
            role: role == null ? "null" : role.id,
          }*/
        }).catch((err) => {
          return d.aoiError.fnError(
            d,
            "custom",
            {},
            ` ${err}`,
          );
        }).then((gData) => {
          console.log(gData)
            process.exit(0) 
        });;

        
        
        
        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });

    //reroll function
    client.functionManager.createCustomFunction({
      name: "$Greroll",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid,winners] = data.inside.splits;//getting the args.
        //options = JSON.parse(opts[0]);
        //console.log(opts[0])
        let guild = d.guild.id;
        let chk = GiveawayManager.giveaways.find((g) => g.guildId === guild && g.messageId === messageid);
        if (chk.length == 0){
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        ` No giveaway found in the server!`,
      );
        }
        else {
          GiveawayManager.reroll(messageid,{
          winnerCount:parseInt(winners) || 1
          }).catch((err) => {
            return d.aoiError.fnError(
              d,
              "custom",
              {},
              ` ${err}`,
            );
          });
        }
        
        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });

    //edit giveaways
    client.functionManager.createCustomFunction({
      name: "$Gedit",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid,property,newValue] = data.inside.splits;//getting the args.
        let guild = d.guild.id;
        let chk = GiveawayManager.giveaways.find((g) => g.guildId === guild && g.messageId === messageid);
        if (chk.length == 0){
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        `No giveaway found in the server!`,
      );
        }
        else {
        
          if (property=="time"){
            GiveawayManager.edit(messageid, {
            addTime: ms(newValue)
        }).catch((err) => {
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        ` ${err}.`,
      );
        });
          }
          else if (property=="prize"){
            GiveawayManager.edit(messageid, {
            newPrize: newValue
        }).catch((err) => {
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        ` ${err}.`,
      );
        });
          }
          else if (property=="winners"){
            GiveawayManager.edit(messageid, {
            newWinnerCount: parseInt(newValue)
        }).catch((err) => {
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        `${err}.`,
      );
        });
          }
          else {
            return d.aoiError.fnError(
        d,
        "custom",
        {},
        ` Unknown value`,
      );
          }
        }
        //options = JSON.parse(opts[0]);
        //console.log(opts[0])
        
        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });

    //delete a giveaway
    client.functionManager.createCustomFunction({
      name: "$Gdelete",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid] = data.inside.splits;

        let guild = d.guild.id;
        let chk = GiveawayManager.giveaways.find((g) => g.guildId === guild && g.messageId === messageid);
        if (chk.length == 0){
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        ` No giveaway found in the server!`,
      );
        }
        else {
          GiveawayManager.delete(messageid).catch((err) => {
              return d.aoiError.fnError(
          d,
          "custom",
          {},
          `  ${err}`,
        );
          });
        }
        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });

    //pause function
    client.functionManager.createCustomFunction({
      name: "$Gpause",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid] = data.inside.splits;//getting the args.

        let guild = d.guild.id;
        let chk = GiveawayManager.giveaways.find((g) => g.guildId === guild && g.messageId === messageid);
        if (chk.length == 0){
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        ` No giveaway found in the server!`,
      );
        }
        else {
          
          GiveawayManager.pause(messageid).catch((err) => {
            return d.aoiError.fnError(
          d,
          "custom",
          {},
          ` ${err}`,
        );
          });
        }
        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });

    //unpause function
    client.functionManager.createCustomFunction({
      name: "$GUnpause",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid] = data.inside.splits;//getting the args.

        let guild = d.guild.id;
        let chk = GiveawayManager.giveaways.find((g) => g.guildId === guild && g.messageId === messageid);
        if (chk.length == 0){
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        ` No giveaway found in the server!`,
      );
        }
        else {
          GiveawayManager.unpause(messageid).catch((err) => {
            return d.aoiError.fnError(
          d,
          "custom",
          {},
          ` ${err}`,
        );
          });
        }
        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });

    client.functionManager.createCustomFunction({
      name: "$isGiveaway",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid] = data.inside.splits;//getting the args.
        //options = JSON.parse(opts[0]);
        //console.log(opts[0])
        
        if (!messageid){
          return d.aoiError.fnError(
            d,
            "custom",
            {},
            ` No Message ID was provided!`,
          );
        }
        const guild = d.guild.id;
        let a = GiveawayManager.giveaways.find((g) => g.guildId === guild && g.messageId === messageid);

        if (a.length==0){
          data.result=false;
        }
        else{
          data.result=true;
        }
        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });
  

  client.functionManager.createCustomFunction({
      name: "$isActiveGiveaway",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid] = data.inside.splits;//getting the args.
        //options = JSON.parse(opts[0]);
        //console.log(opts[0])
        const guild = d.guild.id;
        if (!messageid){
          return d.aoiError.fnError(
            d,
            "custom",
            {},
            ` No Message ID was provided!`,
          );
        }
        
        
        let a = GiveawayManager.giveaways.filter((g) => g.options.messageId===messageid && g.options.guildId===guild)
        //console.log(a)
        if (a==="undefined"){
          return d.aoiError.fnError(
            d,
            "custom",
            {},
            ` No giveaway was found!`,
          );
        }
        else{
          await Promise.all(a.map(async (x) => {
            if (x.ended==true){
              data.result=false;
            }
            else {
              data.result=true;
            }
          }));
        }
        
          
        

        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });

    client.functionManager.createCustomFunction({
      name: "$Gfind",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid] = data.inside.splits;//getting the args.
        if (!messageid){
          return d.aoiError.fnError(
            d,
            "custom",
            {},
            ` No Message ID was provided!`,
          );
        }
        //options = JSON.parse(opts[0]);
        //console.log(opts[0])
        let guild = d.guild.id;
        let chk = GiveawayManager.giveaways.find((g) => g.messageId === messageid);
        if (chk.length == 0){
          return d.aoiError.fnError(
        d,
        "custom",
        {},
        ` No giveaway found!`,
      );
        }
        else {
          await Promise.all(chk.map(async (x) => {
            data.result=x;
          }));
        }
        
        return {
          code: d.util.setCode(data)
        }
        
        
      }
  });
  client.functionManager.createCustomFunction({
      name: "$isPaused",
      type: "djs",
      code: async d => {
        
        const data = d.util.openFunc(d);
        const [messageid] = data.inside.splits;//getting the args.
        //options = JSON.parse(opts[0]);
        //console.log(opts[0])
        const guild = d.guild.id;
        if (!messageid){
          return d.aoiError.fnError(
            d,
            "custom",
            {},
            ` No Message ID was provided!`,
          );
        }
        
        
        let a = GiveawayManager.giveaways.filter((g) => g.options.messageId===messageid && g.options.guildId===guild)
        //console.log(a)
        if (a==="undefined"){
          return d.aoiError.fnError(
            d,
            "custom",
            {},
            ` No giveaway was found!`,
          );
        }
        else{
          await Promise.all(a.map(async (x) => {
            if (x.ended==true){
              data.result=false;
            }
            else {
              data.result=true;
            }
          }));
        }
        
          
        

        return {
          code: d.util.setCode(data)
        }
        
        
      }
    });
    

  }
}
  
module.exports = {
  Giveaways
}
