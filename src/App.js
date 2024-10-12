import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Card, Typography, Grid, Button, TextField, List, ListItem, ListItemText, Avatar, IconButton,
  Radio, RadioGroup, FormControl, FormControlLabel, FormLabel
} from '@mui/material';
import { AccessTime, School, Update, QuestionAnswer, CalendarToday } from '@mui/icons-material';
import { signIn, signOut, signUp } from './firebase/authService'; // Correct import
import { auth } from './firebase/firebaseConfig'; // Import Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [educator, setEducator] = useState({
    name: '',
    email: '',
    availableSlots: '',
  });
  const [sessions, setSessions] = useState([]);
  const [availability, setAvailability] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // New state for toggling signup/login
  const [userRole, setUserRole] = useState(''); // New state for handling role (student/educator)
  const [showAskAIInput, setShowAskAIInput] = useState(false); // New state for showing the input box
const [aiQuestion, setAiQuestion] = useState(''); // State to store the question
const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        if (userRole === 'educator') {
          fetchEducatorData();
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, [userRole]); // Add userRole as dependency to fetch correct data

  const fetchEducatorData = () => {
    axios.get('/api/educator/1')
      .then((response) => {
        setEducator(response.data);
      })
      .catch((error) => console.error('Error fetching  educator details:', error));

    axios.get('/api/educator/1/sessions')
      .then((response) => {
        setSessions(response.data);
      })
      .catch((error) => console.error('Error fetching sessions:', error));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      setError('');
    } catch (error) {
      setError('Failed to log in');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      setError('');
      setIsSignup(false); // Switch back to login after successful signup
    } catch (error) {
      setError(error.message || 'Failed to sign up');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
  };

  const handleAvailabilitySubmit = (e) => {
    e.preventDefault();
    axios.post('/api/educator/1/availability', { availableSlots: availability })
      .then(() => {
        alert('Availability updated!');
        setEducator((prev) => ({ ...prev, availableSlots: availability }));
      })
      .catch((error) => console.error('Error updating availability:', error));
  };
  const handleAskAI = async () => {
    try {
      const apiUrl = 'https://eu-de.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29';

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJraWQiOiIyMDI0MTAwMjA4NDIiLCJhbGciOiJSUzI1NiJ9.eyJpYW1faWQiOiJJQk1pZC02OTMwMDBLUzNVIiwiaWQiOiJJQk1pZC02OTMwMDBLUzNVIiwicmVhbG1pZCI6IklCTWlkIiwianRpIjoiZDM5YjEzOGEtODA4My00ZmFjLTk0Y2EtYWI3Yzg1NzYzYzgxIiwiaWRlbnRpZmllciI6IjY5MzAwMEtTM1UiLCJnaXZlbl9uYW1lIjoiU291bXlhaml0IiwiZmFtaWx5X25hbWUiOiJEYXduIiwibmFtZSI6IlNvdW15YWppdCBEYXduIiwiZW1haWwiOiJwc2x1OTQxQGdtYWlsLmNvbSIsInN1YiI6InBzbHU5NDFAZ21haWwuY29tIiwiYXV0aG4iOnsic3ViIjoicHNsdTk0MUBnbWFpbC5jb20iLCJpYW1faWQiOiJJQk1pZC02OTMwMDBLUzNVIiwibmFtZSI6IlNvdW15YWppdCBEYXduIiwiZ2l2ZW5fbmFtZSI6IlNvdW15YWppdCIsImZhbWlseV9uYW1lIjoiRGF3biIsImVtYWlsIjoicHNsdTk0MUBnbWFpbC5jb20ifSwiYWNjb3VudCI6eyJ2YWxpZCI6dHJ1ZSwiYnNzIjoiMDRjMzJiYjM5YjAwNDA2YjhjYTZlNTdjMDgxYTQ4MzYiLCJmcm96ZW4iOnRydWV9LCJpYXQiOjE3Mjg3NjcwMTYsImV4cCI6MTcyODc3MDYxNiwiaXNzIjoiaHR0cHM6Ly9pYW0uY2xvdWQuaWJtLmNvbS9pZGVudGl0eSIsImdyYW50X3R5cGUiOiJ1cm46aWJtOnBhcmFtczpvYXV0aDpncmFudC10eXBlOmFwaWtleSIsInNjb3BlIjoiaWJtIG9wZW5pZCIsImNsaWVudF9pZCI6ImJ4IiwiYWNyIjoxLCJhbXIiOlsicHdkIl19.WtPV8WAfKHjkbmn1HZzoXb1aIhydYgfcr4PyC_Oz0b-DKwStaxqhZZxAJjwoPt9xLFjl8ZvHP3lTO_sCGQgtqcCP8ToXpbQCRL72HDT_5u3uVPV3pPj0cDiTmIXMSeBl58bjJtqmVWy1YuLUFMJnYih4KxKSbGR0BrbDe6uPy2jEVz0aRvKgsgkNxQKfyGipbMtNYXUpat83QD5MjBF_EBpEvuBsFV11QVnbYHFfv0WRTL5IBqijVFFFSovWEdjcOm7rsTor7NV6bYgeBk_eE7uQik_ZvMlmPmJfAIEpniNnisKFBsg-Hjfqbd4nQF04Fpug2G3c3SE2Bm4NUdeMBg', // Replace with your actual API key
      };

      const body = {
        input: `<|begin_of_text|>${aiQuestion}<|eot_id|>`, // User's question from the TextField
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 100,
          min_new_tokens: 0,
          stop_sequences: [],
          repetition_penalty: 1
        },
        model_id: "meta-llama/llama-3-1-70b-instruct",
        project_id: "fbb322c9-6145-4d91-a313-0a7c5d3037e2"
      };

      const response = await axios.post(apiUrl, body, { headers });
      alert('Your question has been sent to AI! Response: ' + JSON.stringify(response.data));
      let generatedText = response.data.results[0].generated_text;

      // Clean up the response by removing unwanted tokens and prefixes
      const cleanedText = generatedText
        .replace(/<\|.*?\|>/g, '') // Remove all <|...|> tokens
        .replace(/AI Response:|assistant|^\s*\*\*|\*\*\s*$/gi, '') // Remove "AI Response:", "assistant", and "**" markers
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
        .trim(); // Trim any leading or trailing whitespace
  
      setAiResponse(cleanedText);
      setAiQuestion(''); // Clear the input after sending
    } catch (error) {
      console.error('Error sending question to AI:', error);
      alert('Failed to send your question. Please try again.');
    }
  };
  

