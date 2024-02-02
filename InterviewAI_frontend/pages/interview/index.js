import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Button,
  DialogActions,
  Stack,
  DialogTitle,
  Container,
  CircularProgress,
  DialogContent,
} from "@mui/material";
import Interview from "@/components/Question/Interview";
import { motion } from "framer-motion";
import AppContext from "@/contexts/AppContext";
import { useRouter } from "next/router";
import Dialog from "@mui/material/Dialog";
import { questionList } from "@/constants/questionList";
import { SignalWifiStatusbarNullTwoTone } from "@mui/icons-material";
import { Ready } from "@/components/Question/Ready";
// import usePlayAudio from "../../Hooks/usePlayAudio";

export default function Question() {
  const recognitionRef = useRef(null);
  const router = useRouter();

  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [indexNum, setIndexNum] = useState(1);
  const [open, setOpen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognizedSpeech, setRecognizedSpeech] = useState("");
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [interviewOver, setInterviewOver] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [recordStarted, setRecordStarted] = useState(false);
  const { questions, setQuestions } = useContext(AppContext);
  const [answers, setAnswers] = useState(
    questions.map((item) => {
      return "";
    })
  );
  const [tempAnswer, setTempAnswer] = useState(answers[indexNum - 1]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [expanded, setExpanded] = useState(false);
  const currentlyPlayingAudioRef = useRef(null);

  const startRecording = () => {
    if (!recordStarted) {
      setRecordStarted(true);
    }
    setExpanded(true)
    console.log("started...");

    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();

      // Setup properties for the recognition object
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      // Define event handlers for the recognition object
      recognitionRef.current.onstart = function () {
        setIsListening(true);
        console.log('Speech recognition service has started');
      };

      recognitionRef.current.onend = function () {
        setIsListening(false);
        console.log('Speech recognition service disconnected');
      };

      // Handle the results of recognition
      recognitionRef.current.onresult = function (event) {
        // Example: handle the speech recognition results
        let transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        console.log(transcript);
        setTempAnswer(transcript.trim());
        // You can add your code here to handle the results, e.g. updating state or calling a callback
      };

      recognitionRef.current.start();
      setRecordStarted(true);
      // recognitionRef.current = new window.webkitSpeechRecognition();
      // recognitionRef.current.lang = "en-US";
      // recognitionRef.current.continuous = true;
      // recognitionRef.current.interimResults = false; // Set to true to capture interim results

      // recognition.onresult = (event) => {
      //   // Reset the silence timer on new speech detected
      //   // clearTimeout(silenceTimeout);

      //   // Capture the transcript and update state
      //   const isFinal = event.results[event.resultIndex].isFinal;
      //   const transcript = event.results[event.resultIndex][0].transcript;
      //   // console.log(transcript);

      //   if (isFinal) {
      //     console.log(transcript.trim())
      //     setTempAnswer(transcript.trim());
      //     // If result is final, reset recognizedSpeech to only the latest transcript
      //     // setRecognizedSpeech(transcript.trim());
      //     // Set a timeout to submit the voice response after 2 seconds of silence
      //     // silenceTimeout = setTimeout(() => {
      //     //   // submitVoiceResponse(transcript.trim());
      //     //   console.log(tempAnswer, 'heirotioerhtoehri');
      //     //   console.log(transcript.trim())
      //     //   setTempAnswer(tempAnswer + transcript.trim());
      //     // }, 2);
      //   }
      // };

      // recognition.onerror = (event) => {
      //   console.error("Speech recognition error:", event.error);
      //   alert('Can not find microphone. Check microphone status');
      //   setRecordStarted(false);
      // };

      // recognition.start();
      // setIsListening(true);
    } else {
      console.error("Speech recognition not supported in this browser.");
    }
  };
  const submitVoiceResponse = async (transcript) => {
    if (transcript.trim()) {
      setConversationHistory((prevHistory) => [
        ...prevHistory,
        { user: transcript.trim(), ai: "" },
      ]);
      setRecognizedSpeech("");
      await sendToChatGPT(transcript.trim());
    }
  };

  const handleDownloadAnalysis = async () => {
    try {
      const response = await fetch("/api/generate_analysis");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadLink(url);
    } catch (error) {
      console.error("Error fetching analysis file:", error);
    }
  };

  const playAIsResponse = async (responseText) => {
    console.log(questions, "debuging-----------------------------")
    try {
      console.log(responseText)
      const response = await fetch("/api/synthesize_speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseText: responseText,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // alert("Please approve the audio on this device");

      console.log(isAiTalking, '1')
      if (isAiTalking === false) {
        setIsAiTalking(true);
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentlyPlayingAudioRef.current = audio;

        audio.addEventListener("ended", () => {
          // recognition.start();
          setIsListening(true);
          setIsAiTalking(false);
          currentlyPlayingAudioRef.current = SignalWifiStatusbarNullTwoTone;
        });


        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          // alert("Please approve the audio on this device");
          if (confirm("Please approve the audio on this device")) {
            playAIsResponse(responseText);
          }
        });
      }
    } catch (error) {
      console.error("Error synthesizing speech:", error);
    }
  };

  const getInitialAIQuestion = async () => {
    try {
      const response = await fetch("/api/interview_start");

      const initialQuestion = response.question;
      // playAIsResponse(response.question);
      setConversationHistory([{ user: "", ai: initialQuestion }]);
    } catch (error) {
      console.error("Error fetching initial AI question:", error);
    }
  };

  const sendToChatGPT = async (speech) => {
    try {
      const response = await fetch("/api/chatgpt_reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          speech: speech,
        }),
      });
      setConversationHistory((prevHistory) => {
        const newHistory = [...prevHistory];
        newHistory[newHistory.length - 1].ai = response.question;
        return newHistory;
      });
      setCurrentQuestionNumber(response.question_count); // Update question count

      if (response.question_count > max_question_count) {
        // Handle end of interview
        setInterviewOver(true);
        handleDownloadAnalysis(); // Call function to generate and set download link
      } else {
        // Continue interview as normal
        // playAIsResponse(response.question);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSubmitAnswer = async () => {
    console.log("submit QA");
    let combinedQA
    setIsLoading(true);
    if (indexNum == 10) {
      combinedQA = questions
        .map((question, index) => {
          let qNumber = question.split(".")[0];
          return `question ${qNumber}: ${question.slice(
            qNumber.length + 2
          )}\nanswer ${qNumber}: ${answers[index]}`;
        })
        .join("\n\n");
    }
    else {
      combinedQA = "Question: " + questions[indexNum - 1].split(".").slice(1).join(".") + "\n" + "Answer: " + answers[indexNum - 1];
    }

    console.log(combinedQA);
    setIsLoading(true);
    const response = await fetch("/api/submit_answer", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        combinedQA: combinedQA,
      }),
    });
    setIsLoading(false);

    if (!response.ok) {
      // handle error case
      const errorData = await response.json();
      console.error(errorData);
    } else {
      let res = await response.json();
      setAnalysis(res.analysis);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(recordStarted)
    if (recordStarted === false && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [recordStarted]);

  useEffect(() => {
    // Ensure that the questions have been loaded
    setTempAnswer(answers[indexNum - 1])
    if (questions.length > 0 && isFirstRender !== true) {
      console.log(isAiTalking, "playing audio....")
      // Check if the system is not already listening to not overlap audio with recognition
      if (!isAiTalking && isStarted) {
        playAIsResponse(questions[indexNum - 1]);
      }
    }
    setIsFirstRender(false)
  }, [indexNum, isFirstRender, isStarted]);

  // Additional effect to manage the lifecycle of the audio
  useEffect(() => {
    // Function to be called to cleanup the audio
    const stopAudio = () => {
      if (currentlyPlayingAudioRef.current && typeof currentlyPlayingAudioRef.current.pause === 'function') {
        console.log("removed////")
        currentlyPlayingAudioRef.current.pause();
        currentlyPlayingAudioRef.current = null;
      }
    };

    return () => {
      stopAudio(); // Cleanup audio when the component unmounts or the effect's dependencies change
    };
  }, [indexNum]);

  useEffect(() => {
    if (!questions || questions.length === 0) router.push("/");
  }, [questions]);

  useEffect(() => {
    console.log(answers);
  }, [answers]);

  useEffect(() => {
    if (analysis != "") {
      setOpen(true);
    }
  }, [analysis]);

  const componentList = questions.map((question, index) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <Interview
          questionType={questionList[indexNum - 1]}
          indexNum={indexNum}
          totalNum={questions.length}
          question={question}
          setIndexNum={setIndexNum}
          recordStarted={recordStarted}
          setRecordStarted={setRecordStarted}
          startRecording={startRecording}
          answers={answers}
          setAnswers={setAnswers}
          tempAnswer={tempAnswer}
          setTempAnswer={setTempAnswer}
          expanded={expanded}
          setExpanded={setExpanded}
          handleSubmitAnswer={handleSubmitAnswer}
          isAiTalking={isAiTalking}
          setIsAiTalking={setIsAiTalking}
        />
      </motion.div>
    );
  });
  return (
    isStarted ?
      <React.Fragment>
        <Dialog
          open={open}
          onClose={handleClose}
          scroll={"paper"}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          maxWidth="md"
        >
          <DialogTitle id="scroll-dialog-title">Analysis</DialogTitle>
          <DialogContent dividers={true}>
            {analysis.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            {/* <Button onClick={handleClose}>Subscribe</Button> */}
          </DialogActions>
        </Dialog>
        <div
          style={{
            width: "100vw",
            height: "80vh",
            zIndex: "2",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            position: "absolute",
            display: isLoading ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </div>
        {componentList[indexNum - 1]}
      </React.Fragment>
      : <Ready startInterview={() => { setIsStarted(true) }} />
  );
}
