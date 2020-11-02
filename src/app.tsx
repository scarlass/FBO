import React, {useState} from "react";
import ReactDOM from "react-dom";

import HomePage from "./component/HomePage";
import SearchPage from "./component/SearchPage";
import SavedPage from "./component/SavedPage";
// import Modal from "./component/Modal";
import { NavPages } from "./component/Utils";

import "materialize-css";


interface AppState {
  page: string;
}


class App extends React.Component<{}, AppState> {
  state: AppState = {
    page: "home"
  }

  Refs = {
    navBtns: React.createRef<HTMLUListElement>()
  }

  componentDidMount() {
    goal
    .on("page.changed", (e) => this.setState(e));
  }

  render() {
    const navBtnsAttr = [
      { pageName: "home"},
      { pageName: "search", text: "find"},
      { pageName: "saved"},
    ];
    let {page} = this.state

    return (
      <div className="app">

        <header>
          <nav>
            <div className="nav-wrapper">

              <NavPages
                setBtnChilds={navBtnsAttr}
                selected={page}
              />

            </div>
          </nav>
        </header>

        <main>
          <HomePage currentPage={page} />
          <SearchPage currentPage={page} />
          <SavedPage currentPage={page} />
        </main>

      </div>
    )
  }
};


ReactDOM.render(
  <App />,
  document.getElementById("root")
);

