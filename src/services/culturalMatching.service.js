const { User, Participant, CulturalPreference } = require('../models');
const logger = require('../config/logger');
const aiService = require('./ai.service');
const { Op } = require('sequelize');

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

      const { preferredLanguage, religion, dietaryRestrictions, culturalPractices } = participant.CulturalPreference;

      // Find staff with matching language and religion
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

      // Get AI analysis of cultural preferences
      const culturalAnalysis = await aiService.analyzeCulturalPreferences({
        preferredLanguage,
        religion,
        dietaryRestrictions,
        culturalPractices
      });

      // Score and sort matches based on cultural compatibility
      const scoredMatches = await Promise.all(matchingStaff.map(async (staff) => {
        const staffPrefs = staff.CulturalPreference;
        const matchScore = this.calculateMatchScore(
          participant.CulturalPreference,
          staffPrefs
        );

        return {
          staff,
          matchScore,
          culturalAnalysis
        };
      }));

      // Sort by match score and return top matches
      return scoredMatches
        .sort((a, b) => b.matchScore - a.matchScore)
        .map(match => match.staff);
    } catch (error) {
      logger.error('Cultural matching error:', error);
      throw error;
    }
  }

  calculateMatchScore(participantPrefs, staffPrefs) {
    let score = 0;
    
    // Language match (highest weight)
    if (participantPrefs.preferredLanguage === staffPrefs.preferredLanguage) {
      score += 40;
    }

    // Religion match
    if (participantPrefs.religion === staffPrefs.religion) {
      score += 30;
    }

    // Dietary restrictions compatibility
    if (staffPrefs.dietaryRestrictions && 
        staffPrefs.dietaryRestrictions.some(diet => 
          participantPrefs.dietaryRestrictions.includes(diet))) {
      score += 20;
    }

    // Cultural practices compatibility
    if (staffPrefs.culturalPractices && 
        staffPrefs.culturalPractices.some(practice => 
          participantPrefs.culturalPractices.includes(practice))) {
      score += 10;
    }

    return score;
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

      // Find interpreters with matching language and gender preferences
      const interpreters = await User.findAll({
        where: {
          role: 'interpreter',
          status: 'active',
          languages: {
            [Op.contains]: [preferredLanguage]
          }
        },
        include: [{
          model: CulturalPreference,
          required: true,
          where: {
            preferredInterpreterGender: preferredInterpreterGender
          }
        }]
      });

      // Get AI analysis for interpreter recommendations
      const interpreterAnalysis = await aiService.analyzeCulturalPreferences({
        preferredLanguage,
        preferredInterpreterGender,
        religion: participant.CulturalPreference.religion
      });

      return {
        interpreters,
        analysis: interpreterAnalysis
      };
    } catch (error) {
      logger.error('Get interpreter recommendations error:', error);
      throw error;
    }
  }
}

module.exports = new CulturalMatchingService(); 