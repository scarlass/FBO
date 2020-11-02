import { openDB, IDBPObjectStore, IDBPTransaction } from "idb";

const DB = openDB("basic", 1, {
	upgrade: function (upg) {
		if (!upg.objectStoreNames.contains("area")) {
			let area = upg.createObjectStore("area");
			area.createIndex("countryCode", "countryCode", { unique: true });
			area.createIndex("name", "name");
		}

		if (!upg.objectStoreNames.contains("saved")) {
			upg.createObjectStore("saved");
		}
	},
});

// utilities
function toStr(o: any, type: string) {
	return Object.prototype.toString.call(o) === `[object ${type[0].toUpperCase() + type.slice(1)}]`;
}
function isArray(o: any): o is any[] {
	return toStr(o, "array");
}
function isUndefined(o: any): o is undefined {
	return toStr(o, "undefined");
}
function isNull(o: any): o is null {
	return toStr(o, "null");
}
function isObject(o: any, deep = true): o is any {
	switch (deep) {
		case false: {
			return toStr(o, "object");
		}
		default: {
			return typeof o === "object";
		}
	}
}
function isString(o: any): o is string {
	return toStr(o, "string");
}
function isNumber(o: any): o is number {
	return toStr(o, "number");
}
function isRegex(o: any): o is RegExp {
	return toStr(o, "regExp");
}

/**
 * Map an Object as a string parameter.
 * @example
 * // the object:
 * a = objectAsParam({
 *  plan: ["TIER_ONE", "TIER_FOUR"],
 *  year: 2033
 * })
 *
 * // end result
 * a = "plan=TIER_ONE,TIER_FOUR&&year=2033"
 *
 */
function objectAsParam(o: any) {
	if (typeof o === "object") {
		return Object.keys(o)
			.map((i, idx, arr) => {
				let length = arr.length - 1;
				let query = o[i];
				let result = `${i}=`;

				if (isArray(query) || isString(query) || isNumber(query)) {
					if (isArray(query)) result += query.join(",");
					else result += query;
				} else return "";
				if (idx < length) result += "&&";

				return result;
			})
			.join("");
	}
}

const fboKey = "4d2ccc78db9243899fcd2b23e87693ac",
	fboUrl = "https://api.football-data.org/v2/";
export function fetch(input?: RequestInfo, init?: RequestInit) {
	input = input || `${fboUrl}areas`;

	if (isString(input) && /(api\.football-data\.org)/.test(input)) {
		init = { headers: { "X-Auth-Token": fboKey } };
	}

	return window.fetch(input, init);
}

export const reqs: G.Request = {
	Area(filter: SearchAreaOptions = {}) {
		let f = "",
			url = fboUrl + "teams";

		if (filter.area) {
			f += "?areas=";

			if (isArray(filter.area)) f += filter.area.join(",");
			else f += filter.area;
		}

		return fetch(url + f);
	},

	Competitions(arg1?: any, arg2?: any) {
		let url = `${fboUrl}competitions`;

		switch (typeof arg1) {
			case "object": {
				url += `?${objectAsParam(arg1)}`;
				break;
			}
			case "number": {
				arg2 = arg2 || {};
				url += `/${arg1}/${arg2.searchFor}`;

				if (arg2.filter) url += "?" + objectAsParam(arg2.filter);
				break;
			}
			default: {
			}
		}

		return fetch(url);
	},

	Team(teamId: number, filter: SearchTeamOptions = {}) {
		if (isUndefined(teamId)) throw Error('Argument "teamId" is missing.');
		let url = `${fboUrl}teams/${teamId}/`;
		let check = /(&&)$/;

		if (isObject(filter.matches)) {
			let m = filter.matches;
			let fltArr: string[] = [];
			url += "matches?";

			for (let k in m) {
				let fltObj = m[k];
				let flt = k + "=";

				if (isArray(fltObj)) flt += fltObj.join(",");
				else flt += fltObj;

				fltArr.push(flt);
			}

			url += fltArr.join("&&");
		}
		return fetch(url);
	},

	async Trax<T>(
		type: "readwrite" | "readonly" | G.TraxCallback<T> | G.TraxOptions,
		callback?: G.TraxCallback<T, any>
	) {
		let idb = await DB;
		let tx: IDBPTransaction<unknown, [any]>;
		let db: IDBPObjectStore<unknown, any, any>;
		let result: any;

		switch (typeof type) {
			case "string": {
				tx = idb.transaction("saved", type);
				db = tx.objectStore("saved");

				result = await callback(db);
				break;
			}
			case "function": {
				tx = idb.transaction("saved");
				db = tx.objectStore("saved");

				result = await type(db);
				break;
			}
			case "object": {
				tx = idb.transaction(type.storeName, type.mode);
				db = tx.objectStore(type.storeName);

				result = await callback(db);
				break;
			}
			default: {
			}
		}

		return result;
	},
};

export const utils: G.Utility = {
	isArray,
	isUndefined,
	isNull,
	isObject,
	isString,
	isNumber,
	isRegex,
};
export const DataBase = DB;

// Declarations ###########################################################
export interface SearchTeamOptions extends SearchOptions {
	matches?: {
		status?: FBOrg.Filter.StatusKeys | FBOrg.Filter.StatusKeys[];
		limit?: number;
		venue?: "HOME" | "AWAY";

		/**
		 * YY-MM-DD
		 * @example "2018-11-06"
		 */
		dateFrom?: string;

		/**
		 * YY-MM-DD
		 * @example "2018-11-06"
		 */
		dateTo?: string;
	};
}
export interface SearchAreaOptions extends SearchOptions {
	area?: number | number[];
}
export interface SearchCompetitionOptions extends SearchOptions {}
export interface SearchSpecificCompetitionOptions<T> {
	searchFor: T;
	filter?: CompetitionSearchMap[this["searchFor"] extends keyof CompetitionSearchMap
		? this["searchFor"]
		: never];
}

export interface CompetitionSearchMap {
	teams: CompetitionTeamFilter;
	matches: CompetitionMatchesFilter;
	standings: CompetitionStandingsFilter;
}
interface CompetitionTeamFilter {
	season?: string | number;
	// stage?: any
}
interface CompetitionMatchesFilter {
	/** @example 2018-06-22 */
	dateFrom?: string;
	/** @example 2019-10-01 */
	dateTo?: string;
	status?: FBOrg.Filter.StatusKeys;
	/** Year. */
	season?: string | number;
}
interface CompetitionStandingsFilter {
	/** @default "HOME" */
	standingType?: FBOrg.Filter.standingTypeKeys;
}

interface SearchOptions {}
