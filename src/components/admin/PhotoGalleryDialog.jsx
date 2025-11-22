import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function PhotoGalleryDialog({ photos, title, trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredPhotos = photos.filter(Boolean);
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>
      
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title} - Photo {currentIndex + 1} of {filteredPhotos.length}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <img
            src={filteredPhotos[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            className="w-full rounded-lg"
          />
          
          {filteredPhotos.length > 1 && (
            <>
              <Button
                onClick={handlePrevious}
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                onClick={handleNext}
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {filteredPhotos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        <p className="text-center text-sm text-gray-500">
          Use arrow keys ← → to navigate
        </p>
      </DialogContent>
    </Dialog>
  );
}