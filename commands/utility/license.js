const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

const licensesDirPath = path.join(__dirname, '../../data/licenses');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('license')
        .setDescription('Set the license status for a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose license status you want to set')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('status')
                .setDescription('The license status (valid or not)')
                .setRequired(true)
                .addChoices(
                    { name: 'Valid', value: 'valid' },
                    { name: 'Not Valid', value: 'not_valid' })),

    async execute(interaction) {
        const allowedRoleIds = ['1260295156998082716', '1232639719184011337'];

        const hasRole = interaction.member.roles.cache.some(role => allowedRoleIds.includes(role.id));

        if (!hasRole) {
            const embed = new EmbedBuilder()
                .setTitle('Role Not Found')
                .setDescription('Please contact _MAJORMILES if you are WSP or OSCO.')
                .setColor('#FF0000');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const status = interaction.options.getString('status');
        const userId = user.id;
        const filePath = path.join(licensesDirPath, `${userId}.json`);

        if (!fs.existsSync(licensesDirPath)) {
            fs.mkdirSync(licensesDirPath, { recursive: true });
        }

        const licenseData = { status, date: new Date() };
        fs.writeFileSync(filePath, JSON.stringify([licenseData], null, 2), 'utf8'); // Save as an array

        await interaction.reply({ content: `License status for <@${userId}> has been set to ${status}.`, ephemeral: true });
    },
};
