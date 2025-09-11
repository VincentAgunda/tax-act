import React from 'react';
import { Card, CardContent, CardActions, Typography, Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const PdfCard = ({ pdf }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardContent className="flex-grow">
        <div className="flex items-center mb-3">
          <PictureAsPdfIcon className="text-red-600 mr-2" />
          <Typography variant="h6" className="font-semibold line-clamp-2">
            {pdf.title}
          </Typography>
        </div>
        <Typography variant="body2" color="textSecondary" className="mb-3 line-clamp-3">
          {pdf.description}
        </Typography>
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="bg-gray-100 text-xs px-2 py-1 rounded">
            {pdf.category}
          </span>
          <span className="bg-gray-100 text-xs px-2 py-1 rounded">
            v{pdf.version}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${
            pdf.status === 'Active' ? 'bg-green-100 text-green-800' :
            pdf.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {pdf.status}
          </span>
        </div>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          endIcon={<OpenInNewIcon />}
          href={pdf.file_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View PDF
        </Button>
      </CardActions>
    </Card>
  );
};

export default PdfCard;