import axios from "axios";

// export default async function handler(req, res) {
//   const { responseText } = req.body;

//   try {
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_PROD_URL}/synthesize_speech`,
//       {
//         text: responseText,
//       },
//       {
//         headers: { "Content-Type": "application/json" },
//         responseType: "arraybuffer", // Expecting a byte array in response
//       }
//     );
//     // Log size of audio file
//     console.log(`Size of audio file: ${audioFileSize} bytes`);
//     // Set proper header for type of response
//     res.setHeader("Content-Type", "audio/mpeg");

//     // Make sure to convert the data to a Buffer for proper handling on the front-end
//     return res.status(200).send(Buffer.from(response.data));
//   } catch (error) {
//     res.status(500).json({ error: error.toString() });
//   }
// }
export default async function handler(req, res) {
  const { responseText } = req.body;

  try {
    const response = await axios.post(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        input: { text: responseText },
        voice: {
          languageCode: "en-US",
          ssmlGender: "FEMALE",
        },
        audioConfig: { audioEncoding: "MP3" },
      },
      {
        params: { key: process.env.GOOGLE_API_KEY },
      }
    );
    if (response.data.audioContent) {
      console.log("Synthesized speech received.");
      // Convert the audioContent (which is in base64) to a Buffer
      const audioBuffer = Buffer.from(response.data.audioContent, 'base64');
      res.setHeader("Content-Type", "audio/mpeg");
      res.status(200).send(audioBuffer);
    } else {
      console.log("No audio content received.");
      res.status(400).json({ error: "No audio content received." });
    }
    // if (response.status === 200) {
    //   //   res.setHeader("Content-Type", "audio/mpeg");
    //   //   // Make s.arrayBuffer
    //   //   console.log(response.data.audioContent);
    //   //   return res.status(200).send(Buffer.from(response.data.audioContent));
    //   const readable = new ReadableStream({
    //     start(controller) {
    //       controller.enqueue(Buffer.from(response.data.audioContent));
    //       controller.close();
    //     },
    //   });

    //   const response = new Response(readable, {
    //     headers: { "Content-Type": "audio/webm" },
    //   });
    //   const { readable: _, ...audioResponse } = await response.json();
    //   res.status(200).json(audioResponse);
    // } else {
    //   res.status(500).json({ error: response.error });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
