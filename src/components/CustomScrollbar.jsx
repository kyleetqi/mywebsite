import { useState, useRef, useEffect, useCallback } from 'react';
import './CustomScrollbar.css';

// Import scrollbar assets
import ScrollBarUpIdle from '../assets/Scrollbar/ScrollBarUpIdle.PNG';
import ScrollBarDownIdle from '../assets/Scrollbar/ScrollBarDownIdle.PNG';
import ScrollBarBackground from '../assets/Scrollbar/ScrollBarBackground.PNG';
import ScrollBarTopIdle from '../assets/Scrollbar/ScrollBarTopIdle.PNG';
import ScrollBarBodyIdle from '../assets/Scrollbar/ScrollBarBodyIdle.PNG';
import ScrollBarCenterIdle from '../assets/Scrollbar/ScrollBarCenterIdle.PNG';
import ScrollBarBottomIdle from '../assets/Scrollbar/ScrollBarBottomIdle.PNG';

const SCROLL_SPEED = 20; // pixels per scroll tick
const SCROLL_INTERVAL = 50; // ms between scroll ticks when holding
const PAGE_SCROLL_MULTIPLIER = 5; // page scroll = SCROLL_SPEED * this

function CustomScrollbar({ contentRef }) {
  const [thumbPosition, setThumbPosition] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const dragRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // Button dimensions (matching the asset sizes)
  const BUTTON_SIZE = 17;
  const MIN_THUMB_HEIGHT = 30;

  // Calculate thumb size and position based on content
  const updateScrollbar = useCallback(() => {
    const content = contentRef?.current;
    if (!content) return;

    const { scrollTop, scrollHeight, clientHeight } = content;
    const hasOverflow = scrollHeight > clientHeight;
    
    setCanScroll(hasOverflow);

    if (!hasOverflow) {
      setThumbHeight(0);
      setThumbPosition(0);
      return;
    }

    // Calculate track height (total height minus both buttons)
    const track = trackRef.current;
    if (!track) return;
    
    const availableTrackHeight = track.clientHeight;

    // Calculate thumb height proportionally
    const ratio = clientHeight / scrollHeight;
    const calculatedThumbHeight = Math.max(MIN_THUMB_HEIGHT, availableTrackHeight * ratio);
    setThumbHeight(calculatedThumbHeight);

    // Calculate thumb position
    const maxScroll = scrollHeight - clientHeight;
    const maxThumbPosition = availableTrackHeight - calculatedThumbHeight;
    const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
    setThumbPosition(scrollRatio * maxThumbPosition);
  }, [contentRef]);

  // Update scrollbar when content scrolls, resizes, or content changes
  useEffect(() => {
    const content = contentRef?.current;
    if (!content) return;

    const handleScroll = () => updateScrollbar();
    content.addEventListener('scroll', handleScroll);
    
    // Initial update (with a small delay to ensure content is rendered)
    updateScrollbar();
    const initialTimeout = setTimeout(updateScrollbar, 100);

    // Update on resize of the content container
    const resizeObserver = new ResizeObserver(() => updateScrollbar());
    resizeObserver.observe(content);

    // Also observe content changes (like when text is added)
    const mutationObserver = new MutationObserver(() => updateScrollbar());
    mutationObserver.observe(content, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      content.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearTimeout(initialTimeout);
    };
  }, [contentRef, updateScrollbar]);

  // Scroll content by amount
  const scrollBy = useCallback((amount) => {
    const content = contentRef?.current;
    if (!content || !canScroll) return;
    content.scrollTop += amount;
  }, [contentRef, canScroll]);

  // Start continuous scrolling
  const startContinuousScroll = useCallback((amount) => {
    if (scrollIntervalRef.current) return;
    
    // Scroll immediately
    scrollBy(amount);
    
    // Then continue scrolling at interval
    scrollIntervalRef.current = setInterval(() => {
      scrollBy(amount);
    }, SCROLL_INTERVAL);
  }, [scrollBy]);

  // Stop continuous scrolling
  const stopContinuousScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopContinuousScroll();
  }, [stopContinuousScroll]);

  // Arrow button handlers
  const handleUpMouseDown = (e) => {
    e.preventDefault();
    if (!canScroll) return;
    startContinuousScroll(-SCROLL_SPEED);
  };

  const handleDownMouseDown = (e) => {
    e.preventDefault();
    if (!canScroll) return;
    startContinuousScroll(SCROLL_SPEED);
  };

  const handleButtonMouseUp = () => {
    stopContinuousScroll();
  };

  const handleButtonMouseLeave = () => {
    stopContinuousScroll();
  };

  // Track click handler (page scroll)
  const handleTrackClick = (e) => {
    if (!canScroll) return;
    
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const trackRect = track.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    
    // Determine if click is above or below thumb
    if (clickY < thumbPosition) {
      // Page up
      scrollBy(-SCROLL_SPEED * PAGE_SCROLL_MULTIPLIER);
    } else if (clickY > thumbPosition + thumbHeight) {
      // Page down
      scrollBy(SCROLL_SPEED * PAGE_SCROLL_MULTIPLIER);
    }
  };

  // Thumb drag handlers
  const handleThumbMouseDown = (e) => {
    if (!canScroll) return;
    e.preventDefault();
    e.stopPropagation();

    const thumb = thumbRef.current;
    if (!thumb) return;

    thumb.setPointerCapture(e.pointerId);

    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startThumbPosition: thumbPosition,
    };
  };

  const handleThumbMouseMove = (e) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;

    const content = contentRef?.current;
    const track = trackRef.current;
    if (!content || !track) return;

    const deltaY = e.clientY - drag.startY;
    const availableTrackHeight = track.clientHeight;
    const maxThumbPosition = availableTrackHeight - thumbHeight;
    
    // Calculate new thumb position
    let newThumbPosition = drag.startThumbPosition + deltaY;
    newThumbPosition = Math.max(0, Math.min(newThumbPosition, maxThumbPosition));

    // Convert thumb position to scroll position
    const scrollRatio = newThumbPosition / maxThumbPosition;
    const maxScroll = content.scrollHeight - content.clientHeight;
    content.scrollTop = scrollRatio * maxScroll;
  };

  const handleThumbMouseUp = (e) => {
    const drag = dragRef.current;
    if (!drag || e.pointerId !== drag.pointerId) return;

    const thumb = thumbRef.current;
    if (thumb) {
      thumb.releasePointerCapture(e.pointerId);
    }

    dragRef.current = null;
  };

  return (
    <div className="custom-scrollbar">
      {/* Up Arrow Button */}
      <button
        className={`scrollbar-button scrollbar-up ${!canScroll ? 'disabled' : ''}`}
        onMouseDown={handleUpMouseDown}
        onMouseUp={handleButtonMouseUp}
        onMouseLeave={handleButtonMouseLeave}
        style={{ height: BUTTON_SIZE, width: BUTTON_SIZE }}
      >
        <img src={ScrollBarUpIdle} alt="Scroll Up" draggable={false} />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="scrollbar-track"
        onClick={handleTrackClick}
        style={{ backgroundImage: `url(${ScrollBarBackground})` }}
      >
        {/* Thumb */}
        {canScroll && thumbHeight > 0 && (
          <div
            ref={thumbRef}
            className="scrollbar-thumb"
            style={{
              top: thumbPosition,
              height: thumbHeight,
            }}
            onPointerDown={handleThumbMouseDown}
            onPointerMove={handleThumbMouseMove}
            onPointerUp={handleThumbMouseUp}
            onPointerCancel={handleThumbMouseUp}
          >
            <div 
              className="thumb-top"
              style={{ backgroundImage: `url(${ScrollBarTopIdle})` }}
            />
            <div 
              className="thumb-body"
              style={{ backgroundImage: `url(${ScrollBarBodyIdle})` }}
            >
              <div 
                className="thumb-center"
                style={{ backgroundImage: `url(${ScrollBarCenterIdle})` }}
              />
            </div>
            <div 
              className="thumb-bottom"
              style={{ backgroundImage: `url(${ScrollBarBottomIdle})` }}
            />
          </div>
        )}
      </div>

      {/* Down Arrow Button */}
      <button
        className={`scrollbar-button scrollbar-down ${!canScroll ? 'disabled' : ''}`}
        onMouseDown={handleDownMouseDown}
        onMouseUp={handleButtonMouseUp}
        onMouseLeave={handleButtonMouseLeave}
        style={{ height: BUTTON_SIZE, width: BUTTON_SIZE }}
      >
        <img src={ScrollBarDownIdle} alt="Scroll Down" draggable={false} />
      </button>
    </div>
  );
}

export default CustomScrollbar;

