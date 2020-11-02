import {utils} from "./mix";

export async function registerSW() {
  console.log("Registering service worker...")
  try {
    let res = await navigator.serviceWorker.register("sw.js");
    console.log("serviceWorker registered.");
    return res
  } catch (err) {
    console.error("failed to register serviceWorker", err);
    throw err;
  }
};

export function registerSubs(options?: { logSubKeys?: boolean }) {
  return (async function() {
    let keys: KeysJSON = await (await fetch("./assets/keys.json")).json();

    return Notification.requestPermission()
    .then( async (res) => {
      if(res === "denied" || res === "default") {
        console.warn("Notification disabled");
        return;
      }

      if("PushManager" in window) {
        const {vapidKeys} = keys;
        const reg = await navigator.serviceWorker.ready;
        function base64ToUint8Array(b64: string) {
          const
            pad = "=".repeat((4 - b64.length % 4) % 4),
            base64 = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/"),
            rawData = window.atob(base64),
            arr = new Uint8Array(rawData.length);

          for(let i = 0; i < rawData.length; i++) {
            arr[i] = rawData.charCodeAt(i);
          };
          return arr;
        };

        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(vapidKeys.publicKey)
        })
        .then( subs => {
          function encr(type: "p256dh" | "auth") {
            return btoa(String.fromCharCode.apply(
              null,
              //@ts-ignore
              new Uint8Array(subs.getKey(type))
            ));
          };

          if(utils.isObject(options) && options.logSubKeys) {
            console.log("Subscribe endpoint: \n", subs.endpoint);
            console.log("Subscribe p256dh key: \n", encr("p256dh"));
            console.log("Subscribe auth key: \n", encr("auth"));
          }

          return {
            endpoint: subs.endpoint,
            p256dh: encr("p256dh"),
            auth: encr("auth")
          };

        });
      }
    })
  })();
};

interface KeysJSON {
  fcmSenderId: string,
  vapidKeys: {
    publicKey: string
    privateKey: string
  }
}
