// moderation.js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function moderateContent(videoPath) {
  const form = new FormData();
  form.append('media', fs.createReadStream(videoPath));
form.append('models', 'nudity-2.1,weapon,alcohol,recreational_drug,violence');
  form.append('api_user', process.env.SIGHTENGINE_API_USER);
  form.append('api_secret', process.env.SIGHTENGINE_API_SECRET);

  try {
    const response = await axios.post(
      'https://api.sightengine.com/1.0/video/check-sync.json',
      form,
      { headers: form.getHeaders() }
    );

    const res = response.data;
    if (res.status !== 'success' || !res.data?.frames) {
      console.warn('No frames returned or moderation failed', res);
      return { success: true, raw: res };
    }

    let unsafeFrame = null;

    res.data.frames.forEach((frame, idx) => {
      const n = frame.nudity?.raw || 0;
      const w = frame.weapon?.prob || 0;
      const a = frame.alcohol?.prob || 0;
      const d = frame.recreational_drug?.prob || 0;

      console.log(`Frame #${idx}: nudity=${n}, weapon=${w}, alcohol=${a}, drugs=${d}`);

      if (!unsafeFrame && (n > 0.4 || w > 0.4 || a > 0.4 || d > 0.4)) {
        unsafeFrame = { idx, n, w, a, d };
      }
    });

    return {
      success: !unsafeFrame,
      raw: res,
      unsafeFrame
    };

  } catch (err) {
    console.error('Moderation API error:', err.response?.data || err.message);
    return { success: true, error: err };
  }
}

module.exports = { moderateContent };

//Sightengine – better NSFW detection, offers 2,500 free checks/month.

//Content Moderation with DeepAI ran of credit
