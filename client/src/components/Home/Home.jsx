import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Fade,
  Slide,
  Zoom,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PsychologyIcon from "@mui/icons-material/Psychology";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VerifiedIcon from "@mui/icons-material/Verified";
import ScienceIcon from "@mui/icons-material/Science";
import GroupsIcon from "@mui/icons-material/Groups";

const services = [
  {
    icon: <LocalHospitalIcon sx={{ fontSize: 50, color: "#2563eb" }} />,
    title: "Emergency Care",
    description: "24/7 emergency medical services with rapid response and expert care.",
  },
  {
    icon: <FavoriteIcon sx={{ fontSize: 50, color: "#dc2626" }} />,
    title: "Cardiology",
    description: "Advanced heart care with state-of-the-art technology and specialists.",
  },
  {
    icon: <MedicalServicesIcon sx={{ fontSize: 50, color: "#059669" }} />,
    title: "General Surgery",
    description: "Comprehensive surgical care with minimally invasive techniques.",
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 50, color: "#7c3aed" }} />,
    title: "Neurology",
    description: "Expert treatment for brain and nervous system disorders.",
  },
  {
    icon: <VisibilityIcon sx={{ fontSize: 50, color: "#0891b2" }} />,
    title: "Ophthalmology",
    description: "Complete eye care services from routine exams to complex surgeries.",
  },
  {
    icon: <HealthAndSafetyIcon sx={{ fontSize: 50, color: "#ea580c" }} />,
    title: "Pediatrics",
    description: "Specialized healthcare for infants, children, and adolescents.",
  },
];

const features = [
  {
    icon: <AccessTimeIcon sx={{ fontSize: 45, color: "#2563eb" }} />,
    title: "24/7 Emergency",
    description: "Round-the-clock emergency medical services",
  },
  {
    icon: <ScienceIcon sx={{ fontSize: 45, color: "#059669" }} />,
    title: "Advanced Technology",
    description: "State-of-the-art medical equipment",
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 45, color: "#7c3aed" }} />,
    title: "Expert Specialists",
    description: "Highly qualified medical professionals",
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 45, color: "#dc2626" }} />,
    title: "Patient-Centered",
    description: "Compassionate and personalized care",
  },
];

