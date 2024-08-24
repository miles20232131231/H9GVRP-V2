const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('early')
        .setDescription('Sends the early access embed.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
        .addStringOption(option =>
            option.setName('session-link')
                .setDescription('Link for the session so that EA people can join.')
                .setRequired(true)),
    async execute(interaction) {
        const sessionLink = interaction.options.getString('session-link');

        const embed = new EmbedBuilder()
            .setTitle('H9GVRP | Early Access')
            .setDescription('Early Access is now Live! Nitro Boosters, members of the Emergency Services, and Content Creators can join the session by clicking the button below.\n\nPlease keep in mind that sharing the session link with anyone is strictly forbidden and may lead to penalties. We appreciate your cooperation in keeping our community secure and fair for everyone.')
            .setFooter({
                text: 'H9GVRP',
                iconURL: 'https://cdn.discordapp.com/icons/1231665533653352500/68bd0fb834d88b198910d85cd60056ad.png?size=4096'
            });

        const button = new ButtonBuilder()
            .setLabel('Early Access')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('ea');

        const row = new ActionRowBuilder()
            .addComponents(button);

            const newEmbed = new EmbedBuilder()
            .setTitle("Session Early Access")
            .setDescription(`<@${interaction.user.id}> released early access. The link is provided below
                **Link**
                ${sessionLink}`)

        const targetChannel = await interaction.client.channels.fetch('1271365805644189737');
        await targetChannel.send({ embeds: [newEmbed] });


        await interaction.channel.send({ 
            content: '<@&1256660637166338179>, <@&1253043896481484880>', 
            embeds: [embed], 
            components: [row] 
        });

        await interaction.reply({ content: 'Early Access Sent.', ephemeral: true });

        const filter = i => i.customId === 'ea';
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 9999999 });

        collector.on('collect', async i => {
            const logChannel = interaction.guild.channels.cache.get('1271365805644189737');
            if (logChannel) {
                await logChannel.send(`Interaction collected from ${i.user.tag} at ${new Date().toISOString()}`);
            }

            if (i.member.roles.cache.has('1256660637166338179') || i.member.roles.cache.has('1250786185677242463') || i.member.roles.cache.has('1253043896481484880')) {
                await i.reply({ content: `**Link:** ${sessionLink}`, ephemeral: true });
            } else {
                await i.reply({ 
                    content: 'You do not have this special role, given early access to some perks and content previews. If you wish to get this role, go to <#1266206193244704846> and follow the instructions. Start to enjoy all the benefits of being a holder of one of the special roles once you get the role!', 
                    ephemeral: true 
                });
            }
        });

        collector.on('end', async collected => {
            const logChannel = interaction.guild.channels.cache.get('1271365805644189737');
            if (logChannel) {
                await logChannel.send(`Collected ${collected.size} interactions.`);
            }
        });

        collector.on('error', async error => {
            const logChannel = interaction.guild.channels.cache.get('1271365805644189737');
            if (logChannel) {
                await logChannel.send(`Collector encountered an error: ${error}`);
            }
            console.error('Collector encountered an error:', error);
        });
    },
};
