import React from "react";
import { PagesBaseProps, StatusTab, RandomMatch } from "./Utils";
import { Row } from "react-materialize";
import cx from "classnames";

interface HomeProps extends PagesBaseProps {}
interface HomeState {
	readyState: boolean;
	connection: boolean;
	matchChild: JSX.Element[];
}
export default class HomePage extends React.Component<HomeProps, HomeState> {
	constructor(p: HomeProps) {
		super(p);

		this.state = {
			readyState: goal.Status.readyState,
			connection: goal.Status.connection,
			matchChild: [],
		};

    this.upState = this.upState.bind(this);

		this.matchEmpty = (
			<div className="empty-team">
				<div>There's no team to show.</div>
			</div>
		);
	}

	matchEmpty: JSX.Element;

	upState(evt: G.Event.StatusEvent) {
		if (evt.type === "rs") {
			this.setState({ readyState: evt.newV });
		} else if (evt.type === "cn") {
			this.setState({ connection: evt.newV });
		}
	}

	async requestMatch(team: FBOrg.Team) {
		const res = await goal.request("team", team.id, {
			matches: {
				status: "SCHEDULED",
				limit: 5,
			},
		});
		console.log(res.url);
		return (await res.json()) as Promise<FBOrg.Team>;
	}

	componentDidMount() {
		goal.on("statusChanged", this.upState);
	}

	componentWillUnmount() {
		goal.off("statusChanged", this.upState);
		console.log(this);
	}

	render() {
		let { currentPage } = this.props;
		let { readyState: rs, connection: cn, matchChild: mc } = this.state;

		let statusStyle = {
			height: 23,
			width: 130,
		};

		let stateAttr = {
			rs: {
				state: rs,
				textCondition: {
					onTrue: "Ready",
					onFalse: "Getting Ready",
				},
				style: statusStyle,
			},
			cn: {
				state: cn,
				textCondition: {
					onTrue: "Online",
					onFalse: "Offline",
				},
				style: statusStyle,
			},
		};

		return (
			<Row className="pages page-home" style={{ display: currentPage === "home" ? null : "none" }}>
				<StatusTab statusOptions={[stateAttr.rs, stateAttr.cn]} />
        <RandomMatch />
      </Row>
		);
	}
}
