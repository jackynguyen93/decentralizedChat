import React, { Component } from 'react';
import UserItem from '../UserItem';
import { Button } from 'semantic-ui-react';

class UserTopBar extends Component {
  constructor(props) {
    super(props);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  handleSignOut(e) {
    e.preventDefault();
    localStorage.clear();
      window.location = "/";
   // signUserOut(window.location.origin);
  }

  render() {
    return (
      <div className="UserTopBar">
        <UserItem user={this.props.user} />
        <Button size="mini" onClick={this.handleSignOut}>Sign Out</Button>
      </div>
    );
  }
}

export default UserTopBar;