import React from 'react';
import { useItineraryToast } from '../context/ItineraryToastContext';

export interface ItineraryAddButtonProps {
  // Return false from onAdd to indicate that the add was not successful
  // (e.g. user not logged in) so the toast should be suppressed.
  // Return 'duplicate' when the item was already in the itinerary so we can
  // show a different toast message.
  onAdd: () => boolean | 'duplicate' | void;
  label?: string; // e.g. "State added to itinerary"
  alreadyLabel?: string; // e.g. "State already in itinerary"
  size?: 'sm' | 'md';
}

const ItineraryAddButton: React.FC<ItineraryAddButtonProps> = ({
  onAdd,
  label = 'Added to itinerary',
  alreadyLabel = 'Already in itinerary',
  size = 'md',
}) => {
  const { showToast } = useItineraryToast();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Avoid triggering parent card click handlers when adding to itinerary
    event.stopPropagation();
    event.preventDefault();

    const result = onAdd();
    if (result === false) {
      // Add failed (e.g. not logged in) - do not show any toast.
      return;
    }
    if (result === 'duplicate') {
      showToast(alreadyLabel);
      return;
    }
    showToast(label);
  };

  const baseClasses =
    'inline-flex items-center justify-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900/60 rounded-full';
  const dimensionClasses = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClasses} ${dimensionClasses}`}
      aria-label={label}
    >
      {/* Custom itinerary icon from public assets; user can swap the asset while keeping this component */}
      <img
        src="/images/icons/itinerary-add.png"
        alt=""
        className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'}
        aria-hidden="true"
      />
    </button>
  );
};

export default ItineraryAddButton;
