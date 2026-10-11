import React from 'react';
import { Card, Row, Label, styles } from './UI';
import { money } from '../constants/brand';
export default function Bill({ bill }) {
  return (
    <Card>
      {[
        ['Subtotal', bill.subtotal],
        ['Discount', -bill.discount],
        ['Tax (5%)', bill.tax],
        ['Service (2%)', bill.service],
        ['Total', bill.total],
      ].map(([label, value]) => (
        <Row key={label} style={styles.between}>
          <Label style={label === 'Total' ? styles.bold : null}>{label}</Label>
          <Label style={label === 'Total' ? styles.bold : null}>
            {money(value)}
          </Label>
        </Row>
      ))}
    </Card>
  );
}
