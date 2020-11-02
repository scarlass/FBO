import React from "react";
import {Row, Col} from "react-materialize"
import {TeamCard, CAutoComplete, Loader, PagesBaseProps} from "./Utils";
import cx from "classnames"


interface SearchProps extends PagesBaseProps {}
interface SearchState {
  ACHint: any;
  teamCards: JSX.Element[];
  loadShow: boolean;
  loadText: string
}
var sss = "asd"
export default class SearchPage extends React.Component<SearchProps, SearchState> {
  state: SearchState = {
    ACHint: null,
    teamCards: null,
    loadShow: false,
    loadText: "Loading . . ."
  }

  get loading() {
    const t = this;
    t.setState({loadText: "Loading . . ."});

    return {
      show(state: boolean) {
        t.setState({loadShow: state})
      },
      text(text?: string) {
        t.setState({loadText: text || t.state.loadText});
      }
    }
  }

  requestArea(areaName: string) {
    const {loading} = this;
    const temp = this.state.teamCards;

    this.setState({teamCards: []});
    loading.show(true);

    return new Promise<FBOrg.SearchTeamsRegion>((resolve, reject) => {
      let areaText = areaName[0].toUpperCase() + areaName.slice(1);

      loading.text(`Loading Region: ${areaText}`);

      let t = setInterval(async () => {
        if(typeof goal.Areas !== "undefined") {
          clearInterval(t);
          let areaId = goal.Areas[areaName.toLowerCase()];
          try {
            let req = await goal.request("area", {area: areaId})
            let json: FBOrg.SearchTeamsRegion = await req.json();
            return resolve(json);
          }
          catch (err) {
            if("message" in err) reject(err.message);
            else reject(err);
            loading.show(false);
            this.setState({teamCards: temp});
          }
        }
      }, 100);
    });
  }

  getArea(areaName: string) {
    this.requestArea(areaName)
    .then((res) => {
      const cards: JSX.Element[] = [];

      for(let k of res.teams) {
        let el = (<TeamCard key={`team${k.id}`} team={k}/>)
        cards.push(el);
      }

      setTimeout(() => {
        this.loading.show(false);
        this.setState({ teamCards: cards });
      }, 1500)
    })
    .catch(err => { throw err })
  }

  componentDidMount() {

    let t = setInterval( async () => {

      const m = {};
      const res = await goal.trax({ storeName: "area" }, function (db) {
        return db.getAll() as Promise<FBOrg.Area[]>;
      });

      if(res.length === 0) return;
      for(let k of res) m[k.name] = null;

      this.setState({
        ACHint: m
      });

      clearInterval(t);
    }, 150);
  }

  render() {
    let {currentPage} = this.props;
    let {loadShow, loadText} = this.state

    return (
      <Row
        className="pages page-search"
        style={{ display: currentPage === "search" ? null : "none" }}
      >
        <CAutoComplete
          options={{
            data: this.state.ACHint,
            minLength: 0,
            onAutocomplete: this.getArea.bind(this)
          }}
          s={12}
          inputAttributes={{ disabled: this.state.ACHint === null }}
          title="Search Region"
        />
        <Loader
          show={loadShow}
          text={loadText}
          active
          color="red"
          size="big"
        />
        <Col s={12} className="team-result">
          {this.state.teamCards}
        </Col>
      </Row>
    );
  }
};
