import { EventEmitter } from "events";
import { IDBPDatabase, IDBPObjectStore } from "idb";
import {
	SearchAreaOptions,
	SearchTeamOptions,
	SearchCompetitionOptions,
	SearchSpecificCompetitionOptions,
	CompetitionSearchMap,
} from "./src/mix";
import React from "react";
import ReactDOM from "react-dom";

declare global {
	// Main class declarations
	interface Goal extends EventEmitter {
		Areas?: { [id: string]: number };
		Modal?: G.Modal;
		Tabs?: G.Tabs;
		Subs?: G.SubscribeKeys;
		Saved?: FBOrg.Team[];

		readonly Status: G.Status;
		readonly Media: G.Media;

		readonly utils: G.Utility;
		readonly icons: G.Icons;
		readonly loading: G.Loading;

		on<T extends keyof G.Event.Maps>(
			type: T,
			listener: (this: this, evt: G.Event.Maps[T]) => void
		): this;
		on(type: string | symbol, listener: (this: this, ...args: any[]) => void): this;

		off<T extends keyof G.Event.Maps>(
			type: T,
			listener: (this: this, evt: G.Event.Maps[T]) => void
		): this;
		off(type: string | symbol, listener: (this: this, ...args: any[]) => void): this;

		attachError(el: HTMLElement, opt?: G.AttachErrorOptions): void;
		attachEmpty(el: HTMLElement, opt?: G.AttachMiscOptions): void;

		emit<T extends keyof G.Event.Maps>(evtName: T, eventObject?: G.Event.Maps[T]): boolean;
		emit(evtName: string | symbol, ...eventObject: any[]): boolean;

		setElems(store: G.Elements): void;
		getElems(namedEl: string): HTMLElement;

		request(
			reqType: "team",
			teamId: number,
			options?: G.ExtendedSearchOptions<SearchTeamOptions>
		): Promise<Response>;
		request(
			reqType: "area",
			options?: G.ExtendedSearchOptions<SearchAreaOptions>
		): Promise<Response>;


    trax<R, T extends G.TraxOptions>(
      options: T,
      callback: G.TraxCallback<R, T extends TraxOptions ? T["storeName"] : unknown>
    ): R;

    trax<T>(mode: G.TraxMode, callback: G.TraxCallback<T>): T;
    trax<T>(callback: G.TraxCallback<T>): T;
	}

	namespace G {
		type RequestType = "team" | "area" | "trax" | "competitions";
		type Elements = { [key: string]: HTMLElement };
		type ExtendedSearchOptions<T> = T & { showLoading?: boolean };

		type TraxStoreNames = "saved" | "area";
		type TraxMode = "readonly" | "readwrite";
		type TraxOptions = {
			/** @default "readonly" */
			mode?: "readonly" | "readwrite";
			storeName: TraxStoreNames;
		};
		type TraxCallback<RT = any, S = "saved"> = (dataBase: IDBPObjectStore<unknown, [S], S>) => RT;

		interface Request {
			/** request to: ```"/areas"```. */
			Area(filter?: SearchAreaOptions): Promise<Response>;

			/** request to: ```"/competitions/{compID}"```. */
			Competitions<T extends keyof CompetitionSearchMap>(
				competitionId: number,
				options?: SearchSpecificCompetitionOptions<T>
			): Promise<Response>;
			/** request to: ```"/competitions"```. */
			Competitions(filter?: SearchCompetitionOptions): Promise<Response>;

			/** request to: ```"/teams/{teamId}"```. */
			Team(teamId: number, filter?: SearchTeamOptions): Promise<Response>;

			/** request transaction to indexedDB using idb. */
			Trax<RT, T extends TraxOptions>(
				options: T,
				callback: TraxCallback<RT, T extends TraxOptions ? T["storeName"] : unknown>
			): RT;

			Trax<T>(mode: TraxMode, callback: TraxCallback<T>): T;
			Trax<T>(callback: TraxCallback<T>): T;
		}

		interface Utility {
			isArray(o: any): o is any[];
			isUndefined(o: any): o is undefined;
			isNull(o: any): o is null;
			isObject(o: any): o is any;
			isString(o: any): o is string;
			isNumber(o: any): o is number;
			isRegex(o: any): o is RegExp;
		}

		interface Icons {
			home: string;
			search: string;
			saved: string;
			like: string;
			unlike: string;
			remove: string;
			[k: string]: string;
		}

		interface Modal extends M.Modal {
			tabs: M.Tabs;
			tabMatch: HTMLDivElement;
			tabInfo: HTMLDivElement;
		}
		interface Tabs extends M.Tabs {}

		interface RequestAreaOptions extends SearchAreaOptions {
			/** @default false */
			showLoading?: boolean;
		}
		interface RequestTeamOptions extends SearchTeamOptions {
			/** @default false */
			showLoading?: boolean;
		}

		interface Loading {
			/** @default false */
			show(show?: boolean): Loading;
			text(text: string): Loading;
		}

		namespace Event {
			interface Maps {
				pageChanged: { page: string };
				statusChanged: StatusEvent;
				addTeam: FBOrg.Team;
				removeTeam: FBOrg.Team;
			}
			interface StatusEvent {
				readonly type: "cn" | "rs";
				readonly newV: boolean;
				readonly oldV: boolean;
			}
		}
	}
	namespace G {
		interface Status {
			connection: boolean;
			readyState: boolean;
		}

		interface AttachMiscOptions {
			text?: string;
			extendDefaultText?: boolean;
			remove?: boolean;
		}
		interface AttachErrorOptions extends AttachMiscOptions {
			hasHideClass?: boolean;
		}

		interface Media {
			crestNull<T extends FBOrg.Team>(team: T | string): string;
			addQuery(...trg: G.Media.QueryOptions[]): this;
      offQuery(entry: string): this;
      crestFromUrl(teamId: number): string;
			readonly registeredQuery: {
				[k: string]: { scr: MediaQueryList; fn: () => void };
      };
      
      Month(str: string): string;
      Day(str: string): string;
		}

		namespace Media {
			interface QueryOptions {
				/**
				 * ```js
				 * "max" = "max-width".
				 * "min" = "min-width".
				 * ```
				 */
				type: "max" | "min";
				/** if number it will set in pixel. */
				at: number | string;
				dimensions?: "height" | "width";
				onMatch: (scr: MediaQueryList) => void;
				onMissmatch: (scr: MediaQueryList) => void;
			}
		}

		interface SubscribeKeys {
			auth: string;
			endpoint: string;
			p256dh: string;
		}
	}

	var goal: Goal;
	var goalSW: {
		runRegist: boolean;
		logging: boolean;
	};

	namespace FBOrg {
		interface Team {
			address: string;
			area: { id: number; name: string };
			clubColors: string;
			crestUrl: string;
			email: string;
			founded: number;
			id: number;
			lastUpdated: string;
			name: string;
			phone: string;
			shortName: string;
			tla: string;
			venue: string;
			website: string;
			squad?: Player[];
		}

		interface SearchTeamsRegion {
			count: number;
			filters: {
				areas?: number[];
				permission?: string[];
			};
			teams: Team[];
		}

		interface Area {
			countryCode: string;
			ensignUrl: null | undefined | any;
			id: number;
			name: string;
			parentArea: string;
			parentAreaId: number;
		}
		interface SearchArea {
			areas: Area[];
			count: number;
			filters: any;
		}

		interface Match<HM = { id: number; name: string }, AW = HM> {
			id: number;
			awayTeam: AW;
			homeTeam: HM;
			competition: {
				area: {
					code: string;
					ensignUrl: string;
					name: string;
				};
				id: number;
				name: string;
			};
			stage: string;
			lastUpdated: string;
			matchDay: string;
			referees: any[];
			score: {
				winner: string;
				duration: string;
				extraTime: XTime;
				fullTime: XTime;
				halfTime: XTime;
				penalties: XTime;
			};
			odds: { msg: string };
			status: string;
			utcDate: string;
		}
		interface SearchMatch {
			count: number;
			filters: { limit: number; permission: G.ReqTeamAreaPermit };
			matches: Match[];
		}

		interface XTime {
			homeTeam: any;
			awayTeam: any;
		}

		interface Player {
			id: number;
			countryOfBirth: string;
			dateOfBirth: string;
			name: string;
			role: string;
			position: string;
			shirtNumber?: any;
		}

		namespace Filter {
			type StatusKeys =
				| "SCHEDULED"
				| "LIVE"
				| "IN_PLAY"
				| "PAUSED"
				| "FINISHED"
				| "POSTPONED"
				| "SUSPENDED"
				| "CANCELED";
			type standingTypeKeys = "TOTAL" | "HOME" | "AWAY";
		}
	}

	namespace ElStatus {
		interface Props {
			statusOptions?: ChildsOptions[];
		}
		interface ChildsOptions {
			state: boolean;
			textCondition: {
				onTrue: string;
				onFalse: string;
			};
			style?: React.CSSProperties;
			s?: number;
			m?: number;
			l?: number;
			xl?: number;
		}
	}

	namespace ElLoader {
		interface Props<T> {
			show: boolean;
			active?: boolean;
			color?: "red" | "blue" | "green" | "yellow";
			size?: "big" | "medium" | "small";
			flashing?: boolean;
			text?: string;
			id?: string;
			children?: JSX.Element[] | JSX.Element;
			className?: string | T;
		}
	}

	namespace ElNav {
		interface ContainerProps {
			className?: string;
			selected?: string;
			setBtnChilds: ButtonsProps[];
		}
		interface ButtonsProps {
			pageName: string;
			icons?: string;
			text?: string;
		}
	}
}
