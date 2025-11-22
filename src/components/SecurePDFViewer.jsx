import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { API_ENDPOINTS } from '../config/api';

// Set up PDF.js worker - use local worker file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

const SecurePDFViewer = ({ token }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Load PDF
  useEffect(() => {
    if (!token) return;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch PDF with token
        const response = await fetch(`${API_ENDPOINTS.BOOK_PREVIEW_PDF}?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }

        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNum(1);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF. Please try again.');
        setLoading(false);
      }
    };

    loadPDF();
  }, [token]);

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        // Cancel any pending render operation
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Store the render task so we can cancel it if needed
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err) {
        // Ignore cancellation errors
        if (err.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
        }
        renderTaskRef.current = null;
      }
    };

    renderPage();

    // Cleanup: cancel render on unmount or when dependencies change
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNum]);

  // Disable right-click and text selection
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
      container.addEventListener('selectstart', handleSelectStart);
      container.addEventListener('dragstart', handleDragStart);

      // Disable keyboard shortcuts
      const handleKeyDown = (e) => {
        // Disable Ctrl+S, Ctrl+P, F12, etc.
        if (
          (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) ||
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I')
        ) {
          e.preventDefault();
          return false;
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        container.removeEventListener('contextmenu', handleContextMenu);
        container.removeEventListener('selectstart', handleSelectStart);
        container.removeEventListener('dragstart', handleDragStart);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  const goToPrevPage = () => {
    setPageNum((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNum((prev) => Math.min(numPages, prev + 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[650px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[650px]">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!pdfDoc) {
    return (
      <div className="flex items-center justify-center h-full min-h-[650px]">
        <div className="text-center text-gray-600">
          <p>No preview available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col relative"
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        minHeight: 0, // Important for flex children
      }}
    >
      {/* Page Navigation */}
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-200 z-10 flex-shrink-0">
        <button
          onClick={goToPrevPage}
          disabled={pageNum <= 1}
          className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="text-gray-700 font-semibold">
          Page {pageNum} of {numPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={pageNum >= numPages}
          className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      {/* Canvas Container - takes remaining space and scrolls */}
      <div 
        className="flex-1 overflow-auto bg-gray-50 p-4"
        style={{
          minHeight: 0, // Important for flex children to allow scrolling
        }}
      >
        <div className="flex items-start justify-center min-h-full">
          <div className="shadow-lg relative inline-block my-4">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto block"
              style={{
                display: 'block',
                pointerEvents: 'none', // Prevent interaction with canvas
              }}
            />
            {/* Watermark overlay on canvas */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              style={{
                opacity: 0.1,
                zIndex: 1,
              }}
            >
              <div className="text-3xl md:text-5xl font-bold text-navy transform -rotate-45 whitespace-nowrap">
                PREVIEW ONLY
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurePDFViewer;

