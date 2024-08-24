const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

const policeRecordsDirPath = path.join(__dirname, '../../data/policeRecords');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('arrest')
        .setDescription('Record an arrest for a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to arrest')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the arrest')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('offenses')
                .setDescription('The offenses committed by the user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('price')
                .setDescription('The price or fine associated with the arrest')
                .setRequired(true)),

    async execute(interaction) {
        const allowedRoleIds = ['1260295156998082716', '1232639719184011337'];

        const hasRole = interaction.member.roles.cache.some(role => allowedRoleIds.includes(role.id));

        if (!hasRole) {
            const embed = new EmbedBuilder()
                .setTitle('Role Not Found')
                .setDescription('Please contact _MAJORMILES if you are WSP or OSCO.')
                .setColor('#FF0000'); // Red color for error

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const offenses = interaction.options.getString('offenses');
        const price = interaction.options.getString('price');
        const userId = user.id;
        const filePath = path.join(policeRecordsDirPath, `${userId}.json`);

        if (!fs.existsSync(policeRecordsDirPath)) {
            fs.mkdirSync(policeRecordsDirPath, { recursive: true });
        }

        let policeRecord = [];
        if (fs.existsSync(filePath)) {
            policeRecord = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        policeRecord.push({
            reason,
            offenses,
            price,
            date: new Date(),
            executedBy: interaction.user.tag
        });
        fs.writeFileSync(filePath, JSON.stringify(policeRecord, null, 2), 'utf8');

        await interaction.reply({ content: `Arrest record for <@${userId}> has been added.`, ephemeral: true });
    },
};
