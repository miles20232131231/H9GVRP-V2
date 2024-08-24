const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

const ticketsDirPath = path.join(__dirname, '../../data/tickets');

// Ensure the tickets directory exists
if (!fs.existsSync(ticketsDirPath)) {
    fs.mkdirSync(ticketsDirPath, { recursive: true });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a new ticket.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user for whom the ticket is being created.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('offense')
                .setDescription('The offense for the ticket')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('The price for the ticket')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('The count for the ticket')
                .setRequired(true)),

    async execute(interaction) {
        // Role IDs that are allowed to use this command
        const allowedRoleIds = ['1260295156998082716', '1232639719184011337'];

        // Check if the user has one of the allowed roles
        const hasRole = interaction.member.roles.cache.some(role => allowedRoleIds.includes(role.id));

        if (!hasRole) {
            const embed = new EmbedBuilder()
                .setTitle('Role Not Found')
                .setDescription('You do not have permission to use this command.')
                .setColor('#FF0000'); // Red color for error

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const offense = interaction.options.getString('offense');
        const price = interaction.options.getInteger('price');
        const count = interaction.options.getInteger('count');
        const userId = user.id;

        const ticketFilePath = path.join(ticketsDirPath, `${userId}.json`);

        // Prepare the ticket data
        const ticketData = {
            offense,
            price,
            count,
            date: new Date()
        };

        // Save the ticket data to a file
        let tickets = [];
        if (fs.existsSync(ticketFilePath)) {
            tickets = JSON.parse(fs.readFileSync(ticketFilePath, 'utf8'));
        }
        tickets.push(ticketData);
        fs.writeFileSync(ticketFilePath, JSON.stringify(tickets, null, 2), 'utf8');

        const replyEmbed = new EmbedBuilder()
            .setTitle('Ticket Created')
            .setDescription(`The ticket for <@${userId}> has been created successfully.`)
            .addFields(
                { name: 'Offense', value: offense, inline: true },
                { name: 'Price', value: price.toString(), inline: true },
                { name: 'Count', value: count.toString(), inline: true }
            )
            .setColor('#00FF00'); // Green color for success

        await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
    },
};
