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



export interface PagesBaseProps {
	currentPage: string;
}
export type classNameObj = ObjectMapType<boolean>;

type ObjectMapType<T> = {
	[k: string]: T;
};
