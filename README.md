# Isomorphic Callback Batcher
## Introduction
This library provides a simple tool for in-memory rate-limiting of function
invocation in both the browser and in node. Key features:
  - The developer can choose between rate-limiting algorithms with different
  "burstiness" characteristics
  - The next call after a series of throttled calls is passed a count of
  previously throttled calls, which is useful for situations in which the
  developer needs to track occurrences of a certain event without impacting
  each occurence creating load on a scarce resource
  - Callback functions passed to the batcher utility can be assigned a unique
  hash, allowing a single batcher instance to separately rate-limit many
  distinct kinds or categories of event

This tool is ideal for situations where (for example) a client application
issues repeating log, error, or analytics events which must all be tracked, but
where there is also a need to minimize load on a logging or tracking service.

## Installation
```
TODO: add installation instructions when published to NPM
```
This package has no runtime dependencies.

## Basic Usage



## Keeping State Per-Callback State

## Strategies

## Caveats
The rate-limiting strategies employed by this library make use of `setInterval`
internally. Many browser environments choose to [throttle timers on inactive or
hidden pages](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/).
This means that the rate of callback invocation may drop substantially below
the configured rate.

Batching will work correctly, however. If a Leaky Bucket batcher configured to
refill buckets every second is throttled by the browser to instead add
tokens only every ten seconds, the `count` value passed to the callback will
ensure that no calls were missed


## Development
