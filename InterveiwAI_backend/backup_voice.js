import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VoiceChat() {
    const [aiResponses, setAiResponses] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [currentSegment, setCurrentSegment] = useState('');
    const [aiQuestion, setAiQuestion] = useState('');
    const [userResponses, setUserResponses] = useState([]);
    const [typedResponse, setTypedResponse] = useState(''); // for textbox
    const responsePlaceholder = ""

    useEffect(() => {
        getInitialAIQuestion();
    }, []);

    useEffect(() => {
        // Update the transcript whenever aiResponses changes
        setTranscript(aiResponses.join('\n'));
    }, [aiResponses]);

    useEffect(() => {
        if (aiResponses.length > 0 && aiResponses[aiResponses.length - 1] === "The interview is over.") {
            // Handle end of interview
        }
    }, [aiResponses]);

    const getInitialAIQuestion = async () => {
        try {
            const response = await axios.get('http://localhost:8000/chatgpt_reply');
            setAiQuestion(response.data.question);
        } catch (error) {
            console.error('Error fetching initial AI question:', error);
        }
    };

    // VOICE
    // const handleUserResponse = async () => {
    //     if (!transcript) {
    //         console.log("No transcript to send");
    //         return;
    //     }
    
    //     const response = transcript.trim();
    //     setUserResponses([...userResponses, response]); // Store user response

    //     try {
    //         const aiResponse = await axios.post('http://localhost:8000/user_response/', {
    //             response: responseToSend
    //         });            
    //         if (aiResponse && aiResponse.data && aiResponse.data.ai_response) {
    //             setAiResponses(prevAiResponses => [...prevAiResponses, aiResponse.data.ai_response]);
    //             console.log(aiResponse.data); // Log the response from the backend
    //             console.log("TESTING1")
    //             setTranscript(''); // Reset transcript for the next user response
    //         } else {
    //             console.error('Invalid response from backend:', aiResponse);
    //         }
    //     } catch (error) {
    //         console.error('Error sending response to backend:', error);
    //     }

    // };
    
    const handleSubmitTypedResponse = async () => {
        if (!typedResponse) {
            console.log("No typed response to send");
            return;
        }
    
        // Trim the response and store it
        const responseToSend = typedResponse.trim();
        setUserResponses((prevResponses) => [...prevResponses, responseToSend]); // Store typed response
        setTypedResponse(''); // Reset the typed response input
    
        try {
            const response = await axios.get('http://localhost:8000/chatgpt_reply');
            setAiQuestion(response.data.question);
        } catch (error) {
            console.error('Error fetching initial AI question:', error);
        }
    };

    const combinedResponses = userResponses.map((userResponse, index) => {
        return (
            <div key={`combo-${index}`}>
                <div>User: {userResponse}</div>
                {aiResponses[index] && <div><strong>AI:</strong> {aiResponses[index]}</div>}
            </div>
        );
    });
    
    
    // useEffect(() => {
    //     if ('webkitSpeechRecognition' in window) {
    //         const recognition = new window.webkitSpeechRecognition();
    //         recognition.lang = 'en-US';
    //         recognition.continuous = true;
    //         recognition.interimResults = true;
    
    //         recognition.onresult = (event) => {
    //             const lastResult = event.results[event.resultIndex];
    //             const text = lastResult[0].transcript;
    
    //             if (lastResult.isFinal) {
    //                 setTranscript((prevTranscript) => {
    //                     return prevTranscript + (prevTranscript ? "\n" : "") + text.trim() + '.';
    //                 });
    //                 setCurrentSegment('');
    
    //                 (async () => {
    //                     await handleUserResponse();
    //                 })();
    //             } else {
    //                 setCurrentSegment(text);
    //             }
    //         };
    
    //         recognition.onstart = () => setIsListening(true);
    //         recognition.onend = () => setIsListening(false);
    
    //         window.recognition = recognition;
    //     }
    // }, []);

    const startListening = () => {
        if (window.recognition) {
            window.recognition.start();
        } else {
            console.error('Speech recognition not available');
        }
    };

    const stopListening = () => {
        if (window.recognition) {
            window.recognition.stop();
        }
    };

    return (
        <div>
            <button onClick={startListening} disabled={isListening}>Start Speaking</button>
            <button onClick={stopListening} disabled={!isListening}>Stop Speaking</button>
            <div>                
                <div>
                    <h2>Transcript</h2>
                    <p>AI: {aiQuestion}</p>
                    <p>User: {transcript + (currentSegment ? "\n" + currentSegment : "")}</p>
                </div>
                <div> 
                    {aiResponses.map(res =>
                    <p>{res}</p> 
                    )}
                </div>
                <div>
                    {combinedResponses}
                </div>
            </div>
        
                    
            <div>
                <input
                    type="text"
                    value={typedResponse}
                    onChange={(e) => setTypedResponse(e.target.value)}
                    placeholder="Type your response here"
                />
                <button onClick={handleSubmitTypedResponse}>Send</button>
            </div>

            <div>
            {/* ... existing UI elements ... */}

            <div>
                <h2>Conversation</h2>
                {combinedResponses}
            </div>

            {/* ... existing input and button for typed responses ... */}
        </div>

        
        </div>
    );
}

export default VoiceChat;
