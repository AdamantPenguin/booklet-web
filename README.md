# Booklet Web
A relatively lightweight web-based client for Blooket.
The spiritual successor to BookletX.

## Improvements over blooket.com
Booklet Web uses only one bloated JS library - Firebase Realtime Database - which is required to connect to games.
Everything else is written in plain HTML, CSS and JS.
On the other hand, blooket.com uses React, Stripe, Google Analytics, and many smaller libraries,
which makes the site experience sluggish
(especially on low-end devices such as phones students might use in class)
and results in nearly 8 megabytes of data transfer on first load,
compared to only a couple hundred kilobytes up to 1 megabyte on Booklet Web.
Additionally, blooket.com loads all resources for the entire site regardless of the page you visit,
which leads to even more data being transferred in total.

## Features
### Currently implemented
* joining live games and answering questions for rewards

### Planned
Almost everything you can do on blooket.com, including:
* hosting live games
* logging in
* setting homework
* browsing (and possibly creating) sets

as well as:
* plugin system to allow extensibility
* different stylesheet options
