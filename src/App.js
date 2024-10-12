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
      .catch((error) => console.error('Error fetching educator details:', error));

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
      {/* Student View */}
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
              onClick={() => alert('Ask AI feature coming soon!')}
            >
              Ask AI
            </Button>
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
