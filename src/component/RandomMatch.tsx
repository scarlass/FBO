import React from "react";
import { Preloader } from "react-materialize";
import cx from "classnames";


export default class RandomMatch extends React.Component<{}, RandomState> {
  state: RandomState = {
    showLoading: false,
    elToShow: null,
    currentTeam: null,
    prevTeam: null,
    match: null,
    isCounting: false
  };

  seconds = 20;
  show = 2;

  async getMatch(team: FBOrg.Team) {
    try {
      let req = await goal.request("team", team.id, {
        matches: {
          limit: 10,
          status: "SCHEDULED"
        }
      });
      let json: FBOrg.SearchMatch = await req.json();

      if (json.matches.length === 0) {
        this.getTeamFromIDB();
        return;
      }

      let arr = [];

      for (let k = (this.show - 1); k >= 0; k--) {
        let matches = json.matches;
        let res = matches.splice(rand(matches), 1)[ 0 ];

        let newD = JSON.parse(JSON.stringify(res)) as FBOrg.Match<FBOrg.Team>;

        let hm = newD.homeTeam, aw = newD.awayTeam;

        if (hm.id === team.id) newD.homeTeam = team;
        else hm.crestUrl = goal.Media.crestFromUrl(hm.id);

        if (aw.id === team.id) newD.awayTeam = team;
        else aw.crestUrl = goal.Media.crestFromUrl(aw.id);
        arr.push(newD);
      }

      // this.setState({ currentTeam: newD });
      this.setState({ match: arr });
      setTimeout(() => {
        this.setState({ showLoading: false });
      }, 1000);
      setTimeout(() => {
        this.getTeamFromIDB();
        this.setState({
          isCounting: true
        });
      }, this.seconds * 1000);
    }
    catch (err) {
      throw err;
    }
  }

  getTeamFromIDB() {
    const { prevTeam, currentTeam } = this.state;

    if (currentTeam !== null) this.setState({ prevTeam: currentTeam });
    this.setState({ showLoading: true, isCounting: false });
    goal
      .trax((db) => db.getAll())
      .then((res: FBOrg.Team[]) => {
        if (res.length === 0) {
          this.setState({ match: null });
          return;
        }
        let rand = function () { return Math.floor(Math.random() * res.length); };
        let team = res[ rand() ];

        if (prevTeam !== null && prevTeam.id === team.id) {
          team = res[ rand() ];
        }

        this.setState({ currentTeam: team });
        this.getMatch(team);
      });

  }

  componentDidMount() {
    this.getTeamFromIDB();

    goal.on("addTeam", (e) => {
      const { match } = this.state;
      if (match === null) { this.getMatch(e); }
    });
  }

  convertDate(str: string) {
    let d = new Date(str);
    return d.toDateString().split(" ")
      .map(i => goal.Media.Day(i))
      .map(i => goal.Media.Month(i))
      .join(" ");
  }

  render() {
    let match = this.state.match;
    let matchNull = match === null;

    return (
      <table className="matches">

        <thead>

          <tr className="buttons">
            <td colSpan={3}>
              *Showing {this.show} random upcoming match{this.show > 1 ? "es" : null} every {this.seconds} second.
            </td>
          </tr>
          <tr>
            <td className="logo">Home</td>
            <td>vs</td>
            <td className="logo">Away</td>
          </tr>

        </thead>

        <tbody className={cx({ "loading": this.state.showLoading })} >
          {matchNull ? <tr><td colSpan={3}><div>No team(s) to show.</div></td></tr> :
            match.map((el, n) => {
              return (
                <RandomRow
                  key={`comp${n}-${el.id}`}
                  data={el}
                  convertDate={this.convertDate}
                  matchNull={matchNull}
                />
              );
            })
          }
        </tbody>
      </table>
    );
  }
}

function RandomRow(props: RandomRowProps) {
  const { matchNull, data, convertDate } = props;

  return (
    <tr>
      {/* column 1 */}
      <td className="logo">
        {matchNull ? null : (<img src={data.homeTeam.crestUrl} alt="logo" />)}
      </td>

      {/* column 2 */}
      <td>
        {matchNull ? <div>Empty</div> : (
          <>
            <div className="text-info">
              <p>
                <span className="comp">
                  {data.competition.name}
                </span>
                <br />
                <span className="date">
                  {convertDate(data.utcDate)}
                </span>
              </p>
            </div>
            <Preloader active color="red" />
          </>
        )}
      </td>

      {/* column 3 */}
      <td className="logo">
        {matchNull ? null : (<img src={data.awayTeam.crestUrl} alt="logo" />)}
      </td>
    </tr>
  );
}

function rand(arr: any[]) {
  return Math.floor(Math.random() * arr.length);
}

interface RandomRowProps {
  data: FBOrg.Match<FBOrg.Team>;
  matchNull: boolean;
  convertDate(str: string): string;
}

interface RandomState {
  showLoading: boolean;
  elToShow: JSX.Element;
  currentTeam: FBOrg.Team;
  prevTeam: FBOrg.Team;
  match: FBOrg.Match<FBOrg.Team>[];
  isCounting: boolean;
}