const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes a specified number of messages')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)),
    
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'You need to input a number between 1 and 100.', ephemeral: true });
        }

        await interaction.channel.bulkDelete(amount, true).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to purge messages in this channel!', ephemeral: true });
        });

        return interaction.reply({ content: `Successfully deleted ${amount} messages.`, ephemeral: true });
    },
};
