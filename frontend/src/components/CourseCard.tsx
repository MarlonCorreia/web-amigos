

import { Link as RouterLink } from "react-router-dom";
import React from 'react';
import { Card, Box, CardMedia, CardContent, Typography, Button } from '@mui/material';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
 

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    category: string;
    price: string;
    description: string;
    rating: number;
    students: string;
    author: string;
    image: string;
}
    
}



export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid #e5e7eb',
        boxShadow: 'none',
        borderRadius: 3,
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }
      }}
    >
 
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={course.image}
          alt={course.title}
          sx={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: '#10b981',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            px: 1.5,
            py: 0.5,
            borderRadius: 20,
          }}
        >
          {course.price}
        </Box>
      </Box>

     
      <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}
        >
          {course.category}
        </Typography>

        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            lineHeight: 1.2, 
            minHeight: '48px', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}
        >
          {course.title}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            minHeight: '36px', 
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}
        >
          {course.description}
        </Typography>

       
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarRateRoundedIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {course.rating}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                    {course.students} students
                </Typography>
            </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          by {course.author}
        </Typography>

       
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          component={RouterLink}
          to={`/courseDetails/${course.id}`}
          sx={{ 
            mt: 'auto', 
            py: 1.2, 
            textTransform: 'none', 
            fontWeight: 'bold',
            borderRadius: 2,
          }}
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
};