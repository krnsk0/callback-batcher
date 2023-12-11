# Callback Batcher

![](https://img.shields.io/badge/Coverage-100%25-83A603.svg?prefix=$coverage$)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> [Browser Demo](https://callback-batcher.vercel.app) 👀

Built at @Tubitv

## Introduction

This library provides a simple tool for in-memory rate-limiting of function
invocation in both the browser and in node. Key features:

- The developer can choose between rate-limiting algorithms with different
  "burstiness" characteristics
- The next call after a series of throttled calls is passed a count of
  previously throttled calls, which is useful for situations in which the
  developer needs to track occurrences of a certain event without impacting
  each occurence creating load on a scarce resource
- Callback functions passed to the batcher utility can be assigned an
  identifier string, allowing a single batcher instance to separately rate-limit
  many distinct kinds or categories of event

This tool is ideal for situations where--for example--a client application
issues repeating log, error, or analytics events which must all be tracked, but
where there is also a need to minimize load on a logging or tracking service.

## Installation

```
TODO: add installation instructions when published to NPM
```

This package has no runtime dependencies.

## Basic Usage

The `makeCallbackBatcher` function, given a configuration, returns a batcher
object:

```ts
const batcher = makeCallbackBatcher({
  maxTokens: 3,
  tokenRate: 1000,
});
```

This object exposes two functions. The first, `schedule`, is used to request
invocation of a callback, subject to a rate limit:

```ts
const batcher = makeCallbackBatcher({
  maxTokens: 3,
  tokenRate: 1000,
});
batcher.schedule(() => console.log('invoked!')) > 'invoked!';
```

If we schedule callback invocations more quickly than the rate limit allows,
some calls will be throttled, invoked only after some time. When invoked, the
callbacks will be passed a `count` telling us how many calls were throttled
in between the last sucessful scheduled invocation and the current one:

```ts
const batcher = makeCallbackBatcher({
  maxTokens: 3,
  tokenRate: 1000
});

for (let i = 0; i < 6; i += 1) {
  batcher.schedule((c) => console.log('invoked! count: ${c}'))
}
> 'invoked! count: 1'
> 'invoked! count: 1'
> 'invoked! count: 1'
then after 1000ms...
> 'invoked! count: 3'
```

The second function on the batcher object, `disposer`, cleans up the timers
used internally by the batcher, immediately making any trailing, batched
invocations:

```ts
const batcher = makeCallbackBatcher({
  maxTokens: 3,
  tokenRate: 1000,
});

for (let i = 0; i < 6; i += 1) {
  batcher.schedule((c) => console.log('invoked! count: ${c}'));
}
batcher.dispose() >
  'invoked! count: 1' >
  'invoked! count: 1' >
  'invoked! count: 1' >
  'invoked! count: 3';
```

## Keeping State Per-Callback

The scheduler function on the batcher also accepts a second optional string
argument. Called a "callback identifier hash", this value is meant to uniquely
identify a callback to the batcher. This allows the batcher to separately
track state for different callbacks.

```ts
const batcher = makeCallbackBatcher({
  maxTokens: 3,
  tokenRate: 1000,
});

// max out `callback-a`
for (let i = 0; i < 3; i += 1) {
  batcher.schedule((count) => console.log(`A ${count}`), 'callback-a');
}

// callback b will still be invoked as soon as it is scheduled
batcher.schedule((count) => console.log(`B ${count}`), 'callback-b') >
  'A 1' >
  'A 1' >
  'A 1' >
  'B 1';
```

## Strategies

The `makeCallbackBatcher` factory function can optionally be passed a `strategy`
argument that specifies which algorithm to use for rate limiting. The various
algorithms have their own configuration parameters.

The _Leaky Bucket_ strategy assignes each callback a token bucket to which
tokens are added at `tokenRate` (in milliseconds), with an initial and maximum
value of `maxTokens`. Under callback invocation pressure, this strategy allows
initial bursts of size `maxTokens`, with a trickle of batched calls following
determined by `tokenRate`.

```ts
const batcher = makeCallbackBatcher({
  strategy: 'LEAKY_BUCKET',
  maxTokens: 3,
  tokenRate: 1000,
});
```

The _Windowed Rate Limiter_ strategy keeps track of when invocations were
previously requested for each callback identifier hash over a window of length
`windowSize` (in milliseconds). If invoked more than `callsPerWindow` during
this backwards-looking window, the callback is throttled. Batch invoations
take place when calls slow down, or every `windowSize` milliseconds (to ensure
that tailing calls are captured when there are no more invocations).

```ts
const batcher = makeCallbackBatcher({
  strategy: 'WINDOWED_RATE_LIMITER',
  windowSize: 1000,
  callsPerWindow: 2,
});
```

When not passed a `strategy` argument, `makeCallbackBatcher` by default selects
the Leaky Bucket strategy.

[This in-browser demo](https://callback-batcher.vercel.app/) vizualizes the
varying timing charactaristics of the strategies.

## Caveats

The rate-limiting strategies employed by this library make use of `setInterval`
internally. Many browser environments choose to [throttle timers on inactive or
hidden pages](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/).
This means that the rate of callback invocation may drop substantially below
the configured rate.

However, if a Leaky Bucket batcher configured to refill buckets every second is
throttled by the browser to instead add tokens only every ten seconds, the
`count` value passed to the callback will be correct, ensuring that while the
rate of callback invocation may slow, invocations can be tracked.

In a browser context, it may make sense to invoke the `disposer` cleanup
function on the batcher in a `beforeunload` event. In addition to cleaning up
`setInterval`s used internally, disposers make any tailing batched calls,
ensuring that throttled callbacks are not "missed".

## Development

To make change to this library, clone it, run `yarn install`, and then
`yarn run start`. This will launch the in-browser demo, which is useful for
verifying that changes have their intended effects.

Unit tests (written using `vitest`) can be run via `yarn test`.
