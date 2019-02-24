import React from 'react';
import { StyleSheet, View, FlatList, Image } from 'react-native';

import { posters } from '../data';
import { POSTER_HEIGHT, SCREEN_WIDTH, ELEVATION, Colors } from '../constants';

export default class PostersTab extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { data: this.getMorePosters() };
  }

  getMorePosters() {
    const { data = [] } = this.state || {};
    posters.forEach((uri, index) => data.push({ key: `${data.length + index}-${uri}`, uri }));
    console.log(data.length);
    return data;
  }

  renderItem = ({ item: { uri } }) => {
    return (
      <View style={styles.item}>
        <Image style={styles.image} source={{ uri }} />
      </View>
    )
  }

  loadMoreData() {
    this.getMorePosters();
    this.forceUpdate();
  }

  render() {
    const { data } = this.state;

    return (
      <FlatList
        style={styles.list}
        onContentSizeChange={() => null}
        data={data}
        renderItem={this.renderItem}
        keyExtractor={item => item.key}
        scrollEnabled={false}
      />
    );
  }
}

const styles = StyleSheet.create({
  item: {
    height: POSTER_HEIGHT,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    shadowOpacity: 0.0015 * ELEVATION + 0.18,
    shadowRadius: 0.54 * ELEVATION,
    shadowOffset: {
      height: 0.6 * ELEVATION,
    },
  },
  image: {
    height: '100%',
    width: 0.75 * SCREEN_WIDTH,
    borderRadius: 50,
    overflow: 'hidden',
    resizeMode: 'cover',
    backgroundColor: Colors.POSTER_BG,
  },
});
