import React, {Component} from 'react';
import {connect} from 'react-redux';

import {Grid} from 'semantic-ui-react';
import HeaderBar from '../components/HeaderBar';
import SignIn from './SignIn';
import ConversationsBar from '../containers/ConversationsBar';
import ChatWindow from '../containers/ChatWindow';
import '../styles/App.css';
import Web3 from 'web3';

import {setAddress, setUser} from '../actions/userActions';
import {setConnected} from '../actions/connectionActions';
import {addConversation, addMessage, displayConversation} from '../actions/conversationActions';
import {
    setAvatar as setFriendAvatar, setName as setFriendName,
    setUsername as setFriendUsername
} from '../actions/friendActions';
 import IPFS from 'ipfs';
import Room from 'ipfs-pubsub-room';
import { RingLoader } from 'react-spinners';

let room = {};
let currentAddress = '';
let currentPeer = '';
const ipfs = new IPFS({
    repo: 'ipfs/pubsub-demo/' + Math.random(),
    EXPERIMENTAL: {
        pubsub: true
    },
    config: {
        Addresses: {
            Swarm: [
                '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
            ]
        }
    }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.handleMakeConnection = this.handleMakeConnection.bind(this);
    this.handleSaveMessage = this.handleSaveMessage.bind(this);
    this.state = {
        loading: true
    }
    ipfs.on('ready', () => {
        this.setState({loading:false});
    })
  }

  handleMakeConnection(address) {
    room = Room(ipfs, address);
    room.on('subscribed', () => {
        console.log('Now connected!');
        this.props.rxDisplayConversation(address);
        this.props.rxSetConnectionStatus(address, true);
        this.props.rxDisplayConversation(address);
        this.props.rxAddConversation(address, []);
    });
    room.on('message', (message) => {
        if (message.from !== ipfs._peerInfo.id._idB58String)
        this.handleReceiveMessage(address, message.data.toString());
    });
    room.on('peer joined', (peer) => {
      console.log('peer joined ' + peer);
    });

  }

  handleReceiveMessage(address, text) {
    const msg = {
      user: 1,
      text,
      date: Date.now()
    };
    this.props.rxAddMessage(address, msg);
  }

  handleSaveMessage(msg) {
    /*const dp2p = p2p[this.props.displayConversation];
    dp2p.sendMessage(msg);*/
    room.broadcast(msg);
  }

  isUserSignedIn() {
      return localStorage.getItem("login-address") ? true : false;
  }

  componentWillMount() {
    // (!isUserSignedIn()) return;
   /*   let web3 = new Web3(window.web3.currentProvider);
      let me = this;
      web3.version.getNode(function(error, result) {
          if(!error) {
              currentAddress = web3.eth.accounts[0];
              me.props.rxSetUserAddress(web3.eth.accounts[0]);
              me.props.rxSetUser(getSignedInUser());
          }
          else {
              console.error(error);
          }
      });*/
  }

  render() {
    return (
      <div className="App sweet-loading">
          <RingLoader
              color={'#123abc'}
              style={ {position: 'absolute', top: '50%', left: '50%' }}
              loading={this.state.loading}
          >
              {!this.isUserSignedIn()
                  ? <SignIn />
                  : <div className="TribeChat">
                      <HeaderBar data={{ user: this.props.user, friend: this.props.chatFriend }} />
                      <div className="MainWindow">
                          <Grid padded>
                              <Grid.Column width={4}>
                                  <ConversationsBar onMakeConnection={this.handleMakeConnection} />
                              </Grid.Column>
                              <Grid.Column width={12}>
                                  {this.props.displayConversation
                                      ? <ChatWindow onSendMessage={this.handleSaveMessage} />
                                      : ''
                                  }
                              </Grid.Column>
                          </Grid>
                      </div>
                  </div>
              }
          </RingLoader>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    displayConversation: state.displayConversation,
    chatFriend: state.friends.find(f => f.address === state.displayConversation)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    rxSetUser: (user) => {
      return dispatch(setUser(user));
    },
    rxSetUserAddress: (address) => {
      return dispatch(setAddress(address));
    },
    rxSetConnectionStatus: (address, connected) => {
      return dispatch(setConnected(address, connected));
    },
    rxConnectedFriend: (address, friend) => {
      dispatch(setFriendName(address, friend.name));
      dispatch(setFriendUsername(address, friend.username));
      dispatch(setFriendAvatar(address, friend.avatarUrl));
    },
    rxDisplayConversation: (address) => {
      return dispatch(displayConversation(address));
    },
    rxAddConversation: (address, messages) => {
      return dispatch(addConversation({ address, messages: messages }));
    },
    rxAddMessage: (address, msg) => {
      return dispatch(addMessage(address, msg));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

