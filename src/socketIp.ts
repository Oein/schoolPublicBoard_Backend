import { DefaultEventsMap } from "socket.io/dist/typed-events";
import is from "./is";
import { Socket } from "socket.io";

export function getClientIpFromXForwardedFor(value: any) {
  if (!is.existy(value)) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  var forwardedIps = value.split(",").map(function (e) {
    var ip = e.trim();

    if (ip.includes(":")) {
      var splitted = ip.split(":");

      if (splitted.length === 2) {
        return splitted[0];
      }
    }

    return ip;
  });

  for (var i = 0; i < forwardedIps.length; i++) {
    if (is.ip(forwardedIps[i])) {
      return forwardedIps[i];
    }
  }

  return null;
}

export default function getSocketioIp(
  client: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  if (client.request.headers) {
    if (is.ip(client.request.headers["x-client-ip"])) {
      return client.request.headers["x-client-ip"] as string;
    }

    var xForwardedFor = getClientIpFromXForwardedFor(
      client.request.headers["x-forwarded-for"]
    );

    if (is.ip(xForwardedFor)) {
      return xForwardedFor;
    }

    if (is.ip(client.request.headers["cf-connecting-ip"])) {
      return client.request.headers["cf-connecting-ip"] as string;
    }

    if (is.ip(client.request.headers["fastly-client-ip"])) {
      return client.request.headers["fastly-client-ip"] as string;
    }

    if (is.ip(client.request.headers["true-client-ip"])) {
      return client.request.headers["true-client-ip"] as string;
    }

    if (is.ip(client.request.headers["x-real-ip"])) {
      return client.request.headers["x-real-ip"] as string;
    }

    if (is.ip(client.request.headers["x-cluster-client-ip"])) {
      return client.request.headers["x-cluster-client-ip"] as string;
    }

    if (is.ip(client.request.headers["x-forwarded"])) {
      return client.request.headers["x-forwarded"] as string;
    }

    if (is.ip(client.request.headers["forwarded-for"])) {
      return client.request.headers["forwarded-for"] as string;
    }

    if (is.ip(client.request.headers.forwarded)) {
      return client.request.headers.forwarded;
    }

    if (is.ip(client.request.headers["x-appengine-user-ip"])) {
      return client.request.headers["x-appengine-user-ip"] as string;
    }
  }

  if (is.existy(client.conn)) {
    if (is.ip(client.conn.remoteAddress)) {
      return client.conn.remoteAddress;
    }

    if (
      is.existy(client.request.socket) &&
      is.ip(client.request.socket.remoteAddress)
    ) {
      return client.request.socket.remoteAddress;
    }
  }

  if (
    is.existy(client.request.socket) &&
    is.ip(client.request.socket.remoteAddress)
  ) {
    return client.request.socket.remoteAddress;
  }

  if (client.request.headers) {
    if (is.ip(client.request.headers["Cf-Pseudo-IPv4"])) {
      return client.request.headers["Cf-Pseudo-IPv4"] as string;
    }
  }

  return null;
}
