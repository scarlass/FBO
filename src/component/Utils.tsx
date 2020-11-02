import React, { useEffect, useState } from "react";
import {
	Icon,
	Row,
	Col,
	ColProps,
	Card,
	CardTitle,
  Preloader,
  Table
} from "react-materialize";
import cx from "classnames";

const CAC_IDS: string[] = [];

function rand(arr: any[]) {
  return Math.floor(Math.random() * arr.length);
}

export function NavPages(props: ElNav.ContainerProps) {
	let [disabled, setDisable] = useState(false),
		[slc, setSelected] = useState(props.selected || props.setBtnChilds[0].pageName);

	let fn = {
		createChild(props: ElNav.ButtonsProps) {
			let { pageName: pageBtn } = props;
			let text = props.text || pageBtn;
			return (
				<li>
					<a
						href={"#" + pageBtn}
						className={cx("btn-small waves-light", {
							selected: slc === pageBtn,
							disabled: disabled,
						})}
						onClick={() => {
							goal.emit("page.changed", { page: pageBtn });
							setSelected(pageBtn);
						}}
					>
						<Icon className="left">{props.icons || goal.icons[pageBtn] || ""}</Icon>
						{text[0].toUpperCase() + text.slice(1)}
					</a>
				</li>
			);
		},
		disableNavBtns(state: boolean) {
			setDisable(state);
		},
	};

	let childs = props.setBtnChilds.map((i, n) => {
		return <fn.createChild key={`NavBtn${n}`} {...i} />;
	});

	useEffect(function () {
		goal.on("disableNavBtns", fn.disableNavBtns);

		return function () {
			goal.off("disableNavBtns", fn.disableNavBtns);
		};
	});

	return <ul className={props.className}>{childs}</ul>;
}

export function StatusTab(props: ElStatus.Props) {
	let fn = {
		childTab(props: ElStatus.ChildsOptions) {
			let { state, textCondition: tx } = props;
			return (
				<Col
					className="stats-col"
					s={props.s}
					m={props.m}
					l={props.l}
					xl={props.xl}
					style={props.style}
				>
					<div className={cx("loader-stat", { animate: !state })}>
						<div className="loader-inner"></div>
					</div>

					<span className="loader-text">
						{cx({
							[tx.onFalse]: !state,
							[tx.onTrue]: state,
						})}
					</span>
				</Col>
			);
		},
	};

	let style: React.CSSProperties = {
		// position: "absolute",
		// top: 0,
		// left: 0,
		// right: 0,
		padding: "5px 0.75rem",
		margin: 0,
	};

	let childs = props.statusOptions.map((el, n) => {
		return <fn.childTab key={`ST-${n}`} {...el} />;
	});
	return (
		<Row className="status" style={style}>
			{childs}
		</Row>
	);
}

export function CAutoComplete(props: CustomACProps) {
	let { length } = CAC_IDS;
	let inputID = `CAC-GEN-${length < 10 ? "0" + length : length}`;
	let entrClsAtr = "input-field col";
	let refInput: HTMLInputElement;

	function setClassName(...className: (string | { [k: string]: boolean })[]) {
		entrClsAtr = cx(...className);
	}

	if (props.s) setClassName(entrClsAtr, `s${props.s}`);
	if (props.m) setClassName(entrClsAtr, `m${props.m}`);
	if (props.l) setClassName(entrClsAtr, `l${props.l}`);
	if (props.xl) setClassName(entrClsAtr, `xl${props.xl}`);
	if (props.className) setClassName(entrClsAtr, props.className);

	if (props.id) inputID = props.id;
	else CAC_IDS.push(inputID);

	useEffect(function () {
		let inst = M.Autocomplete.init(refInput, props.options);
		if (props.refInstance) {
			props.refInstance(inst);
		}
		return function () {
			inst.destroy();
		};
	}, [props.options.data]);

	let atr = props.inputAttributes || {};

	if (props.onChange) atr.onChange = props.onChange;
	if (props.onInput) atr.onInput = props.onInput;

	return (
		<div className={entrClsAtr}>
			{props.icon ? <Icon className="prefix">props.icon</Icon> : null}
			<input
				{...atr}
				type="text"
				id={inputID}
				className={cx("autocomplete", atr.className)}
				ref={(e) => (refInput = e)}
        placeholder={props.placeHolder}
        // disabled
			/>
			{props.title ? <label htmlFor={inputID}>{props.title}</label> : null}
		</div>
	);
}

export function Loader(props: ElLoader.Props<classNameObj>) {
	let text = props.text || "Loading . . .";
	let cls = cx("loader", { hide: !props.show });

	if (props.className) cls = cx(props.className, cls);

	return (
		<div id={props.id} className={cls}>
			<Preloader
				active={props.active}
				color={props.color}
				flashing={props.flashing}
				size={props.size}
			/>
			<span className="loader-text">{text}</span>
			{props.children}
		</div>
	);
}

