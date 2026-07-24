import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component that resets the scroll position to the top
 * of the page whenever the route pathname changes.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });
  }, [pathname]);

  return null;
}
