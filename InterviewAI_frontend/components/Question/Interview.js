import React, { useState, useEffect } from 'react';
import {
  Stack,
  Container,
  Box,
  TextField,
  Typography,
  Accordion,
  IconButton,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  CardMedia,
  Switch,
} from "@mui/material";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MicIcon from "@mui/icons-material/Mic";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import TvIcon from "@mui/icons-material/Tv";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
export default function Interview({
  questionType,
  indexNum,
  totalNum,
  question,
  setIndexNum,
  recordStarted,
  setRecordStarted,
  startRecording,
  answers,
  setAnswers,
  handleSubmitAnswer,
  isAiTalking,
  setIsAiTalking,
  tempAnswer,
  setTempAnswer,
  expanded,
  setExpanded
}) {

  const [isDisabled, setIsDisabled] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [videoGender, setVideoGender] = useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const handleAccordionChange = (event, newExpanded) => {
    setExpanded(newExpanded);
  };
  const handleNext = () => {
    setIndexNum(indexNum + 1);
    setExpanded(false);
    setIsAiTalking(false);
  };
  const handlePrev = () => {
    setIndexNum(indexNum - 1);
    setExpanded(false);
    setIsAiTalking(false);
  };
  const handleChangeVideoShow = () => {
    setShowVideo(!showVideo);
  };
  const handleChangeVideoGender = (e) => {
    setVideoGender(!videoGender);
  };
  const handleChangeAnswer = () => {
    let newAnswers = [...answers];
    newAnswers[indexNum - 1] = tempAnswer;
    setAnswers(newAnswers);
    setExpanded(false);
    setRecordStarted(false);
  };

  useEffect(() => {
    // Set a timeout to enable the button after 1 second
    const timer = setTimeout(() => {
      setIsDisabled(false);
    }, 2500);

    // Cleanup the timer when the component unmounts or rerenders
    return () => clearTimeout(timer);
  }, [indexNum]);

  return (
    <Container maxWidth="md">
      <Stack
        spacing={2}
        sx={{
          marginTop: "15vh",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          bgcolor: "#f4f5f7",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button variant="outlined" sx={{ paddingY: "1px", paddingX: "3px" }}>
            {questionType}
          </Button>
          <Typography
            fontSize={"18px"}
            color={"gray"}
            sx={{ userSelect: "none" }}
          >
            {indexNum}/{totalNum}
          </Typography>
        </Box>
        <Stack
          sx={{ bgcolor: "white", padding: "20px", borderRadius: "10px" }}
          spacing={3}
        >
          {/* <Typography variant="h6" color={"#5EB5F3"} fontWeight={"bold"}>
            Question
          </Typography> */}
          <Typography fontSize={"25px"}>{question.split(".").slice(1).join(".")}</Typography>
        </Stack>
        <Accordion
          sx={{
            width: "100%",
            border: "0px",
            boxShadow: "none",
            bgcolor: "#fafafa",
          }}
          expanded={expanded}
          onChange={handleAccordionChange}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
          >
            Your Answer
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              multiline
              rows={4}
              sx={{ width: "100%", bgcolor: "white" }}
              value={tempAnswer}
              onChange={(e) => {
                setTempAnswer(e.target.value);
              }}
            />
          </AccordionDetails>
          <AccordionActions>
            <Button variant="outlined" onClick={handleChangeAnswer}>
              Done
            </Button>
          </AccordionActions>
        </Accordion>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction={"row"} spacing={3}>
            <Button
              variant="outlined"
              startIcon={<MicIcon />}
              disabled={recordStarted}
              onClick={startRecording}
            >
              {answers[indexNum - 1] === "" ? "Record" : "Redo"}
            </Button>
            <IconButton
              aria-label="keyboard"
              color="primary"
              onClick={handleExpandClick}
              size="large"
              disabled={recordStarted}
            >
              <KeyboardIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<TvIcon />}
              disabled={false}
              onClick={handleChangeVideoShow}
            >
              {showVideo ? "Hide Interviewer's Video" : "Show Interviewer's Video"}
            </Button>
            <Button variant="outlined" onClick={handleSubmitAnswer} disabled={answers[indexNum - 1] === ""}>
              {indexNum == 10 ? "Analyze Full Intervew" : "Analyze This Response"}
            </Button>
          </Stack>
          <Stack direction={"row"} spacing={1}>

            <IconButton
              color="primary"
              size="large"
              disabled={indexNum === 1 || isDisabled}
              onClick={() => {
                handleChangeAnswer();
                handlePrev();
              }}
              sx={{
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: 'lightblue', // Optional: change to a different blue when hovering
                },
                // Set the background to a lighter blue when disabled, if desired
                // '&.Mui-disabled': {
                //   backgroundColor: 'lightblue',
                // },
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <IconButton
              color="primary"
              size="large"
              disabled={indexNum === totalNum || isDisabled}
              onClick={() => {
                handleChangeAnswer();
                handleNext();
              }}
              sx={{
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: 'lightblue', // Optional: change to a different blue when hovering
                },
                // Set the background to a lighter blue when disabled, if desired
                // '&.Mui-disabled': {
                //   backgroundColor: 'lightblue',
                // },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Stack>
        </Box>
        <Box
          sx={{
            flexDirection: "column",
            alignItems: "center",
            display: showVideo ? "flex" : "none",
          }}
        >
          <Box sx={{ position: "relative" }}>
            <div className="recording-indicator"></div>
            <CardMedia
              component="video"
              src="https://storage.googleapis.com/interviewai-public/Untitled%20design.mp4"
              title="Your Video"
              autoPlay
              loop
              muted
              playsInline
              sx={{
                width: "500px",
                height: "300px",
                borderRadius: "20px",
                display: !videoGender ? "" : "none",
              }}
            />
            <CardMedia
              component="video"
              src="https://storage.googleapis.com/interviewai-public/Untitled%20design-3.mp4"
              title="Your Video"
              autoPlay
              loop
              muted
              playsInline
              sx={{
                width: "500px",
                height: "300px",
                borderRadius: "20px",
                display: videoGender ? "" : "none",
              }}
            />
          </Box>
          <Stack direction="row" alignItems="center">
            <ManIcon color="gray" />
            <Switch
              defaultChecked
              color="secondary"
              value={{}}
              onChange={handleChangeVideoGender}
            />
            <WomanIcon color="secondary" />
          </Stack>
        </Box>
      </Stack >
    </Container >
  );
}
