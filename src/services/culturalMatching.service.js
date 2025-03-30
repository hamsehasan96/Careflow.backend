const { User, Participant, CulturalPreference } = require('../models');
const logger = require('../config/logger');

class CulturalMatchingService {
  async findMatchingStaff(participantId) {
    try {
      const participant = await Participant.findByPk(participantId, {
        include: [{
          model: CulturalPreference,
          required: true
        }]
      });

      if (!participant || !participant.CulturalPreference) {
        throw new Error('Participant or cultural preferences not found');
      }

      const { preferredLanguage, religion } = participant.CulturalPreference;

      const matchingStaff = await User.findAll({
        where: {
          role: ['support_worker', 'coordinator'],
          status: 'active',
          languages: {
            [Op.contains]: [preferredLanguage]
          }
        },
        include: [{
          model: CulturalPreference,
          required: true,
          where: {
            religion: religion
          }
        }]
      });

      return matchingStaff;
    } catch (error) {
      logger.error('Cultural matching error:', error);
      throw error;
    }
  }

  async updateCulturalPreferences(participantId, preferences) {
    try {
      const [culturalPrefs] = await CulturalPreference.findOrCreate({
        where: { participantId }
      });

      await culturalPrefs.update(preferences);
      return culturalPrefs;
    } catch (error) {
      logger.error('Update cultural preferences error:', error);
      throw error;
    }
  }

  async getInterpreterRecommendations(participantId) {
    try {
      const participant = await Participant.findByPk(participantId, {
        include: [{
          model: CulturalPreference,
          required: true
        }]
      });

      if (!participant || !participant.CulturalPreference) {
        throw new Error('Participant or cultural preferences not found');
      }

      const { preferredLanguage, preferredInterpreterGender } = participant.CulturalPreference;

      // TODO: Implement interpreter matching logic
      return [];
    } catch (error) {
      logger.error('Get interpreter recommendations error:', error);
      throw error;
    }
  }
}

module.exports = new CulturalMatchingService(); 