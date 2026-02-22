const axios = require('axios');

const getMarketTrends = async (skills) => {
    if (!process.env.RAPID_API_KEY) {
        console.warn('RAPID_API_KEY not found. Returning mock market data.');
        return generateMockData(skills);
    }

    try {
        // Example: Fetch job count for top 3 skills to save API calls
        const topSkills = skills.slice(0, 3);
        const trends = {};

        for (const skill of topSkills) {
            const options = {
                method: 'GET',
                url: 'https://jsearch.p.rapidapi.com/search',
                params: {
                    query: `${skill} developer`,
                    page: '1',
                    num_pages: '1'
                },
                headers: {
                    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            };

            const response = await axios.request(options);
            // Rough estimation of demand based on results length or specific fields if available
            // JSearch returns a list of jobs. length gives a glimpse of "current active listings" in one page.
            // For real aggregate stats, Adzuna or others might be better, but JSearch is common.
            // We'll just map result count to a "demand score".
            const jobCount = response.data.data ? response.data.data.length : 0;
            trends[skill] = {
                activeJobs: jobCount > 0 ? 'High' : 'Low', // Simplified analysis
                jobCount: jobCount
            };
        }

        return trends;
    } catch (error) {
        console.error('Market Data API Error:', error.message);
        return generateMockData(skills);
    }
};

const generateMockData = (skills) => {
    const mockTrends = {};
    skills.forEach(skill => {
        mockTrends[skill] = {
            activeJobs: Math.random() > 0.5 ? 'High' : 'Medium',
            jobCount: Math.floor(Math.random() * 1000) + 100
        };
    });
    return mockTrends;
};

module.exports = { getMarketTrends };
