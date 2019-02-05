import React from 'react';
import { Text } from 'react-native';
import { List, ListItem } from 'native-base';

import { characters } from '../data';

export default () => (
  <List>
    {characters.map(value => (
      <ListItem key={value}>
        <Text>
          {value}
        </Text>
      </ListItem>
    ))}
  </List>
);
