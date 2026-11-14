# Take a multiplayer encounter from local play to hosting

Use this walkthrough with Multiplayer & Multi-user Support. It is a setup and verification guide, not evidence that a particular project has a running server. Save the project's actual commands, pinned versions, addresses, owner, and results in its own runbook. Check the linked official instructions again when setting up a service; versions, plans, and account screens change.

## 1. Prove two local players

Choose the mode in the vision. Shared-screen and split-screen play need two input assignments and one simulation. Give each player an ID, controls, and a HUD. In split screen, create two viewports following different players and keep each HUD inside its viewport. Decide whether pause stops everybody and what happens when a controller disconnects. Complete one encounter, restart, and swap controllers to check ownership.

An online game instead starts with a local server and two clients. For a TypeScript browser game, an authoritative room framework such as Colyseus is a practical starting point. Use its current [server creation guide](https://docs.colyseus.io/getting-started) and [Phaser tutorial](https://docs.colyseus.io/learn/tutorial/phaser/basic-player-movement), pin compatible versions, and retain the generated lockfile. Adapt examples to the project's engine rather than assuming the tutorial's version matches.

Give the project explicit commands for starting the server, starting the client, building each, and checking health. Record the ports. Keep server secrets outside the client bundle. Open two clients to the same room and finish the actual encounter, including its failure and retry. For movement, send input intentions with sequence information; the server validates them, advances the simulation, and distributes results. Remote clients interpolate state; prediction needs reconciliation. [Colyseus state synchronization](https://docs.colyseus.io/state)

Record each entity's ID, world or zone, x/y coordinates, facing, and action. Define coordinate units and update timing. Save durable identity, inventory, and progress separately from live session state. For a persistent world, prove a save and return before adding more zones.

## 2. Let a second device join the local host

Keep the server on one machine and connect another device on the same LAN. Bind the intended service to an interface the second device can reach. Use the host's LAN address in the client's endpoint configuration; `localhost` on the guest points back to the guest itself. Permit only the required service ports through the host firewall. Serve a production client build for the release check rather than assuming a development server is a release host.

Check both the page address and game-server address. Loading the page does not prove the WebSocket connection works. Confirm two distinct player IDs, matching movement and outcomes, and clean departure. Document the actual join URL and how the host starts and stops the service.

## 3. Invite remote players to the local host

Prefer an existing private VPN for a small invited test. Both devices need the appropriate access. Share the game service with the intended players, restrict access to its required ports, and try joining from a different network. Keep a visible host-offline message when the computer sleeps or the service stops.

For a Tailscale setup, Serve can expose a local web service privately over HTTPS. A typical proxy command is `tailscale serve --bg http://127.0.0.1:2567`; inspect `tailscale serve status` for the address and active configuration. This command assumes the game service is actually listening on port 2567. Configure the client to reach the corresponding encrypted game endpoint, then verify the WebSocket handshake and play. Check existing Serve configuration before altering it. Use the [current Serve reference](https://tailscale.com/docs/reference/tailscale-cli/serve) and [device sharing instructions](https://tailscale.com/docs/features/sharing) for access and removal.

A VPN invitation is different from a public join link. If players must join without a VPN, choose a public encrypted reverse proxy/tunnel supported by the protocol, or use a cloud host. Direct router forwarding requires a reachable public address, a narrow firewall rule, TLS for browser connections, and an external join test. Carrier-grade NAT can prevent inbound forwarding. For peer-to-peer WebRTC, plan signaling and STUN/TURN connectivity; a browser client does not become an internet-reachable host just because it displays a room code. [MDN connectivity guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Connectivity)

## 4. Choose a cloud host and operating budget

Use the local evidence to estimate the required player count, CPU, memory, bandwidth, region, and storage. Start with one server process for a small room game. Choose a managed game host if reducing server administration matters most, or a small Linux VM if the operator wants control and can maintain it. Record the current price, backup cost, traffic allowance, spending alerts, account owner, and teardown steps before provisioning. Scaling decisions should follow measurements.

For an example VM route, use the provider's account to create a Linux instance in a nearby region, select capacity, add an SSH key, and record the assigned address. [DigitalOcean's current creation guide](https://docs.digitalocean.com/products/droplets/how-to/create/) walks through those provider controls. These instructions guide a setup; they do not authorize buying a server or changing an existing account.

Install the runtime required by the pinned server version. Deploy the tested revision under a dedicated service user. Install its locked dependencies, build, and provide environment variables through the host's secret/configuration mechanism. Keep the internal game port private and place a TLS reverse proxy in front. Run the server under a service manager with restart behavior and logs, then test a host reboot. Use [Colyseus deployment guidance](https://docs.colyseus.io/deployment) for the framework-specific production details.

## 5. Connect the public game to the server

Point a game-server hostname at the VM and confirm DNS. Configure a reverse proxy and certificate. For example, after installing Caddy as a service, this Caddyfile proxies a hostname to an already running local game service:

```text
play.example.com {
    reverse_proxy 127.0.0.1:2567
}
```

Replace the example hostname and port with the project's values. DNS, reachable certificate-validation ports, and a working backend are prerequisites. Caddy's [reverse proxy guide](https://caddyserver.com/docs/quick-starts/reverse-proxy) covers setup and HTTPS behavior. Check the provider and host firewall; expose the public web ports, restrict administration, and keep storage private.

Configure the client's production endpoint for the actual host. Use HTTPS for the page and secure WebSockets for the game connection. Rebuild the client if the endpoint is compiled into it. Verify room creation, join authorization, allowed origins where applicable, and a version mismatch message. A static website host can serve the client files; it does not automatically run a long-lived authoritative game server.

Now use two real devices on separate networks to join, finish, leave, and return. Capture client/server revisions and logs. Test an invalid move, repeated reward request, and unauthorized join. Confirm the server enforces the rules and clients converge on the same result.

## 6. Operate and grow only what is proved

Write the commands for status, health, logs, restart, deployment, rollback, and shutdown. For saved progress, schedule backups and restore one into an isolated test environment. Check the restored player state in the game. Define what happens to active rooms during an update and how incompatible clients are rejected. Assign someone to service failures and player reports.

For PvE, run shared enemies and rewards under server rules. For PvP, test simultaneous hits, match ending, and latency without trusting client claims of victory. For persistent worlds, add accounts, durable transactions, zone ownership, reconnect policy, and area-of-interest filtering as the scope requires. Test zone transfers for lost or duplicated players and rewards. Load-test the promised population with representative activity and record latency, bandwidth, CPU, memory, and failure thresholds.

When one process no longer meets measured needs, evaluate additional rooms, processes, or zones and the framework's [scaling requirements](https://docs.colyseus.io/scalability). A two-player demonstration is not a capacity test for a persistent MMO. Keep untested targets visible in the chapter checklist.

## Completion record

| Check | Record |
| --- | --- |
| Local mode | Two independent players finish and restart; cameras and controls pass |
| LAN | Two real devices join and agree on outcomes |
| Private remote | Invited player joins from another network; access removal works |
| Public cloud | Exact deployment accepts remote players; TLS and version handling pass |
| Recovery | Client reconnect, host/server restart, and any required restore pass |
| Capacity | Stated population and activity pass measured limits |
| Operations | Another operator can follow setup, health, logs, update, rollback, and shutdown |

Mark each required row Pass, Fail, or Unverified with evidence. Use N/A with a reason for modes outside the release. Keep the guide's instructions distinct from what the project has actually demonstrated.