export function TeamCollection(props: TeamCollectionProps) {
	let [remove, setRemove] = useState(false);
	let { team } = props;

	const crest = goal.Media.crestNull(team.crestUrl),
		selectNone: React.CSSProperties = { userSelect: "none" },
		fn = {
			removeClick(e: React.MouseEvent<HTMLAnchorElement>) {
				e.stopPropagation();
				goal.emit("removeTeam", team);
			},
			collectionRemove(e: FBOrg.Team) {
				if (e.id === team.id) setRemove(true);
			},
		};

	useEffect(function () {
		goal.on("removeTeam", fn.collectionRemove);
		return () => goal.off("removeTeam", fn.collectionRemove);
	});

	let cls = cx("collection-item avatar scale-transition", { "scale-out": remove });
	if (props.className) {
		cls = cx(cls, props.className);
	}

	return (
		<div
			className={cls}
			// onClick={() => {goal.emit("modal.Open", team)}}
		>
			<img src={crest} className="circle image" style={selectNone} />
			<span className="title" style={selectNone}>
				{team.shortName}
			</span>

			<p className="truncate">
				<a href={team.website} target="_blank" onClick={(e) => e.stopPropagation()}>
					{team.website}
				</a>
				<br />
				{/* <span className="dummy-text" style={selectNone}>
          Click this tab to see more infos.
        </span> */}
			</p>

			<a href="#" className="secondary-content" onClick={fn.removeClick}>
				<i className="material-icons">{goal.icons.remove}</i>
			</a>
		</div>
	);
}

export function TeamCard(props: { team: FBOrg.Team }) {
	const { team } = props;
	const fn = {
		onAnchorClick(evt: React.MouseEvent<HTMLAnchorElement>) {
			let attr = "data-action",
				el = evt.target as HTMLElement,
				act: string,
				evtName: string;

			if (el.classList.contains("material-icons") && el.tagName.toLowerCase() === "i") {
				el = el.parentElement;
			}

			act = el.getAttribute(attr);
			evtName = act === "add" ? "addTeam" : "removeTeam";
			goal.emit(evtName, team);
			evt.preventDefault();
		},
		addTeam(e: FBOrg.Team) {
			if (e.id === team.id) {
				setLike(true);
			}
		},
		removeTeam(e: FBOrg.Team) {
			if (e.id === team.id) {
				setLike(false);
			}
		},
	};

	let [liked, setLike] = useState(false);
	let crest = goal.Media.crestNull(team.crestUrl);
	let defColProps: ColProps = {
		s: 12,
		m: 4,
		l: 3,
		className: "team",
	};

	useEffect(function () {
		goal.trax(async (db) => {
			let data: FBOrg.Team = await db.get(team.id);
			if (typeof data !== "undefined") setLike(true);
		});

		goal.on("addTeam", fn.addTeam).on("removeTeam", fn.removeTeam);

		return () => {
			goal.off("addTeam", fn.addTeam).off("removeTeam", fn.removeTeam);
		};
	});

	let cardClass = `t-${team.tla.replace(" ", "-").replace(".", "")}`;
	return (
		<Col {...defColProps}>
			<Card
				className={cx(cardClass, { liked })}
				header={<CardTitle image={crest} />}
				horizontal
				actions={[
					<a
						key={`BtnAct:${team.tla}`}
						href="#"
						className="right act-store"
						data-action={liked ? "remove" : "add"}
						onClick={fn.onAnchorClick}
					>
						<Icon>{liked ? goal.icons.like : goal.icons.unlike}</Icon>
					</a>,
				]}
			>
				<p>
					<span className="team-name">{team.name}</span>
					<br />
					<span className="team-venue">{team.venue}</span>
				</p>
				<a className="email" href={team.website}>
					{team.website}
				</a>
			</Card>
		</Col>
	);
}

export class RandomMatch extends React.Component<{}, RandomState> {
  state: RandomState = {
    showLoading: false,
    elToShow: null,
    currentTeam: null,
    prevTeam: null,
    match: null,
    isCounting: false
  }

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

      if(json.matches.length === 0) {
        this.getTeamFromIDB();
        return
      }

      let arr = [];
      for(let k = (this.show - 1); k >= 0; k--) {
        let res = json.matches[rand(json.matches)];
        let newD = JSON.parse(JSON.stringify(res)) as FBOrg.Match<FBOrg.Team>;

        let hm = newD.homeTeam, aw = newD.awayTeam;

        if(hm.id === team.id) newD.homeTeam = team;
        else hm.crestUrl = goal.Media.crestFromUrl(hm.id);

        if(aw.id === team.id) newD.awayTeam = team;
        else aw.crestUrl = goal.Media.crestFromUrl(aw.id);
        arr.push(newD)
      }

