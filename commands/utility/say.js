const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Sends a message by the bot')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Type a message')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        
        await interaction.reply({ content: `Sending message: ${message}`, ephemeral: true });

        
        await interaction.channel.send({ content: message });

        const newEmbed = new EmbedBuilder()
        .setTitle("Say command used!")
        .setDescription(`<@${interaction.user.id}> has used the say command and said **${message}**.`)

    const targetChannel = await interaction.client.channels.fetch('1271365805644189737');
    await targetChannel.send({ embeds: [newEmbed] });
    },
};
