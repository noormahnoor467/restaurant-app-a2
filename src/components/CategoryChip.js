import React from 'react';
import { Button } from './UI';
export default function CategoryChip({
  title,
  selected,
  onPress,
  disabled = false,
  label,
}) {
  return (
    <Button
      small
      title={title}
      label={label}
      secondary={!selected}
      disabled={disabled}
      onPress={onPress}
    />
  );
}
