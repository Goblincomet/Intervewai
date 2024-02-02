
// chrome://flags/#unsafely-treat-insecure-origin-as-secure
import React, { useState, useContext } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Button,
  Stack,
  TextField,
  Container,
  CircularProgress,
} from "@mui/material";
import Section from "@/components/Home/Section";
import VisuallyHiddenInput from "@/components/Home/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import { useRouter } from "next/router";
import AppContext from "@/contexts/AppContext";
import { set } from "nprogress";
//API with Backend
export default function Starter() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeDescription, setResumeDescription] = useState("");
  const { questions, setQuestions } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  const submitResumeJob = async () => {
    setIsLoading(true);
    const response = await fetch("/api/submit_resume", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        resume: resumeDescription,
        jobDescription: jobDescription,
      }),
    });
    console.log("reuest recevied")


    if (!response.ok) {
      // handle error case
      const errorData = await response.json();
      console.error(errorData);
    } else {
      let res = await response.json();
      const questionsArray = res.question
        .trim()
        .split("\n")
        .map((data) => data.trim());

      setQuestions(questionsArray);
    }
    setIsLoading(false);
    router.push("/interview");
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume_recognize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResumeDescription(data.data);
    } catch (error) {
      console.error("Error:", error); // Log the error
    }
  };

  const handleFileChangeResume = (event) => {
    // This will give you File object
    const uploadedFile = event.target.files[0];


    // This will give you the file path
    const filePath = uploadedFile;

    setResumeFile(filePath);
  };

  const Recognize_resume = async (event) => {
    await uploadFile(resumeFile);
  };


  return (
    <React.Fragment>
      {/* <CssBaseline /> */}
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
          <Section
            number={"1"}
            title={"Upload Resume (Optional)"}
            description={
              "By providing a resume, this will tailor your interview more accurately."
            }
            content={
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ width: "200px" }}
              >
                {!resumeFile && <p>Upload file</p>}
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleFileChangeResume}
                />
                {resumeFile && (
                  <p>
                    {resumeFile.name.length > 10
                      ? `${resumeFile.name.substring(0, 10)}...`
                      : resumeFile.name}
                  </p>
                )}
              </Button>
            }
          ></Section>
          <Section
            number={"2"}
            title={"Copy & Paste Job Description (Optional)"}
            description={
              "By providing a job description, this will tailor your interview more accurately."
            }
            content={
              <TextField
                label="Job Description"
                multiline
                rows={4}
                sx={{ width: "95%" }}
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                }}
              />
            }
          ></Section>
          <Section
            number={"3"}
            title={"Click Below to Start Your Interview"}
            description={""}
            content={
              <Button
                variant="contained"
                endIcon={<DoubleArrowIcon />}
                onClick={() => {
                  Recognize_resume();
                  submitResumeJob();

                }}
              >
                Get Started
              </Button>
            }
          ></Section>
        </Stack>
      </Container>
    </React.Fragment>
  );
}
