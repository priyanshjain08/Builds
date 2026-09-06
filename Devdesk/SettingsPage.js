// frontend/src/pages/SettingsPage.js
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
    setSaved(false);
  };

  const handleSave = () => {
    // Save settings to localStorage for now
    localStorage.setItem('devdesk-settings', JSON.stringify(settings));
    setSaved(true);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your application preferences
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.pushNotifications}
                onChange={(e) => handleChange('pushNotifications', e.target.checked)}
              />
            }
            label="Push Notifications"
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <TextField
            select
            fullWidth
            label="Theme"
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System</MenuItem>
          </TextField>
          <TextField
            select
            fullWidth
            label="Language"
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="de">German</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Regional
          </Typography>
          <TextField
            select
            fullWidth
            label="Timezone"
            value={settings.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
          >
            <MenuItem value="UTC">UTC</MenuItem>
            <MenuItem value="America/New_York">Eastern Time</MenuItem>
            <MenuItem value="America/Chicago">Central Time</MenuItem>
            <MenuItem value="America/Denver">Mountain Time</MenuItem>
            <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
            <MenuItem value="Europe/London">London</MenuItem>
            <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        onClick={handleSave}
        sx={{ mt: 3 }}
      >
        Save Settings
      </Button>
    </Box>
  );
}

export default SettingsPage;