const testimonials = [
  {
    name: "Robert Anderson",
    rating: 5,
    review: "Exceptional care and attention. The staff made me feel comfortable throughout my treatment. Highly recommend this hospital!",
  },
  {
    name: "Lisa Thompson",
    rating: 5,
    review: "The doctors here are incredibly knowledgeable and caring. They took the time to explain everything clearly. Outstanding service!",
  },
  {
    name: "David Kim",
    rating: 5,
    review: "State-of-the-art facilities and wonderful staff. My family received excellent care during a difficult time. Thank you!",
  },
];

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        fontFamily: "'Poppins', 'Inter', sans-serif",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          pb: { xs: 4, md: 8 },
        }}
      >
        {/* Background Decorative Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-10%",
            left: "-5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={isVisible} timeout={1000}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "2.5rem", md: "4rem" },
                      lineHeight: 1.2,
                      mb: 3,
                      color: "#0f172a",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Your Health,
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Our Priority
                    </Box>
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 400,
                      color: "#64748b",
                      mb: 5,
                      lineHeight: 1.8,
                      fontSize: { xs: "1rem", md: "1.25rem" },
                      maxWidth: 550,
                    }}
                  >
                    We provide world-class medical care with compassion and cutting-edge technology. Your well-being is at the heart of everything we do.
                  </Typography>

                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        borderRadius: "50px",
                        px: 4,
                        py: 1.8,
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "1.1rem",
                        "&:hover": {
                          background: "linear-gradient(135deg, #059669, #047857)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 15px 40px rgba(16, 185, 129, 0.4)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Book Appointment
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderRadius: "50px",
                        px: 4,
                        py: 1.8,
                        borderColor: "#10b981",
                        color: "#059669",
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "1.1rem",
                        borderWidth: "2px",
                        "&:hover": {
                          borderColor: "#059669",
                          background: "rgba(16, 185, 129, 0.05)",
                          borderWidth: "2px",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Find a Doctor
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6}>
              <Slide direction="left" in={isVisible} timeout={1000}>
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* Decorative Background Shape */}
                  <Box
                    sx={{
                      position: "absolute",
                      width: "90%",
                      height: "90%",
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
                      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                      animation: "morphShape 8s ease-in-out infinite",
                      zIndex: 0,
                    }}
                  />
                  
                  {/* Blue Accent Circle */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "-5%",
                      right: "-5%",
                      width: "120px",
                      height: "120px",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      borderRadius: "50%",
                      opacity: 0.2,
                      zIndex: 0,
                    }}
                  />
                  
                  {/* Purple Accent Circle */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "-5%",
                      left: "-5%",
                      width: "100px",
                      height: "100px",
                      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      borderRadius: "50%",
                      opacity: 0.2,
                      zIndex: 0,
                    }}
                  />
                  
                  {/* Main Image Container with Creative Shape */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 550,
                      zIndex: 1,
                    }}
                  >
                    <Box
                      component="img"
                      src="/12.png"
                      alt="Hospital Care"
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                        boxShadow: "0 25px 70px rgba(59, 130, 246, 0.2), 0 10px 30px rgba(139, 92, 246, 0.15)",
                        border: "8px solid #ffffff",
                        animation: "floatImage 6s ease-in-out infinite",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    
                    {/* Medical Plus Icon Decoration */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "10%",
                        left: "-8%",
                        width: "60px",
                        height: "60px",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                        animation: "float 3s ease-in-out infinite",
                      }}
                    >
                      <LocalHospitalIcon sx={{ fontSize: 35, color: "#ffffff" }} />
                    </Box>
                    
                    {/* Heart Icon Decoration */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: "15%",
                        right: "-8%",
                        width: "70px",
                        height: "70px",
                        background: "linear-gradient(135deg, #ec4899, #db2777)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 10px 30px rgba(236, 72, 153, 0.4)",
                        animation: "float 3s ease-in-out infinite 1s",
                      }}
                    >
                      <FavoriteIcon sx={{ fontSize: 35, color: "#ffffff" }} />
                    </Box>
                  </Box>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, overflow: "hidden" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: "#3b82f6",
                fontWeight: 700,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                letterSpacing: "0.15em",
                display: "block",
                mb: 1,
              }}
            >
              OUR SERVICES
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                mt: 2,
                mb: 2,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.2,
              }}
            >
              Comprehensive Medical Care
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.8,
                maxWidth: 700,
                mx: "auto",
                px: { xs: 2, md: 0 },
              }}
            >
              We offer a wide range of specialized medical services with experienced professionals and modern facilities.
            </Typography>
          </Box>
        </Container>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            px: { xs: 2, md: 4 },
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f5f9",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "10px",
              "&:hover": {
                background: "#94a3b8",
              },
            },
          }}
        >
          {services.map((service, index) => (
            <Fade in={isVisible} timeout={800} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                  minWidth: { xs: 280, sm: 320, md: 350 },
                  p: 4,
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(59, 130, 246, 0.15)",
                    borderColor: "#3b82f6",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                    mb: 3,
                  }}
                >
                  {service.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#0f172a",
                    mb: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    lineHeight: 1.7,
                    fontSize: "0.95rem",
                  }}
                >
                  {service.description}
                </Typography>
              </Card>
            </Fade>
          ))}
        </Box>
      </Box>

      {/* Why Choose Us Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", overflow: "hidden" }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: "#8b5cf6",
                fontWeight: 700,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                letterSpacing: "0.15em",
                display: "block",
                mb: 1,
              }}
            >
              WHY CHOOSE US
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                mt: 2,
                mb: 2,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.2,
              }}
            >
              Excellence in Healthcare
            </Typography>
          </Box>
        </Container>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            px: { xs: 2, md: 4 },
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#e2e8f0",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "10px",
              "&:hover": {
                background: "#94a3b8",
              },
            },
          }}
        >
          {features.map((feature, index) => (
            <Fade in={isVisible} timeout={800} key={index} style={{ transitionDelay: `${index * 100}ms` }}>
              <Box
                sx={{
                  minWidth: { xs: 240, sm: 280, md: 300 },
                  textAlign: "center",
                  p: 4,
                  borderRadius: "20px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(139, 92, 246, 0.15)",
                    borderColor: "#8b5cf6",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #faf5ff, #f3e8ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#0f172a",
                    mb: 1.5,
                    fontSize: "1.1rem",
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    lineHeight: 1.7,
                    fontSize: "0.95rem",
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Fade>
          ))}
        </Box>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)", py: { xs: 8, md: 10 }, position: "relative", overflow: "hidden" }}>
        {/* Background Decorative Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "-5%",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: "#ec4899",
                fontWeight: 700,
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                letterSpacing: "0.15em",
                display: "inline-block",
                mb: 1,
                px: 3,
                py: 1,
                background: "rgba(236, 72, 153, 0.1)",
                borderRadius: "50px",
              }}
            >
              PATIENT TESTIMONIALS
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                mt: 2,
                mb: 2,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.2,
              }}
            >
              What Our Patients Say
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                fontSize: { xs: "1rem", md: "1.1rem" },
                maxWidth: 600,
                mx: "auto",
              }}
            >
              Real stories from real patients who experienced exceptional care
            </Typography>
          </Box>

          <Box sx={{ position: "relative", minHeight: { xs: 320, md: 280 } }}>
            {testimonials.map((testimonial, index) => (
              <Fade
                key={index}
                in={currentTestimonial === index}
                timeout={800}
                style={{
                  position: currentTestimonial === index ? "relative" : "absolute",
                  width: "100%",
                  display: currentTestimonial === index ? "block" : "none",
                }}
              >
                <Card
                  sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: "30px",
                    background: "linear-gradient(135deg, #ffffff 0%, #fefefe 100%)",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
                    border: "none",
                    position: "relative",
                    overflow: "visible",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 25px 70px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  {/* Quote Icon */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      left: 30,
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ec4899, #db2777)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 10px 30px rgba(236, 72, 153, 0.3)",
                    }}
                  >
                    <Typography sx={{ fontSize: "2rem", color: "#ffffff", fontWeight: 700 }}>"</Typography>
                  </Box>
                  
                  <Rating 
                    value={testimonial.rating} 
                    readOnly 
                    sx={{ 
                      mb: 3,
                      "& .MuiRating-iconFilled": {
                        color: "#fbbf24",
                      },
                      fontSize: { xs: "1.5rem", md: "1.8rem" },
                    }} 
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#475569",
                      fontSize: { xs: "1rem", md: "1.15rem" },
                      lineHeight: 1.9,
                      fontStyle: "italic",
                      mb: 4,
                      fontWeight: 400,
                    }}
                  >
                    "{testimonial.review}"
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          mb: 0.5,
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        Verified Patient
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Fade>
            ))}
          </Box>

          {/* Testimonial Dots */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 5 }}>
            {testimonials.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                sx={{
                  width: currentTestimonial === index ? 40 : 12,
                  height: 12,
                  borderRadius: "6px",
                  background: currentTestimonial === index 
                    ? "linear-gradient(135deg, #ec4899, #db2777)" 
                    : "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: currentTestimonial === index 
                    ? "0 4px 12px rgba(236, 72, 153, 0.4)" 
                    : "none",
                  "&:hover": {
                    background: currentTestimonial === index 
                      ? "linear-gradient(135deg, #ec4899, #db2777)" 
                      : "#94a3b8",
                  },
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes floatImage {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            borderRadius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          }
          50% { 
            transform: translateY(-15px) rotate(1deg);
            borderRadius: 40% 60% 60% 40% / 40% 40% 60% 60%;
          }
        }
        
        @keyframes morphShape {
          0%, 100% {
            borderRadius: 50% 50% 50% 50% / 60% 60% 40% 40%;
            transform: scale(1) rotate(0deg);
          }
          25% {
            borderRadius: 60% 40% 50% 50% / 50% 60% 40% 50%;
            transform: scale(1.05) rotate(5deg);
          }
          50% {
            borderRadius: 50% 50% 40% 60% / 40% 50% 60% 50%;
            transform: scale(1) rotate(-5deg);
          }
          75% {
            borderRadius: 40% 60% 60% 40% / 50% 40% 50% 60%;
            transform: scale(1.05) rotate(3deg);
          }
        }
        
        html {
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #059669, #047857);
        }
      `}</style>
    </Box>
  );
};

export default Home;
