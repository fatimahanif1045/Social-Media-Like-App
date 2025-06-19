//Video Captioning with AssemblyAI (Free Tier: 5 hours/month)

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function generateCaptions(filePath) {
  const uploadUrl = 'https://api.assemblyai.com/v2/upload';
  const headers = { authorization: process.env.ASSEMBLYAI_API_KEY };

  
  // 1. Upload video
  const video = fs.createReadStream(filePath);
  const uploadRes = await axios.post(uploadUrl, video, { headers });
  const audioUrl = uploadRes.data.upload_url;

  // 2. Start transcription
  const transcriptRes = await axios.post('https://api.assemblyai.com/v2/transcript', {
    audio_url: audioUrl,
    auto_chapters: true
  }, { headers });

  const transcriptId = transcriptRes.data.id;

  // 3. Poll until done
  let transcript;
  while (true) {
    const res = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, { headers });
    if (res.data.status === 'completed') {
      transcript = res.data;
      break;
    } else if (res.data.status === 'error') {
          console.error('AssemblyAI Error:', res.data);

      throw new Error('Transcription failed');
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  return transcript.text;
  }

module.exports = { generateCaptions };

//Alternatives:
//OpenAI Whisper API (paid) ran of credit
//Google Cloud Speech-to-Text (free: 60 mins/month for 90 days)
