const
  wp = require("web-push"),
  keys = require("./assets/keys.json")
;

wp.setVapidDetails(
  "mailto:example@yourdomain.org",
  keys.vapidKeys.publicKey,
  keys.vapidKeys.privateKey,
)

/**
 *
 * @param {string} end
 * @param {string} p256
 * @param {string} auth
 */
function pushSubs(p) {
  let {end, p256, auth} = p
  return {
    "endpoint": end,
    "keys": {
      "p256dh": p256,
      "auth": auth
    }
  }
}

const options = {
  gcmAPIKey: keys.fcmSenderId,
  TTL: 60
}

wp.sendNotification(
  pushSubs({
    end: "https://fcm.googleapis.com/fcm/send/fdtMJuXZbV4:APA91bE7e2HBS9kWhB8sr2j3ZyyGglANEQ7he3rTXaSOOOZhZMa26qKFF8sW7ZdZVfXu4bik-biBluiHlKmg7NFgI41lXUbULDGrVRk5VVDjkCCLo-v46O38aF0mIRcYoSjsNSMCSW_M",
    p256: "BH3lLz4n9Ee+PKgFdAglk4f9VqYqxZd31R2HF7p2THt6cA680qPcHovS/kD+zjV3lOWeR6SeFAsQosIZ8FaM8EY=",
    auth: "1FPmD+g6HiTCle1/dKWUdg=="
  }),
  "WebPush: Hello :)",
  options
)
.catch(err => {
  throw err
})