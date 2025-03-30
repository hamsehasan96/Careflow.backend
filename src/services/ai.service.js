const { Configuration, OpenAIApi } = require('openai');
const config = require('../config/config');

class AIService {
  constructor() {
    const configuration = new Configuration({
      apiKey: config.openai.apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateNoteSummary(noteContent) {
    try {
      const response = await this.openai.createCompletion({
        model: "gpt-3.5-turbo-instruct",
        prompt: `Summarize the following care note in a clear, concise manner, highlighting key points and actions taken:\n\n${noteContent}`,
        max_tokens: 150,
        temperature: 0.3,
      });

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error generating note summary:', error);
      throw new Error('Failed to generate note summary');
    }
  }

  async translateText(text, targetLanguage) {
    try {
      const response = await this.openai.createCompletion({
        model: "gpt-3.5-turbo-instruct",
        prompt: `Translate the following text to ${targetLanguage}:\n\n${text}`,
        max_tokens: 500,
        temperature: 0.3,
      });

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error translating text:', error);
      throw new Error('Failed to translate text');
    }
  }

  async suggestCareActions(participantProfile, recentNotes) {
    try {
      const prompt = `Based on the following participant profile and recent care notes, suggest appropriate care actions:\n\nProfile: ${JSON.stringify(participantProfile)}\n\nRecent Notes: ${recentNotes}`;
      
      const response = await this.openai.createCompletion({
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 200,
        temperature: 0.3,
      });

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error suggesting care actions:', error);
      throw new Error('Failed to generate care action suggestions');
    }
  }

  async analyzeCulturalPreferences(preferences) {
    try {
      const prompt = `Analyze the following cultural preferences and suggest appropriate accommodations and considerations:\n\n${JSON.stringify(preferences)}`;
      
      const response = await this.openai.createCompletion({
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 200,
        temperature: 0.3,
      });

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error analyzing cultural preferences:', error);
      throw new Error('Failed to analyze cultural preferences');
    }
  }
}

module.exports = new AIService(); 