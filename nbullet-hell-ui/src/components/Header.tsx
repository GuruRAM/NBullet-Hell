import React, { Component } from 'react';
import './Header.css';

interface IState {
  isHovered: boolean
}
interface IProps {}

export class Header extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  handleHover(value: boolean){
    this.setState({
        isHovered: value
    });
  }

  render() {
    return <div>
        <a className={"github-link"} href="https://github.com/GuruRAM/NBullet-Hell" target="_blank"
          onMouseEnter={() => this.handleHover(true)} onMouseLeave={() => this.handleHover(false)}>
          <p className="nes-balloon from-right">Fork me<br/>on GitHub</p>
          <i className={"nes-octocat" + (this.state && this.state.isHovered ? " animate" : "")}></i>
        </a>
        {this.props.children}
        </div>;    
  }
}