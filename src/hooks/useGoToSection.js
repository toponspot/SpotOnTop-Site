import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { pathForSection } from '../utils/scroll';

/**
 * Returns goToSection(id), for buttons and other code that is not a <Link>.
 * goToSection('pricing') navigates to /pricing; goToSection() or goToSection('') goes to "/".
 * The returned function never changes identity, so it is safe in useCallback/useEffect deps.
 */
export function useGoToSection() {
    const navigate = useNavigate();
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    return useCallback((id = '') => {
        const path = id ? pathForSection(id) : '/';
        // Re-visiting the current URL replaces the entry instead of stacking duplicates.
        navigateRef.current(path, { replace: window.location.pathname === path });
    }, []);
}