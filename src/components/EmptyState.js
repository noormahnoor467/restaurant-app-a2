import React from 'react';
import { Card, Label, Button } from './UI';
export default function EmptyState({ title, description, action, onPress }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
      <Label large>{title}</Label>
      <Label muted style={{ textAlign: 'center' }}>
        {description}
      </Label>
      {action ? <Button title={action} onPress={onPress} /> : null}
    </Card>
  );
}
