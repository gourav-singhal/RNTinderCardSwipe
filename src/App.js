/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

'use strict';
import React, {
  Component,
} from 'react';
import {
  StyleSheet,
  View,
  Platform,
} from 'react-native';

import Header from './Header';
import SwipeCards from './SwipeCards';

  // on IOS the window draws over the stats bar
  const windowMarginTop = (Platform.OS === 'ios') ? 24 : 0;

  class ReactNativeTinderSwipe extends Component {
    render() {
      return (
        <View style={styles.viewPortContainer}>
          <Header/>
          <SwipeCards/>
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    viewPortContainer: {
      marginTop: windowMarginTop,
      flex: 1,
    },
  });

export default ReactNativeTinderSwipe;