// Rest of your App component


  const renderEducatorDashboard = () => (
    <>
      {/* Educator Info */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <Avatar sx={{ bgcolor: '#3f51b5', width: 64, height: 64 }}>
              <School sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs={12} sm={10}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Welcome, {educator.name}
            </Typography>
            <Typography variant="body1" sx={{ color: 'gray' }}>
              Email: {educator.email}
            </Typography>
            <Typography variant="body1" sx={{ color: '#3f51b5', mt: 1 }}>
              Current Availability: {educator.availableSlots} hours/week
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Update Availability Form */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Update Your Availability
        </Typography>
        <form onSubmit={handleAvailabilitySubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <TextField
                fullWidth
                type="number"
                label="Available Hours"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g., 10"
                required
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                startIcon={<Update />}
                sx={{ height: '100%', borderRadius: 2 }}
              >
                Update
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Scheduled Sessions */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Your Scheduled Sessions
        </Typography>
        {sessions.length > 0 ? (
          <List>
            {sessions.map((session) => (
              <ListItem
                key={session.id}
                sx={{
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                  mb: 2,
                  p: 2,
                  boxShadow: 1,
                }}
              >
                <Grid container alignItems="center">
                  <Grid item xs={2}>
                    <IconButton size="large" disabled>
                      <AccessTime sx={{ fontSize: 30, color: '#3f51b5' }} />
                    </IconButton>
                  </Grid>
                  <Grid item xs={10}>
                    <ListItemText
                      primary={`Session with ${session.studentName}`}
                      secondary={`Date: ${new Date(session.date).toLocaleString()} | Topic: ${session.topic}`}
                    />
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" sx={{ color: 'gray' }}>
            No sessions scheduled.
          </Typography>
        )}
      </Card>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        sx={{ mt: 3, width: '100%' }}
      >
        Logout
      </Button>
    </>
  );

  const renderStudentView = () => (
    <>
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Welcome, Student!
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              startIcon={<QuestionAnswer />}
              onClick={() => setShowAskAIInput(!showAskAIInput)} // Toggle input visibility
            >
              Ask AI
            </Button>
            {showAskAIInput && (
              <>
                <TextField
                  fullWidth
                  label="Type your question"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  sx={{ mt: 2 }}
                  multiline
                  rows={4}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                  onClick={handleAskAI} // Function to handle API call
                >
                  Send Question
                </Button>
                
                {/* Display AI response next to the textbox */}
                {aiResponse && (
                  <Typography sx={{ mt: 2, color: 'green' }}>
                     {aiResponse}
                  </Typography>
                )}
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              color="secondary"
              startIcon={<CalendarToday />}
              onClick={() => alert('Schedule meeting feature coming soon!')}
            >
              Schedule a Meet
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        sx={{ mt: 3, width: '100%' }}
      >
        Logout
      </Button>
    </>
  );
  

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      {!isAuthenticated ? (
        <>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              {isSignup ? 'Sign Up' : 'Log In'}
            </Typography>

            <form onSubmit={isSignup ? handleSignup : handleLogin}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2, borderRadius: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 2, borderRadius: 2 }}
              />

              {/* Role Selection */}
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <FormLabel component="legend">Select Role</FormLabel>
                <RadioGroup
                  row
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <FormControlLabel value="educator" control={<Radio />} label="Educator" />
                  <FormControlLabel value="student" control={<Radio />} label="Student" />
                </RadioGroup>
              </FormControl>

              {error && (
                <Typography variant="body2" sx={{ color: 'red', mb: 2 }}>
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {isSignup ? 'Sign Up' : 'Log In'}
              </Button>
            </form>

            <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
              {isSignup ? (
                <span>
                  Already have an account?{' '}
                  <Button onClick={() => setIsSignup(false)}>Log In</Button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <Button onClick={() => setIsSignup(true)}>Sign Up</Button>
                </span>
              )}
            </Typography>
          </Card>
        </>
      ) : (
        <>
          {userRole === 'educator' ? renderEducatorDashboard() : renderStudentView()}
        </>
      )}
    </Container>
  );
};

export default App;