      // this.setState({ currentTeam: newD });
      this.setState({ match: arr });
      setTimeout(() => {
        this.setState({ showLoading: false })
      }, 1000)
      setTimeout(() => {
        this.getTeamFromIDB();
        this.setState({
          isCounting: true
        })
      }, this.seconds * 1000);
    }
    catch(err) {
      throw err;
    }
  }

  getTeamFromIDB() {
    const {prevTeam, currentTeam} = this.state;

    if(currentTeam !== null) this.setState({ prevTeam: currentTeam });
    this.setState({ showLoading: true, isCounting: false })
    goal
    .trax((db) => db.getAll())
    .then((res: FBOrg.Team[]) => {
      if(res.length === 0) {
        this.setState({ match: null })
        return;
      }
      let rand = function() { return Math.floor(Math.random() * res.length) };
      let team = res[rand()];

      if(prevTeam !== null && prevTeam.id === team.id) {
        team = res[rand()];
      }

      this.setState({ currentTeam: team });
      this.getMatch(team);
    })

  }

  componentDidMount() {
    this.getTeamFromIDB();

    goal.on("addTeam", (e) => {
      const {match} = this.state
      if(match === null) { this.getMatch(e) }
    })
  }

  convertDate(str: string) {
    let d = new Date(str);
    return d.toDateString().split(" ")
      .map(i => goal.Media.Day(i))
      .map(i => goal.Media.Month(i))
      .join(" ");
  }

  render() {
    let match = this.state.match
    let matchNull = match === null;

    return (
      <table className="matches">

        <thead>

          <tr className="buttons">
            <td colSpan={3}>
              *Showing {this.show} random upcoming match{this.show > 1 ? "es": null} every {this.seconds} second.
            </td>
          </tr>
          <tr>
            <td className="logo">Home</td>
            <td>vs</td>
            <td className="logo">Away</td>
          </tr>

        </thead>

        <tbody className={cx({ "loading": this.state.showLoading })} >
          {matchNull? <tr><td colSpan={3}><div>No team(s) to show.</div></td></tr> :
            match.map((el, n) => {
              return (
                <RandomChild
                  key={`comp${n}-${el.id}`}
                  data={el}
                  convertDate={this.convertDate}
                  matchNull={matchNull}
                />
              )
            })
          }
        </tbody>
      </table>
    )
  }
}

function RandomChild(props: RandomChildProps) {
  const {matchNull, data, convertDate} = props;

  return (
    <tr>
    {/* column 1 */}
      <td className="logo">
        {matchNull? null : (<img src={data.homeTeam.crestUrl} alt="logo"/>)}
      </td>

    {/* column 2 */}
      <td>
        { matchNull ? <div>Empty</div> : (
          <>
            <div className="text-info">
              <p>
                <span className="comp">
                  {data.competition.name}
                </span>
                <br/>
                <span className="date">
                  {convertDate(data.utcDate)}
                </span>
              </p>
            </div>
            <Preloader active color="red"/>
          </>
        )}
      </td>

    {/* column 3 */}
      <td className="logo">
        {matchNull? null : (<img src={data.awayTeam.crestUrl} alt="logo"/>)}
      </td>
    </tr>
  )
}


type AutoCompleteData = ObjectMapType<string>;
interface CustomACProps {
	refInstance?: (ins: M.Autocomplete) => void;
	id?: string;
	className?: string;
	s?: number;
	m?: number;
	l?: number;
	xl?: number;
	icon?: string;
	title?: string;
	options: Partial<M.AutocompleteOptions> & {
		data: AutoCompleteData;
	};
	placeHolder?: string;
	onChange?(evt: React.FormEvent<HTMLInputElement>): void;
	onInput?(evt: React.FormEvent<HTMLInputElement>): void;
	inputAttributes?: React.InputHTMLAttributes<HTMLInputElement>;
}

interface TeamCollectionProps {
	className?: string | classNameObj;
	team: FBOrg.Team;
}
interface RandomState {
  showLoading: boolean;
  elToShow: JSX.Element;
  currentTeam: FBOrg.Team;
  prevTeam: FBOrg.Team;
  match: FBOrg.Match<FBOrg.Team>[]
  isCounting: boolean
}
interface RandomChildProps {
  data: FBOrg.Match<FBOrg.Team>;
  matchNull: boolean;
  convertDate(str: string): string;
}

export interface PagesBaseProps {
	currentPage: string;
}
export type classNameObj = ObjectMapType<boolean>;

type ObjectMapType<T> = {
	[k: string]: T;
};
