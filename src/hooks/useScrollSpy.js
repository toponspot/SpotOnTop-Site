import { useEffect, useState } from 'react';

/**
 * Returns the id of the last section whose top has scrolled past `offset`.
 * `ids` must be a stable array (define it at module level).
 */
export function useScrollSpy(ids, offset = 160) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      let current = '';
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids, offset]);

  return activeId;
}
