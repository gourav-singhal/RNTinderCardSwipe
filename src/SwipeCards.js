'use strict';

import React, {
  Component,
} from 'react';

import {
  StyleSheet,
  View,
  Text,
  Animated,
  PanResponder, 
  Image, 
  ImageBackground,
  TouchableHighlight,
  Dimensions,
} from 'react-native';

import clamp from 'clamp';

const CARDS = [
  {name: 'Card 1'},
  {name: 'Card 2'},
  {name: 'Card 3'},
  {name: 'Card 4'},
  {name: 'Card 5'}
]

// How far the swipe need to go for a yes/ no to fire
var SWIPE_THRESHOLD = 120;
// To get the stack effect the lower card must pick out at the bottom and appear smaller
var NEXT_CARD_POSITION_OFFSET = 4;
var NEXT_CARD_SIZE_OFFSET = 8;

class Card extends Component {
  render() {
    return (
      <View style={styles.cardResizeContainer}>
        <Animated.View style={[styles.cardContainer, this.props.animatedCardContainerStyles]}>
          <Animated.View style={[styles.card, this.props.animatedCardStyles]} {...this.props.panResponder}>
            <View style={styles.cardLabelContainer}>
              <Text style={styles.name}>{this.props.name}</Text>
            </View>
          </Animated.View>   
        </Animated.View>
      </View>
    );
  }
}

class SwipeCards extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pan: new Animated.ValueXY(),
      cards: CARDS,
      currentPosition: 0,
    }
  }

  _goToNextPerson() {
    let nextPosition = (this.state.currentPosition + 1);
    this.setState({currentPosition: nextPosition});
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),

      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        let velocity;

        if (vx >= 0) {
          velocity = clamp(vx, 3, 5);
        } else if (vx < 0) {
          velocity = clamp(vx * -1, 3, 5) * -1;
        }

        if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {
          Animated.decay(this.state.pan, {
            velocity: {x: velocity, y: vy},
            deceleration: 0.99
          }).start(this._resetState.bind(this))
        } else {
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }
      }
    })
  }

  _resetState() {
    this.state.pan.setValue({x: 0, y: 0});
    this._goToNextPerson();
  }

  addMorePress = () => {
    this.setState({
      currentPosition: 0,
    });
  }

  render() {
    let { pan, cards, currentPosition} = this.state;

    let [translateX, translateY] = [pan.x, pan.y];

    // card 0 animation
    let rotate = pan.x.interpolate({inputRange: [-240, 0, 240], outputRange: ["-30deg", "0deg", "30deg"]});

    let animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}]};

    let yupOpacity = pan.x.interpolate({inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp'});
    let animatedYupStyles = {opacity: yupOpacity}

    let nopeOpacity = pan.x.interpolate({inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp'});
    let animatedNopeStyles = {opacity: nopeOpacity}

    let card0AnimatedStyles = {
      animatedCardStyles: animatedCardStyles, 
      animatedNopeStyles: animatedNopeStyles,
      animatedYupStyles: animatedYupStyles
    }

    // card 1 animation
    let card1BottomTranslation = pan.x.interpolate({inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], outputRange: [0, -NEXT_CARD_POSITION_OFFSET, 0], extrapolate: 'clamp'});
    let card1SideTranslation = pan.x.interpolate({inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], outputRange: [0, NEXT_CARD_SIZE_OFFSET, 0], extrapolate: 'clamp'});
    let card1TopTranslation = pan.x.interpolate({inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], outputRange: [0, NEXT_CARD_POSITION_OFFSET+NEXT_CARD_SIZE_OFFSET, 0], extrapolate: 'clamp'});
    let card1TranslationStyles = {top: card1TopTranslation, bottom: card1BottomTranslation, right: card1SideTranslation, left: card1SideTranslation}
    let card1AnimatedStyles = {
      animatedCardContainerStyles: card1TranslationStyles
    }

    // card 2 animation
    let card2BottomTranslation = pan.x.interpolate({inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], outputRange: [-NEXT_CARD_POSITION_OFFSET, -NEXT_CARD_POSITION_OFFSET*2, -NEXT_CARD_POSITION_OFFSET], extrapolate: 'clamp'});
    let card2SideTranslation = pan.x.interpolate({inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], outputRange: [NEXT_CARD_SIZE_OFFSET, NEXT_CARD_SIZE_OFFSET*2, NEXT_CARD_SIZE_OFFSET], extrapolate: 'clamp'});
    let card2TopTranslation = pan.x.interpolate({inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], outputRange: [NEXT_CARD_POSITION_OFFSET+NEXT_CARD_SIZE_OFFSET, (NEXT_CARD_POSITION_OFFSET+NEXT_CARD_SIZE_OFFSET)*2, NEXT_CARD_POSITION_OFFSET+NEXT_CARD_SIZE_OFFSET], extrapolate: 'clamp'});
    let card2TranslationStyles = {top: card2TopTranslation, bottom: card2BottomTranslation, right: card2SideTranslation, left: card2SideTranslation}
    let card2AnimatedStyles = {
      animatedCardContainerStyles: card2TranslationStyles
    }

    let card3AnimatedStyles = {
      animatedCardContainerStyles: {top: (NEXT_CARD_POSITION_OFFSET+NEXT_CARD_SIZE_OFFSET)*2, bottom: -NEXT_CARD_POSITION_OFFSET*2, right: NEXT_CARD_SIZE_OFFSET*2, left: NEXT_CARD_SIZE_OFFSET*2}
    }

    let card0 = cards[currentPosition]
    let card1 = cards[(currentPosition+1) % cards.length]
    let card3 = cards[(currentPosition+2) % cards.length]
    let card4 = cards[(currentPosition+3) % cards.length]
    let addMore = { name: 'Add More'};

    return (
      <View style={styles.bodyContainer}>
        <View style={styles.responsiveContainer}>

          { (currentPosition !== 5) ?
          <View style={styles.cardsContainer}>
            <Card key={card4.name} {...card4} {...card3AnimatedStyles}/>
            <Card key={card3.name} {...card3} {...card2AnimatedStyles}/>
            <Card key={card1.name} {...card1} {...card1AnimatedStyles} />
            <Card key={card0.name} {...card0} {...card0AnimatedStyles} panResponder={this._panResponder.panHandlers}/>
          </View> :
          <View style={styles.addContainer}>
            <Text style={styles.cardImageText}>No more cards :(</Text>
            <TouchableHighlight onPress={this.addMorePress} style={styles.button}>
              <Text style={styles.cardImageText}>Add more cards</Text>
            </TouchableHighlight>
          </View>
        }

        </View>   
      </View>
    );
  }
}

var styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  responsiveContainer: {
    flex: 1,
    paddingBottom: 100,
  },

  // cards
  cardsContainer: {
    flex: 1,
  },

  addContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 100,
    height: 40,
  },

  cardResizeContainer: {
    flex: 1,
    position: 'absolute',
    top: 40,
    left: 40,
    bottom: 40, 
    right: 40,
  },

  cardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0, 
    right: 0,
    justifyContent: 'flex-end',
  },

  card: {   
    position: 'relative',
    borderColor: '#AAA',
    borderWidth: 1,
    borderRadius: 8,  
    flex: 1,
    //overflow: 'hidden',
    shadowRadius: 2,
    shadowColor: '#BBB',
    shadowOpacity: 0.8,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    backgroundColor: '#32CD32'
  },

  cardImage: {
    flex: 1,
    borderRadius: 8,
  },

  cardImageTextContainer: {
    position: 'absolute',
    borderWidth: 3,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 4,
    opacity: 0,
  },
  cardImageYupContainer : {
    top: 40,
    left: 40,
    transform:[{rotate: '-20deg'}],
    borderColor: 'green',
    
  },
  cardImageNopeContainer : {
    top: 40,
    right: 40,
    transform:[{rotate: '20deg'}],
    borderColor: 'red',
  },
  cardImageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardImageNopeText: {
    color: 'red',
    backgroundColor: 'rgba(0,0,0,0)', 
  },
  cardImageYupText: {
    color: 'green',
    backgroundColor: 'rgba(0,0,0,0)',
  },

  cardLabelContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
  },
  name: {
    fontWeight: 'bold',
    color: '#999',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#999',
  },
  buttonsContainer: {
    height:100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  button: {
    borderWidth: 2,
    padding: 8,
    borderRadius: 5,
  },
});


export default SwipeCards;