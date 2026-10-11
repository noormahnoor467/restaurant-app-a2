import React from 'react';
import { Row, Label } from './UI';
import { ORDER_STATES } from '../utils/domain';
import { useTheme } from '../context/ThemeContext';
export default function OrderStatusStep({ status }) {
  const { colors } = useTheme();
  if (status === 'Cancelled')
    return <Label style={{ color: colors.danger }}>Cancelled</Label>;
  return (
    <Row>
      {ORDER_STATES.map((step, index) => (
        <Label
          key={step}
          style={{
            fontSize: 12,
            color:
              index <= ORDER_STATES.indexOf(status)
                ? colors.primary
                : colors.muted,
            fontWeight: status === step ? '800' : '400',
          }}
        >
          {index <= ORDER_STATES.indexOf(status) ? '●' : '○'} {step}
        </Label>
      ))}
    </Row>
  );
}
