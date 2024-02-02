import {
    Button,
    Stack,
    TextField,
    Container,
    CircularProgress,
    Box,
    Typography,
} from "@mui/material";
export const Ready = ({ startInterview }) => {
    return (
        <Container maxWidth="sm">
            <Stack
                spacing={4}
                sx={{
                    marginTop: "15vh",
                    padding: "20px",
                    borderRadius: "15px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    bgcolor: "#f4f5f7",
                }}
            >
                <video playsinline="" loop id="video" muted="" autoPlay={true} src="/interview.mp4" style={{ borderRadius: '15px' }}></video>
                <Typography fontWeight={"bold"} fontSize={"20pt"} textAlign={"center"}>
                    Answer 10 Questions
                </Typography>
                <Typography fontSize={"18pt"} textAlign={"center"} color={"gray"}>
                    When you're done, review your answers and discover insights.
                </Typography>
                <Button variant="contained" onClick={startInterview} sx={{ height: '60px', fontSize: '20pt' }}>Start</Button>
            </Stack>
        </Container>)
}