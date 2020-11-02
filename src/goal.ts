import { reqs as req, utils, fetch } from "./mix";
import * as sw from "./registerSW";
import { EventEmitter } from "events";

if (!utils.isUndefined(goalSW) && goalSW.runRegist) {
	sw.registerSW().then((res) => {
		sw.registerSubs({
			logSubKeys: goalSW.logging,
		});
	});
}

const {
	isArray: isArr,
	isObject: isObj,
	isUndefined: isUnd,
	isNull,
	isString: isStr,
	isNumber: isNum,
	isRegex: isRex,
} = utils;

let AreaReady = false;

// ############################################################
const State = {
		cn: false,
		rs: false,
	},
	Media = {
		icons: {
			home: "home",
			search: "search",
			saved: "folder_special",
			like: "star",
			unlike: "star_border",
			remove: "remove_circle",
		},
	},
	Els: G.Elements = {};

window.goal = new (class Goal extends EventEmitter implements globalThis.Goal {
	Areas?: { [id: string]: number };
	Modal?: G.Modal;
	Tabs?: G.Tabs;
	Saved?: FBOrg.Team[];

	get utils(): G.Utility {
		return utils;
	}
	get icons(): G.Icons {
		return Media.icons;
	}
	get loading(): G.Loading {
		let load = Els.loading;
		let $text = load.querySelector(".loading-text");

		$text.innerHTML = "Loading . . .";

		return {
			show(show = false) {
				if (show) {
					load.classList.remove("hide");
					load.classList.remove("stop");
				} else {
					load.classList.add("hide");
					load.classList.add("stop");
				}
				return this;
			},
			text(text: string) {
				$text.innerHTML = text;
				return this;
			},
		};
	}

	Status: G.Status = (() => {
		const t = this;
		return {
			set connection(val) {
				const fix = State.cn;
				t.emit("statusChanged", {
					type: "cn",
					newV: State.rs = val,
					oldV: fix,
				});
			},
			get connection() {
				return State.rs;
			},
			set readyState(val) {
				const fix = State.rs;
				t.emit("statusChanged", {
					type: "rs",
					newV: State.rs = val,
					oldV: fix,
				});
			},
			get readyState() {
				return State.rs;
			},
		};
	})();

	Media: G.Media = (() => {
		const t = this;
		const querysFn: {
			[k: string]: { scr: MediaQueryList; fn: () => void };
		} = {};

		return {
			crestNull<T extends FBOrg.Team>(team: T | string) {
				let crest: string,
					blank = "./assets/logo_blank.webp";

				function condition(s: boolean, def: string) {
					return s ? blank : def;
				}

				switch (typeof team) {
					case "string": {
						crest = condition(team === "" || team === null, team);
						break;
					}
					case "object": {
						if (isNull(team)) {
							crest = blank;
						} else {
							crest = condition(team.crestUrl === "" || team.crestUrl === null, team.crestUrl);
						}
						break;
					}
					default: {
						break;
					}
				}
				return crest;
			},

			addQuery(...query: G.Media.QueryOptions[]) {
				for (let obj of query) {
					let d = obj.dimensions || "width";
					let at = isStr(obj.at) ? obj.at : obj.at + "px",
						scr = window.matchMedia(`(${obj.type}-${d}:${at})`),
						noMatch = obj.onMissmatch,
						atMatch = obj.onMatch;

					function change() {
						if (scr.matches) {
							if (isUnd(atMatch)) return;
							atMatch(scr);
						} else {
							if (isUnd(noMatch)) return;
							noMatch(scr);
						}
					}

					scr.addEventListener("change", change);
					change();

					querysFn[`${obj.type}-${d}:${at}`] = {
						scr,
						fn: change,
					};
				}

				return this as G.Media;
			},

			offQuery(entry: string) {
				querysFn[entry].scr.removeEventListener("change", querysFn[entry].fn);
				delete querysFn[entry];
				return this as G.Media;
			},
			get registeredQuery() {
				return querysFn;
			},
			crestFromUrl(teamId: number) {
				return `https://crests.football-data.org/${teamId}.svg`;
      },
      Month(str: string) {
        let s = str.toLowerCase();
        let res: string;
        switch(s) {
          case "jan": {
            res = "January";
            break
          }
          case "feb": {
            res = "February";
            break
          }
          case "mar": {
            res = "March";
            break
          }
          case "apr": {
            res = "April";
            break
          }
          case "may": {
            res = "May";
            break
          }
          case "jun": {
            res = "June";
            break
          }
          case "jul": {
            res = "July";
            break
          }
          case "ags": {
            res = "Augusts";
            break
          }
          case "sep": {
            res = "September";
            break
          }
          case "oct": {
            res = "October";
            break
          }
          case "nov": {
            res = "November";
            break
          }
          case "des": {
            res = "December";
            break
          }
          default: res = str;
        }
        return res;
      },
      Day(str: string) {
        let res: string;
        switch(str.toLowerCase()) {
          case "sun": {
            res = "Sunday";
            break;
          }
          case "mon": {
            res = "Monday";
            break;
          }
          case "tue": {
            res = "Tuesday";
            break;
          }
          case "wed": {
            res = "Wednesday";
            break;
          }
          case "thu": {
            res = "Thursday";
            break;
          }
          case "fri": {
            res = "Friday";
            break;
          }
          case "sat": {
            res = "Saturday";
            break;
          }
          default: res = str;
        }
        return res;
      }
		};
	})();

	constructor() {
		super();

		this._initFetch();

		req
			.Trax(function (db) {
				return db.getAll();
			})
			.then((res: FBOrg.Team[]) => {
				this.Saved = res;
			});

		let t = setInterval(() => {
			if (AreaReady) {
				this.Status.readyState = true;
				this._init();
				clearInterval(t);
				this.emit("ready");
			}
			console.log("not ready");
		}, 100);
	}

	attachError(el: HTMLElement, opt: G.AttachErrorOptions = {}) {
		let text = "Connection failed.";

		if (opt.text) {
			if (opt.extendDefaultText) {
				text += opt.text;
			} else {
				text = opt.text;
			}
		}

		if (opt.remove) {
			el.classList.remove("error");
			el.innerHTML = "";
			if (opt.hasHideClass) el.classList.add("hide");
		} else {
			el.classList.add("error");
			el.innerHTML = `
      <div class="err-ctn">
        <h6 style="user-select: none;">${text}</h6>
      </div>`;
			if (opt.hasHideClass) el.classList.remove("hide");
		}
	}
	attachEmpty(el: HTMLElement, opt: G.AttachMiscOptions = {}) {
		let text = "No Data";

		if (opt.text) {
			if (opt.extendDefaultText) {
				text += opt.text;
			} else {
				text = opt.text;
			}
		}

		if (opt.remove) {
			el.classList.remove("empty-data");
			el.innerHTML = "";
		} else {
			el.classList.add("empty-data");
			el.innerHTML = `
      <div class="emp-ctn">
        <h6>${text}.</h6>
      </div>`;
		}
	}

	setElems(store: G.Elements) {
		if (typeof store !== "object") return;
		for (let k in store) Els[k] = store[k];
	}
	getElems(namedEl: string) {
		return Els[namedEl];
	}

  trax(arg1: any, arg2?: any) {
    return req.Trax(arg1, arg2);
  }
  request(type: "team" | "area", arg2?: any, arg3?: any) {
    switch(type) {
      case "area": {
        return req.Area(arg2);
      }
      case "team": {
        return req.Team(arg2, arg3);
      }
      default: break;
    }
  }

	private _setReadonly() {
		for (let k in this) {
			if (/^(_)/.test(k)) {
				Object.defineProperty(this, k, { enumerable: false });
			}
		}
		Object.defineProperties(this, {
			Status: { writable: false },
		});
	}
	private _init() {
		this._setReadonly();
		window.addEventListener("online", (e) => (this.Status.connection = true));
		window.addEventListener("offline", (e) => (this.Status.connection = false));

		let on = ["addTeam", "removeTeam"];
		for (let i of on) {
			this.on(i, (e: FBOrg.Team) => {
				req.Trax("readwrite", async (db) => {
					let has = await db.get(e.id);

					if (i === "addTeam") {
						if (isUnd(has)) {
							e.crestUrl = this.Media.crestNull(e);
							await db.add(e, e.id);
							this.emit("notif.AddedTeam", e);
						}
					} else await db.delete(e.id);

					req
						.Trax(function (db) {
							return db.getAll();
						})
						.then((res: FBOrg.Team[]) => {
							this.Saved = res;
						});
				});
			});
		}

		this.on("notif.AddedTeam", (e: FBOrg.Team) => {
			if (Notification.permission === "granted") {
				navigator.serviceWorker.ready.then((res) => {
					res.showNotification("Added to Saved List:", {
						requireInteraction: false,
						body: e.name,
						badge: "/assets/logo512.png",
					});
				});
			}
		});
	}

	private _initFetch() {
		fetch()
			.then((res) => res.json())
			.then((res: FBOrg.SearchArea) => {
				req.Trax(
					{
						storeName: "area",
						mode: "readwrite",
					},
					async (db) => {
						for (let k of res.areas) {
							const check = await db.get(k.id);
							if (isUnd(check)) db.put(k, k.id);
							this.Areas = this.Areas || {};

							this.Areas[k.name.toLowerCase()] = k.id;
						}
					}
				);

				return void 0;
			})
			.then(() => {
				goal.Status.connection = true;
				AreaReady = true;
			})
			.catch((err) => {
				goal.Status.connection = false;
				AreaReady = true;

				switch (typeof err) {
					case "string": {
						throw Error(err);
					}
					case "object": {
						console.error(err);
						throw Error("failed to fetch data");
					}
					default: {
					}
				}
			});
	}
})().setMaxListeners(100);

const asd = [];
// window["tests2"] = goal.recursiveFetch([], [64, 66, 65]);
// goal.recursiveFetch(asd, [64, 66, 65]);
window["tests"] = asd;
