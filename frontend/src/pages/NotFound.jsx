import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import {Link} from 'react-router';

export default function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="md" sx={{display: 'flex'}}>
        <Grid container spacing={2} sx={{display: 'flex', flexDirection: 'column',gap: 2}}>
          
            <Typography variant="h1">
              404
            </Typography>
            <Typography variant="h6">
              The page you&apos;re looking for doesn&apos;t exist.
            </Typography>
            <Link to="/">
            <Button variant="contained" sx={{width: "fit-content"}}>Back Home</Button>
            </Link>
        </Grid>
            <img
              src="https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569__340.jpg"
              alt="Not Found Image"
              loading='lazy'
              width={500} height={250}
            />
      </Container>
    </Box>
  );
}