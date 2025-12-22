
import React, { useEffect } from 'react';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  // Close modal on 'Escape' key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-black rounded-lg shadow-2xl relative w-full max-w-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition-colors z-10"
          aria-label="Close video player"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div style={{ paddingBottom: '56.25%', position: 'relative', height: 0 }}>
           <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;