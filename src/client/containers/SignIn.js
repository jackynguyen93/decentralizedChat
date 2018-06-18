import React, { Component } from 'react';
import { Button, Input } from 'semantic-ui-react';
import {setAddress, setUser} from "../actions/userActions";
import {
    setAvatar as setFriendAvatar, setName as setFriendName,
    setUsername as setFriendUsername
} from "../actions/friendActions";
import {addConversation, addMessage, displayConversation} from "../actions/conversationActions";
import {setConnected} from "../actions/connectionActions";
import {connect} from "react-redux";
import {getSignedInUser} from "../service/UserService";

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = { pending: false , username: undefined};
    this.nonce = Math.floor(1000000000 + Math.random()*(9999999999 - 1000000000));
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignInSuccessful = this.handleSignInSuccessful.bind(this);
  }

  componentWillMount() {
   // this.setState({ pending: true });
  }

  handleSignInSuccessful({ publicAddress, signature }) {
    console.log("Sign in with signature ---- "+  signature);
    localStorage.setItem("login-address", JSON.stringify(getSignedInUser(this.state.username, publicAddress, signature)));
    window.location.reload();
  }

  handleUsername = (e, data) => {
    this.setState({ username: data.value });
  }

  handleSignIn() {
    let me = this;
    let web3;
    if (!window.web3) {
        window.alert('Please install MetaMask first.');
        return;
    } else {
        web3 = window.web3;
    }
    if (!web3) {
        // We don't know window.web3 version, so we use our own instance of web3
        // with provider given by window.web3
        web3 = new Web3(window.web3.currentProvider);
    }
    if (!web3.eth.coinbase) {
        window.alert('Please activate MetaMask first.');
        return;
    }
    this.setState({ pending: true });
    const publicAddress = web3.eth.coinbase.toLowerCase();
    console.log(publicAddress);
    me.props.rxSetUserAddress(publicAddress);
    me.props.rxSetUser(getSignedInUser(this.state.username, publicAddress));

    new Promise((resolve, reject) =>
        web3.personal.sign(
            web3.fromUtf8(`I am signing my one-time nonce: ${this.nonce}`),
            publicAddress,
            (err, signature) => {
                if (err) return reject(err);
                return resolve({ publicAddress, signature });
            }
        )
    ).then(me.handleSignInSuccessful) ;
  }

  render() {
    const { pending } = this.state;

    return (
      <div className="SignIn">
        <div>
          <h1>Decentralized Chat</h1>
          <Input placeholder='Enter username' onChange={this.handleUsername} fluid />
          <br/>
          <Button disabled={pending} onClick={this.handleSignIn} size="massive" >
            {pending ? 'Signing in ...' : 'Sign in with Metamask'}
          </Button>
        </div>
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
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);

