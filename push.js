const
  wp = require("web-push"),
  keys = require("./keys.json")
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
    end: "",
    p256: "",
    auth: "",
  }),
  "WebPush: Hello :)",
  options
)
.catch(err => {
  throw err
})