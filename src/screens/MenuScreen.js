import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { View, FlatList, useWindowDimensions, Modal } from 'react-native';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useStoredState } from '../hooks/useStoredReducer';
import { useDebounce } from '../hooks/useDebounce';
import { categories } from '../data/menu';
import {
  Heading,
  Field,
  Row,
  Label,
  Button,
  Card,
  Notice,
} from '../components/UI';
import MenuItemCard from '../components/MenuItemCard';
import CategoryChip from '../components/CategoryChip';
import EmptyState from '../components/EmptyState';
import { money } from '../constants/brand';
export default function MenuScreen() {
  const { menu } = useRestaurant(),
    { user, toggleFavourite } = useAuth(),
    { addItem } = useCart(),
    { colors } = useTheme();
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState('All'),
    [favouritesOnly, setFavouritesOnly] = useState(false),
    [detail, setDetail] = useState(null),
    [message, setMessage] = useState('');
  const searches = useStoredState('cafe:searches:' + user.id, []);
  const debounced = useDebounce(query),
    list = useRef(null),
    { width } = useWindowDimensions();
  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;
  useEffect(() => {
    const term = debounced.trim();
    if (searches.ready && term)
      searches.setState((s) =>
        [term, ...s.filter((t) => t !== term)].slice(0, 5),
      );
  }, [debounced, searches.ready]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 2500);
    return () => clearTimeout(timer);
  }, [message]);
  const filtered = useMemo(
    () =>
      menu.filter(
        (item) =>
          (category === 'All' || item.category === category) &&
          (!favouritesOnly || user.favourites.includes(item.id)) &&
          `${item.name} ${item.description}`
            .toLowerCase()
            .includes(debounced.trim().toLowerCase()),
      ),
    [menu, category, favouritesOnly, user.favourites, debounced],
  );
  const add = useCallback(
    (item) => {
      addItem(item);
      setMessage(`${item.name} added to cart.`);
    },
    [addItem],
  );
  const currentDetail = detail ? menu.find((m) => m.id === detail.id) : null;
  const header = (
    <View style={{ padding: 6 }}>
      <Heading
        title="The menu"
        subtitle="Fresh favourites, made for your day."
      />
      {/* ===== SEARCH BAR ===== */}
      <Field
        label="Search food"
        placeholder="Search the menu…"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      <Row style={{ marginBottom: 12 }}>
        {['All', ...categories].map((c) => (
          <CategoryChip
            key={c}
            title={c}
            selected={category === c}
            onPress={() => {
              setCategory(c);
              list.current?.scrollToOffset({ offset: 0, animated: false });
            }}
          />
        ))}
        <CategoryChip
          title="Favourites"
          selected={favouritesOnly}
          onPress={() => setFavouritesOnly(!favouritesOnly)}
        />
      </Row>
      {searches.state.length ? (
        <>
          <Label muted>Recent searches</Label>
          <Row style={{ marginVertical: 8 }}>
            {searches.state.map((s) => (
              <Button
                key={s}
                title={s}
                label={`Search again for ${s}`}
                secondary
                small
                onPress={() => setQuery(s)}
              />
            ))}
          </Row>
        </>
      ) : null}
      <Notice message={message} />
      <Label muted style={{ marginBottom: 8 }}>
        {filtered.length} items · Prices in PKR
      </Label>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        ref={list}
        key={columns}
        numColumns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 14,
          maxWidth: 1100,
          width: '100%',
          alignSelf: 'center',
        }}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            favourite={(user.favourites || []) .includes(item.id)}
            onFavourite={toggleFavourite}
            onAdd={add}
            onDetails={setDetail}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No results found"
            description="Try another search or category."
          />
        }
      />
      <Modal
        visible={!!currentDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setDetail(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#00000080',
            padding: 24,
            justifyContent: 'center',
          }}
        >
          <View style={{ maxWidth: 500, width: '100%', alignSelf: 'center' }}>
            <Card>
              {currentDetail ? (
                <>
                  <Label large>
                    {currentDetail.emoji} {currentDetail.name}
                  </Label>
                  <Label>{currentDetail.description}</Label>
                  <Label muted>
                    {currentDetail.category}
                    {currentDetail.isSpecial ? ' · Daily Special' : ''}
                  </Label>
                  <Label>{money(currentDetail.price)}</Label>
                  <Button
                    title="Add to cart"
                    disabled={!currentDetail.isAvailable}
                    onPress={() => {
                      add(currentDetail);
                      setDetail(null);
                    }}
                  />
                </>
              ) : null}
              <Button
                title="Close details"
                secondary
                onPress={() => setDetail(null)}
              />
            </Card>
          </View>
        </View>
      </Modal>
    </View>
  );
}
