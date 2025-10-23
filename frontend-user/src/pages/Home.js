// src/pages/Home.js
import React, { useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Link,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Check as CheckIcon,
  Phone as PhoneIcon,
  Paid as PaidIcon,
  Security as SecurityIcon,
  Headphones as HeadphonesIcon,
  Language as LanguageIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  X as XIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Section refs for smooth scroll
  const howItWorksRef = useRef(null);
  const aboutRef = useRef(null);
  const tasksRef = useRef(null);
  const whyRef = useRef(null);
  const testimonialsRef = useRef(null);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          zIndex: 1000,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  backgroundColor: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
                Kenya Earn
              </Typography>
            </Box>

            {/* Nav Links (Desktop) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              {[
                { label: 'How It Works', ref: howItWorksRef },
                { label: 'About', ref: aboutRef },
                { label: 'Tasks', ref: tasksRef },
                { label: 'Why Us', ref: whyRef },
              ].map((item) => (
                <Link
                  key={item.label}
                  onClick={() => scrollToSection(item.ref)}
                  underline="none"
                  sx={{
                    fontWeight: 'medium',
                    color: '#1e3a8a',
                    cursor: 'pointer',
                    '&:hover': { color: '#2563eb' },
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                onClick={handleGetStarted}
                underline="none"
                sx={{
                  fontWeight: 'bold',
                  color: '#10b981',
                  cursor: 'pointer',
                  '&:hover': { color: '#0da271' },
                }}
              >
                Login / Sign Up
              </Link>
            </Box>

            {/* CTA Button (Mobile) */}
            <Button
              variant="contained"
              onClick={handleGetStarted}
              sx={{
                display: { xs: 'block', md: 'none' },
                backgroundColor: '#10b981',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                '&:hover': {
                  backgroundColor: '#0da271',
                },
              }}
            >
              Get Started
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 8, md: 12 },
          backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '0 0 50% 50% / 0 0 100% 100%',
          }}
        />
        <Container sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Earn Smart. Work Simple. Build Your Online Income.
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: 700, mx: 'auto', opacity: 0.9 }}>
            Kenya’s trusted task-earning platform connecting real people with real opportunities.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                backgroundColor: '#10b981',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': { backgroundColor: '#0da271' },
              }}
            >
              Start Earning
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleGetStarted}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How It Works */}
      <Box ref={howItWorksRef} sx={{ backgroundColor: '#f3f4f6', py: 8 }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 2 }}>
            How It Works — Simple as 1, 2, 3
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Start earning in minutes with our straightforward process.
          </Typography>

          <Grid container spacing={4}>
            {[
              { icon: <CheckIcon sx={{ fontSize: 40, color: '#2563eb' }} />, title: 'Create Account', desc: 'Sign up easily with Google or email in seconds.' },
              { icon: <PhoneIcon sx={{ fontSize: 40, color: '#10b981' }} />, title: 'Activate Account', desc: 'Pay a one-time Ksh 300 via M-Pesa to unlock tasks.' },
              { icon: <PaidIcon sx={{ fontSize: 40, color: '#f59e0b' }} />, title: 'Start Earning', desc: 'Complete tasks and get paid directly to your wallet.' },
            ].map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(-8px)' },
                    p: 3,
                    textAlign: 'center',
                  }}
                >
                  {step.icon}
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* About */}
      <Box ref={aboutRef} sx={{ py: 8 }}>
        <Container>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Kenyan freelancer"
                sx={{
                  width: '100%',
                  borderRadius: 3,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                About the Platform
              </Typography>
              <Typography variant="body1" paragraph>
                This platform was created to help everyday Kenyans earn honestly and flexibly by completing simple online tasks. No complicated systems, no false promises — just transparent work and fair pay.
              </Typography>
              <Button
                variant="text"
                onClick={handleGetStarted}
                sx={{ textTransform: 'none', color: '#2563eb', fontWeight: 'bold' }}
              >
                Read More About Us →
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Tasks */}
      <Box ref={tasksRef} sx={{ backgroundColor: '#f9fafb', py: 8 }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 2 }}>
            Popular Task Categories
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Explore opportunities that match your skills and interests.
          </Typography>

          <Grid container spacing={4}>
            {[
              { icon: '❤️', title: 'Social Media Engagement', desc: 'Like, share, or comment on posts.' },
              { icon: '📋', title: 'Surveys and Feedback', desc: 'Share your opinion on products.' },
              { icon: '💬', title: 'App Reviews', desc: 'Test and review mobile apps.' },
              { icon: '🛍️', title: 'Product Promotions', desc: 'Promote local businesses online.' },
            ].map((task, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    transition: 'border-color 0.3s',
                    '&:hover': { borderColor: '#2563eb', borderWidth: 2 },
                    border: '1px solid #e5e7eb',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {task.icon}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Box ref={whyRef} sx={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)', py: 8 }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 2 }}>
            Why Thousands Choose Us
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Trusted by Kenyans nationwide for honest, flexible earning.
          </Typography>

          <Grid container spacing={4}>
            {[
              { icon: <PhoneIcon />, title: 'Fast Payments', desc: 'Get paid instantly via M-Pesa.' },
              { icon: <SecurityIcon />, title: 'Trusted Platform', desc: 'Secure, verified, and reliable.' },
              { icon: <HeadphonesIcon />, title: 'Active Support', desc: 'Help when you need it.' },
              { icon: <LanguageIcon />, title: 'Accessible Anywhere', desc: 'Work from any location.' },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: '#2563eb',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box ref={testimonialsRef} sx={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', py: 8 }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 2, color: '#1e3a8a' }}>
            What Our Users Say
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Real stories from real Kenyans.
          </Typography>

          <Grid container spacing={4}>
            {[
              { name: 'Jane M.', location: 'Nairobi', quote: 'I started small, but within a month, I was earning consistently.' },
              { name: 'David K.', location: 'Mombasa', quote: 'Flexible tasks that fit my schedule. Payments are always on time!' },
              { name: 'Grace O.', location: 'Kisumu', quote: 'Finally, a platform that values honest work. Highly recommended!' },
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }} />
                    <Box>
                      <Typography fontWeight="bold">{testimonial.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" fontStyle="italic" color="text.secondary">
                    “{testimonial.quote}”
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          py: 8,
          mt: 8,
          borderRadius: '0 0 50px 50px',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Container>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Join thousands of Kenyans earning online today!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              backgroundColor: 'white',
              color: '#0284c7',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#f0f9ff',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 20px rgba(255,255,255,0.3)',
              },
            }}
          >
            Create Your Account Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: '#0f172a',
          color: 'white',
          py: 6,
          mt: 'auto',
        }}
      >
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    backgroundColor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  Kenya Earn
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Empowering Kenyans through digital opportunity.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'white' }}>
                Quick Links
              </Typography>
              {[
                { label: 'How It Works', ref: howItWorksRef },
                { label: 'About', ref: aboutRef },
                { label: 'Tasks', ref: tasksRef },
                { label: 'Why Us', ref: whyRef },
              ].map((link) => (
                <Typography
                  key={link.label}
                  variant="body2"
                  onClick={() => scrollToSection(link.ref)}
                  sx={{
                    mb: 1,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'white' },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
              <Typography
                variant="body2"
                onClick={handleGetStarted}
                sx={{
                  mb: 1,
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { color: 'white' },
                }}
              >
                Login / Sign Up
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'white' }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[
                  { icon: <FacebookIcon />, color: '#1877f2' },
                  { icon: <InstagramIcon />, color: '#e1306c' },
                  { icon: <XIcon />, color: '#000000' },
                  { icon: <LinkedInIcon />, color: '#0a66c2' },
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        backgroundColor: social.color,
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: '#334155', my: 3 }} />
          <Typography variant="body2" align="center" color="text.secondary">
            © 2025 Kenya Earn. All Rights Reserved. Built with ❤️ in Kenya.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}