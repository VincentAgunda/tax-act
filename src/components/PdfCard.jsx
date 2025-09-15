import React, { useState } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Modal, Box } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Style for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '90%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const PdfCard = ({ pdf }) => {
  // State to manage if the modal is open or closed
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = () => setIsPreviewOpen(true);
  const handleClosePreview = () => setIsPreviewOpen(false);

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        {/* CardContent remains the same... */}
        <CardContent>
            {/* ...all your Typography and span elements go here... */}
        </CardContent>

        <CardActions>
          {/* This button now opens the modal */}
          <Button
            size="small"
            endIcon={<OpenInNewIcon />}
            onClick={handleOpenPreview} // Changed from href to onClick
            sx={{
              backgroundColor: '#f5f4f0',
              color: '#333',
              '&:hover': {
                backgroundColor: '#e8e7e3',
              },
            }}
          >
            Show Preview
          </Button>
        </CardActions>
      </Card>

      {/* The Modal component for the preview */}
      <Modal
        open={isPreviewOpen}
        onClose={handleClosePreview}
        aria-labelledby="pdf-preview-title"
      >
        <Box sx={modalStyle}>
          <Typography id="pdf-preview-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            {pdf.title}
          </Typography>
          {/* Embed the PDF using an iframe */}
          <iframe
            src={pdf.file_url}
            title={pdf.title}
            width="100%"
            height="90%"
            style={{ border: 'none' }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default PdfCard;