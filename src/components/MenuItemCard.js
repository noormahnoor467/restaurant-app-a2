import React, { memo } from 'react';
import { Image } from 'react-native';
import { Card, Label, Button, Row, styles } from './UI';
import { money } from '../constants/brand';
import { useTheme } from '../context/ThemeContext';
function MenuItemCard({ item, favourite, onFavourite, onAdd, onDetails }) {
  const { colors } = useTheme();
  return (
    <Card
      style={{
        flex: 1,
        margin: 6,
        minWidth: 0,
        opacity: item.isAvailable ? 1 : 0.7,
      }}
    >
      <Row style={styles.between}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: 64, height: 64, borderRadius: 10 }}
          />
        ) : (
          <Label style={{ fontSize: 36, lineHeight: 48 }}>
            {item.emoji || '🍽️'}
          </Label>
        )}
        <Button
          title={favourite ? '♥' : '♡'}
          label={`${favourite ? 'Unfavourite' : 'Favourite'} ${item.name}`}
          secondary
          small
          onPress={() => onFavourite(item.id)}
        />
      </Row>
      {item.isSpecial ? (
        <Label
          style={{ color: colors.special, fontSize: 12, fontWeight: '700' }}
        >
          DAILY SPECIAL
        </Label>
      ) : null}
      <Label style={{ fontSize: 18, fontWeight: '700' }}>{item.name}</Label>
      <Label muted style={{ fontSize: 13 }}>
        {item.description}
      </Label>
      <Label style={{ fontWeight: '700' }}>{money(item.price)}</Label>
      {!item.isAvailable ? (
        <Label style={{ color: colors.danger }}>Unavailable</Label>
      ) : null}
      <Row>
        <Button
          title="Details"
          small
          secondary
          label={`Details for ${item.name}`}
          onPress={() => onDetails(item)}
        />
        {/* ===== ADD TO CART BUTTON ===== */}
        <Button
          title="Add to cart"
          small
          disabled={!item.isAvailable}
          label={`Add ${item.name} to cart`}
          onPress={() => onAdd(item)}
        />
      </Row>
    </Card>
  );
}
export default memo(MenuItemCard);
