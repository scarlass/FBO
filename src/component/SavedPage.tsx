import React, { useState } from "react";
import { PagesBaseProps, TeamCollection } from "./Utils";
import { Row, Col } from "react-materialize";

interface SavedProps extends PagesBaseProps {}
interface SavedState {
	collection: JSX.Element[];
}

export default class SavedPage extends React.Component<SavedProps, SavedState> {
	state: SavedState = {
		collection: [],
	};

	componentDidMount() {
		let clc: JSX.Element[] = [];
		goal
			.on("addTeam", (e) => {
				clc.push(<TeamCollection key={e.id} team={e} />);
				this.setState({ collection: clc });
			})
			.on("removeTeam", (e) => {
				let idx = clc.findIndex((i) => +i.key === e.id);
				if (idx === -1) return;

				setTimeout(() => {
					clc.splice(idx, 1);
					this.setState({ collection: clc });
				}, 350);
			})
			.trax(async (db) => {
				let res: FBOrg.Team[] = await db.getAll();
				return res;
			})
			.then((res) => {
				if (res.length !== 0) {
					clc = res.map((team) => {
						return <TeamCollection key={team.id} team={team} />;
					});
				}

				this.setState({
					collection: clc,
				});
			});
	}

	render() {
		let { currentPage } = this.props;
		let { collection } = this.state;

		return (
			<Row
				className="pages page-saved"
				style={{ display: currentPage === "saved" ? null : "none" }}>
				<div className="misc col s12">Teams Counter: {collection.length}</div>
				<div className="collection">{collection}</div>
			</Row>
		);
	}
}
